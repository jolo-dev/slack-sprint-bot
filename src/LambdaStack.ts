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
export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const lambdaFolder: string = path.join(path.dirname(__filename), './lambda');

    const slashHandler = new NodejsFunction(this, 'InteractiveSlackBot', {
      bundling: {
        minify: true,
      },
      entry: `${lambdaFolder}/haiphenHandler.ts`,
      timeout: Duration.minutes(1),
      environment: {
        SLACK_TOKEN,
        SLACK_SIGNING_SECRET,
      },
    });

    const api = new LambdaRestApi(this, 'HaiphenRestApi', {
      handler: slashHandler,
      proxy: false,
      deployOptions: {
        stageName: 'dev',
        loggingLevel: MethodLoggingLevel.INFO,
        tracingEnabled: true,
      },
    });

    const endpoint = api.root.addResource('haiphen');
    endpoint.addMethod('POST'); // POST /dev/haiphen

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