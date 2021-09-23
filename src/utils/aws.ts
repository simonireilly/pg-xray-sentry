import { captureAWS, captureHTTPsGlobal, capturePostgres } from 'aws-xray-sdk';
import * as AWS_SDK from 'aws-sdk';
// Mutate libraries when running inside AWS Lambda environment
if (process.env.LAMBDA_TASK_ROOT) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  capturePostgres(require('pg'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  captureHTTPsGlobal(require('http'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  captureHTTPsGlobal(require('https'));
}

const AWS = process.env.LAMBDA_TASK_ROOT ? captureAWS(AWS_SDK) : AWS_SDK;

export const dynamoDB = new AWS.DynamoDB({
  maxRetries: 0,
});

export const secretsManager = new AWS.SecretsManager({});
