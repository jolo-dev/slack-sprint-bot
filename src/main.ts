import { App } from 'aws-cdk-lib';
import { LambdaStack } from './LambdaStack';

// for development, use account/region from cdk cli
const devEnv = {
  account: '473961697792',
  region: 'eu-central-1',
};

const app = new App();

new LambdaStack(app, 'lambda-stack-dev', { env: devEnv });

app.synth();