import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { Factory } from 'fishery';

export const eventFactory = Factory.define<APIGatewayProxyEventV2>(({}) => ({
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
}));

export const contextFactory = Factory.define<Context>(({}) => ({
  awsRequestId: '',
  callbackWaitsForEmptyEventLoop: true,
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
}));
