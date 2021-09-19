import { controller } from './lambda';
import { knex } from 'knex';
import fetchCredentials from './knex/knexfile';

let db;

describe('controller test', () => {
  beforeEach(async () => {
    db = knex(await fetchCredentials());
    db.migrate.latest();
  });

  it('accesses the db', async () => {
    const response = await controller(
      {
        version: '1',
        headers: {},
        isBase64Encoded: false,
        rawPath: '/',
        rawQueryString: '',
        requestContext: {
          accountId: '',
          apiId: '',
          domainName: '',
          domainPrefix: '',
          http: {
            method: 'GET',
            path: '/',
            protocol: 'https',
            sourceIp: '',
            userAgent: '',
          },
          requestId: '',
          routeKey: '',
          stage: '',
          time: '',
          timeEpoch: 1,
        },
        routeKey: '/',
      },
      {
        awsRequestId: '',
        callbackWaitsForEmptyEventLoop: false,
        functionName: '',
        functionVersion: '',
        invokedFunctionArn: '',
        logGroupName: '',
        logStreamName: '',
        memoryLimitInMB: '108',
        getRemainingTimeInMillis: () => 1,
        done: () => {},
        fail: () => {},
        succeed: () => {},
      },
      () => {}
    );
  });
});
