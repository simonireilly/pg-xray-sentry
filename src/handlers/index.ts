import * as Sentry from '@sentry/serverless';
import { controller } from './api';
import { command } from './events';

Sentry.AWSLambda.init({
  dsn: String(process.env.SENTRY_DSN),
  tracesSampleRate: 1.0,
  autoSessionTracking: true,
  logLevel: 3,
  enabled: true,
});

export const api = Sentry.AWSLambda.wrapHandler(controller, {
  captureTimeoutWarning: false,
  rethrowAfterCapture: true,
  flushTimeout: 500,
  timeoutWarningLimit: 3000,
  callbackWaitsForEmptyEventLoop: false,
});

export const event = Sentry.AWSLambda.wrapHandler(command, {
  captureTimeoutWarning: false,
  rethrowAfterCapture: true,
  flushTimeout: 500,
  timeoutWarningLimit: 3000,
  callbackWaitsForEmptyEventLoop: false,
});
