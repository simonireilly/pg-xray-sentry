import * as sst from '@serverless-stack/resources';
import { TableFieldType } from '@serverless-stack/resources';

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const table = new sst.Table(this, 'DynamoDbTableName', {
      fields: {
        pk: TableFieldType.STRING,
        sk: TableFieldType.STRING,
      },
      primaryIndex: {
        partitionKey: 'pk',
        sortKey: 'sk',
      },
    });

    // Create a HTTP API
    const api = new sst.Api(this, 'Api', {
      routes: {
        'GET /': 'src/lambda.handler',
      },
      defaultFunctionProps: {
        bundle: {
          nodeModules: ['@sentry/serverless', 'pg', 'knex'],
        },
        permissions: [[table.dynamodbTable, 'grantReadWriteData']],
        environment: {
          TABLE_NAME: table.tableName,
        },
      },
    });

    // Show the endpoint in the output
    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
