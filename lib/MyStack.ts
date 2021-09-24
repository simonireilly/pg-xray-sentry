import * as sst from '@serverless-stack/resources';
import * as rds from '@aws-cdk/aws-rds';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // IAM Secured DynamoDB table
    const table = new sst.Table(this, 'DynamoDbTableName', {
      fields: {
        pk: sst.TableFieldType.STRING,
        sk: sst.TableFieldType.STRING,
      },
      primaryIndex: {
        partitionKey: 'pk',
        sortKey: 'sk',
      },
      dynamodbTable: {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    });

    // Publicly accessible RDS aurora cluster that will put a secret into secrets
    // manager containing it credentials for access
    const cluster = new rds.DatabaseCluster(this, 'SharedDevelopmentDatabase', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_11_8,
      }),
      instanceProps: {
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
        vpc: ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true }),
        publiclyAccessible: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    cluster.connections.allowDefaultPortFromAnyIpv4();

    // Create an event receiver
    const topic = new sst.Topic(this, 'Topic', {
      subscribers: ['src/handlers/index.event'],
      defaultFunctionProps: {
        environment: {
          SENTRY_DSN: String(process.env.SENTRY_DSN),
          SECRET_NAME: String(cluster.secret?.secretArn),
        },
        bundle: {
          nodeModules: ['@sentry/serverless', 'pg', 'knex'],
        },
      },
    });

    // Create a HTTP API that has the following routes
    const api = new sst.Api(this, 'Api', {
      routes: {
        'GET /': 'src/handlers/index.api',
      },
      defaultFunctionProps: {
        bundle: {
          nodeModules: ['@sentry/serverless', 'pg', 'knex'],
          copyFiles: [
            { from: 'src/knex/migrations', to: 'src/knex/migrations' },
          ],
        },
        permissions: [
          [table.dynamodbTable, 'grantReadWriteData'],
          [topic.snsTopic, 'grantPublish'],
        ],
        environment: {
          TABLE_NAME: table.tableName,
          SECRET_NAME: String(cluster.secret?.secretArn),
          SENTRY_DSN: String(process.env.SENTRY_DSN),
          TOPIC_ARN: topic.topicArn,
        },
      },
    });

    // Allow the lambda to read the RDS connection secret
    if (cluster.secret) {
      const fn1 = api.getFunction('GET /');
      const fn2 = topic.subscriberFunctions[0];
      fn1 && cluster.secret.grantRead(fn1);
      fn2 && cluster.secret.grantRead(fn2);
    }

    // Show the endpoint in the output
    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
