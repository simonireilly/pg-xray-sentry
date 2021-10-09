import { CloudFormationCustomResourceHandler } from 'aws-lambda';
import {
  sendFailureMessage,
  sendSuccessMessage,
} from '../utils/cloudformation';
import { provisionDatabase } from '../../../src/knex/provisioner';
import * as Sentry from '@sentry/serverless';

export const command: CloudFormationCustomResourceHandler = async (event) => {
  let res;

  try {
    console.info('Unpacking event resources');

    switch (event.RequestType) {
      case 'Create':
        console.info('Creating database');
        await provisionDatabase('example');
        break;
      case 'Update':
        console.info('Creating database if not exists');
        await provisionDatabase('example');
        break;
      case 'Delete':
        console.info('Deleting database');
        break;
    }

    res = await sendSuccessMessage(event);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('Error occurred provisioning the database', {
        ...e,
      });
      res = await sendFailureMessage(event, JSON.stringify(e, undefined, 2), e);
    }

    res = await sendFailureMessage(
      event,
      JSON.stringify(e, undefined, 2),
      JSON.parse(JSON.stringify(e))
    );
  }

  console.info('Processed custom resource request, response', { res });
};

export const handler = Sentry.AWSLambda.wrapHandler(command, {
  captureTimeoutWarning: false,
  rethrowAfterCapture: true,
  flushTimeout: 500,
  timeoutWarningLimit: 3000,
  callbackWaitsForEmptyEventLoop: false,
});
