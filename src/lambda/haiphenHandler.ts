import { App, AwsLambdaReceiver, LogLevel } from '@slack/bolt';
import { APIGatewayProxyEvent } from 'aws-lambda';
import axios from 'axios';
import { throwExpression } from '../utility';

const signingSecret = process.env.SLACK_SIGNING_SECRET ?? throwExpression('Please provide SLACK_SIGNING_SECRET');
const token = process.env.SLACK_TOKEN ?? throwExpression('No SLACK_TOKEN. Please provide one');

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret,
  logLevel: LogLevel.INFO,
});


const app = new App({
  token,
  receiver: awsLambdaReceiver,
});

app.command('/haiphen', async ({ ack, respond }) => {
  await ack();

  // this can be replaced with
  const { data } = await axios.post('http://54.164.12.213:5000/api', {
    src: 'aws-auth',
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await respond(JSON.stringify(data));
});

export const handler = async (event: APIGatewayProxyEvent, context: any, callback: any) => {
  try {
    console.log('Call Haiphen Command');

    const receiver = await awsLambdaReceiver.start();
    return await receiver(event, context, callback);

  } catch (error) {
    console.error(error);
    const e = error as Error;
    throw e;
  }
};
