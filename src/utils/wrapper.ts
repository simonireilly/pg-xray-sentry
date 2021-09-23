import { Context, Handler } from 'aws-lambda';
import * as pino from 'pino';

export const wrapper = <T extends Handler>(
  event: Parameters<T>[0],
  context: Context,
  controller: T
) => {
  const wrappedContext = {
    ...context,
    logger: pino({
      name: 'app-name',
      level: 'debug',
    }),
  };

  return controller(event, context, () => {});
};
