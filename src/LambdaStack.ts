import path from 'path';
import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, LambdaRestApi, MethodLoggingLevel } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { setup, throwExpression } from './utility';

setup();

const SLACK_TOKEN: string = process.env.SLACK_TOKEN ?? throwExpression('Please provide a Slack Token');
const SLACK_SIGNING_SECRET: string = process.env.SLACK_SIGNING_SECRET ?? throwExpression('Please provide a Slack Signing Secret');
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID ?? throwExpression('No Client ID');
const SLACK_SECRET_ID = process.env.SLACK_SECRET_ID ?? throwExpression('No Secret ID');
const SLACK_CHANNEL_ANSWERS_ARE_SENT = process.env.SLACK_CHANNEL_ANSWERS_ARE_SENT ?? throwExpression('No SLACK_CHANNEL_ANSWERS_ARE_SENT. Please provide one'); // needs to be changed
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID ?? throwExpression('No SLACK_CHANNEL_ID');

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const lambdaFolder: string = path.join(path.dirname(__filename), './lambda');

    const slashHandler = new NodejsFunction(this, 'InteractiveSlackBot', {
      bundling: {
        minify: true,
      },
      entry: `${lambdaFolder}/sprintBotHandler.ts`,
      timeout: Duration.minutes(1),
      environment: {
        SLACK_TOKEN,
        SLACK_SIGNING_SECRET,
        SLACK_CHANNEL_ANSWERS_ARE_SENT,
        SLACK_CHANNEL_ID,
      },
    });

    // const url = slashHandler.addFunctionUrl({
    //   authType: FunctionUrlAuthType.NONE,
    // });

    const api = new LambdaRestApi(this, 'SprintBotRestApi', {
      handler: slashHandler,
      proxy: false,
      deployOptions: {
        stageName: 'dev',
        loggingLevel: MethodLoggingLevel.INFO,
        tracingEnabled: true,
      },
    });

    const endpoint = api.root.addResource('sprintBot');
    endpoint.addMethod('POST'); // POST /dev/sprintBot

    const loginHandler = new NodejsFunction(this, 'LoginSlackBot', {
      bundling: {
        minify: true,
      },
      entry: `${lambdaFolder}/login.ts`,
      timeout: Duration.minutes(1),
      environment: {
        SLACK_CLIENT_ID,
        SLACK_SECRET_ID,
      },
    });

    api.root.addResource('login').addMethod('GET', new LambdaIntegration(loginHandler));

  }
}