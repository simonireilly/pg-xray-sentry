import { captureAWS, captureHTTPsGlobal, capturePostgres } from 'aws-xray-sdk';

if (process.env.LAMBDA_TASK_ROOT) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  capturePostgres(require('pg'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  captureHTTPsGlobal(require('http'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  captureHTTPsGlobal(require('https'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AWS = captureAWS(require('aws-sdk'));
}

import * as Sentry from '@sentry/serverless';
import { Knex, knex } from 'knex';
import axios from 'axios';
import fetchCredentials from './knex/knexfile';

import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

Sentry.AWSLambda.init({
  dsn: 'https://2426e155f0784fd4af368d189e81ccb8@o428717.ingest.sentry.io/5966723',
  tracesSampleRate: 1.0,
  autoSessionTracking: true,
  logLevel: 3,
  enabled: true,
});

// const dynamoDB = new AWS.DynamoDB({});

export const controller: APIGatewayProxyHandlerV2 = async (event) => {
  // XRAY tracing a HTTP request
  await axios.get('http://example.com');

  // XRAY AWS SDK Tracing
  // await dynamoDB
  //   .putItem({
  //     TableName: process.env.TABLE_NAME,
  //     Item: {
  //       pk: { S: (Math.random() + 1).toString(36).substring(7) },
  //       sk: { S: (Math.random() + 1).toString(36).substring(7) },
  //     },
  //   })
  //   .promise();

  // XRAY tracing a database
  const credentials = await fetchCredentials();
  const db = knex(credentials);

  db('users').insert({
    name: 'Simon',
  });

  db.destroy();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `Hello, World! Your request was received at ${event.requestContext.time}.`,
  };
};

export const handler = Sentry.AWSLambda.wrapHandler(controller, {
  captureTimeoutWarning: false,
  rethrowAfterCapture: true,
  flushTimeout: 500,
  timeoutWarningLimit: 3000,
  callbackWaitsForEmptyEventLoop: false,
});
