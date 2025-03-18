import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { IContext } from '../../index.js';

const client = new LambdaClient({ region: 'us-east-1' });

const invokeAndParseLambda = async ({
  context,
  functionName,
  payload
}: {
  context: IContext
  functionName: string;
  payload: any;
}) => {
  try {
  const command = new InvokeCommand({
    FunctionName: functionName,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(payload)
  });

  context.logger.debug(`Invoking ${functionName} with payload: ${JSON.stringify(payload)}`);
  const response = await client.send(command);

  // @ts-ignore
  const parsedResponse = JSON.parse(Buffer.from(response.Payload) as unknown as string);
  const { statusCode, body, errorMsg } = parsedResponse;
  if (statusCode !== 200) {
    throw new Error(`Received non-200 status code from lambda. ErrorMsg: ${errorMsg}`);
  }
  return body;
  } catch(e) {
    context.logger.error(`Lambda Invocation error: ${e}`);
    throw e;
  }
};

export { invokeAndParseLambda };
