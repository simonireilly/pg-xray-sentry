import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceFailedResponse,
  CloudFormationCustomResourceSuccessResponse,
} from 'aws-lambda';
import axios, { AxiosResponse } from 'axios';

export const sendFailureMessage = async (
  event: CloudFormationCustomResourceEvent,
  Reason = 'Error when updating stack',
  Data = {}
): Promise<AxiosResponse> => {
  const errorResponse: CloudFormationCustomResourceFailedResponse = {
    Status: 'FAILED',
    Reason,
    PhysicalResourceId: `Database-${event.StackId}`,
    LogicalResourceId: event.LogicalResourceId,
    RequestId: event.RequestId,
    StackId: event.StackId,
    Data,
  };

  console.info('Sending success response', errorResponse);

  const data = JSON.stringify(errorResponse);
  return axios.put(event.ResponseURL, data, {
    headers: {
      'content-type': '',
      'content-length': String(data.length),
    },
  });
};

export const sendSuccessMessage = async (
  event: CloudFormationCustomResourceEvent
): Promise<AxiosResponse> => {
  const successResponse: CloudFormationCustomResourceSuccessResponse = {
    Status: 'SUCCESS',
    Reason: 'Processed request successfully',
    PhysicalResourceId: `Database-${event.StackId}`,
    LogicalResourceId: event.LogicalResourceId,
    RequestId: event.RequestId,
    StackId: event.StackId,
  };

  console.info('Sending success response', successResponse);

  const data = JSON.stringify(successResponse);
  return await axios.put(event.ResponseURL, data, {
    headers: {
      'content-type': '',
      'content-length': String(data.length),
    },
  });
};
