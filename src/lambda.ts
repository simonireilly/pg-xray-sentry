import { captureAWS, captureHTTPsGlobal, capturePostgres } from 'aws-xray-sdk';

// Mutate libraries when running inside AWS Lambda environment
if (process.env.LAMBDA_TASK_ROOT) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  capturePostgres(require('pg'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  captureHTTPsGlobal(require('http'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  captureHTTPsGlobal(require('https'));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  captureAWS(require('aws-sdk'));
}

import * as Sentry from '@sentry/serverless';
import * as AWS from 'aws-sdk';
import { knex } from 'knex';
import axios from 'axios';
import fetchCredentials from './knex/knexfile';

import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { User } from '@sentry/serverless';
import { mapUser } from './api/mappers/user';

Sentry.AWSLambda.init({
  dsn: String(process.env.SENTRY_DSN),
  tracesSampleRate: 1.0,
  autoSessionTracking: true,
  logLevel: 3,
  enabled: true,
});

const dynamoDB = new AWS.DynamoDB({
  maxRetries: 0,
});

export const controller: APIGatewayProxyHandlerV2 = async (event) => {
  // XRAY tracing a HTTP request
  await axios.get('https://example.com');

  // XRAY AWS SDK Tracing
  await dynamoDB
    .putItem({
      TableName: String(process.env.TABLE_NAME),
      Item: {
        pk: { S: (Math.random() + 1).toString(36).substring(7) },
        sk: { S: (Math.random() + 1).toString(36).substring(7) },
      },
    })
    .promise();

  // XRAY tracing a database
  const credentials = await fetchCredentials();
  const db = knex(credentials);

  let user: User | null = null;

  try {
    user = await db('users')
      .insert({
        name: 'Simon',
      })
      .returning('*');
  } catch (e) {
    console.error('Database insert error', e);
  } finally {
    db.destroy();
  }

  if (user === null) {
    return {
      statusCode: 422,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Failed to create user',
      }),
    };
  }
  const apiUser = mapUser(user[0]);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiUser),
  };
};

export const handler = Sentry.AWSLambda.wrapHandler(controller, {
  captureTimeoutWarning: false,
  rethrowAfterCapture: true,
  flushTimeout: 500,
  timeoutWarningLimit: 3000,
  callbackWaitsForEmptyEventLoop: false,
});
