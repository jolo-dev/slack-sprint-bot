import { App } from 'aws-cdk-lib';
import { LambdaStack } from './LambdaStack';

// for development, use account/region from cdk cli
const devEnv = {
  account: '246350246460',
  region: 'eu-central-1',
};

const app = new App();

new LambdaStack(app, 'lambda-stack-dev', { env: devEnv });

app.synth();