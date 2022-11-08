import { APIGatewayProxyEvent } from 'aws-lambda';
import { getOauthAccessToken, throwExpression } from '../utility';

const clientId = process.env.SLACK_CLIENT_ID ?? throwExpression('No Client ID');
const secretId = process.env.SLACK_SECRET_ID ?? throwExpression('No Secret ID');
const slackUrl = 'https://slack.com/api/oauth.v2.access';


export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Oauth for Slack');
  try {
    const code = event.queryStringParameters?.code;
    console.log(code);

    if (code) {
      const result = await getOauthAccessToken({ code, clientId, secretId }, slackUrl);
      console.log(result);
      if (result.data.ok) {
        const redirectURL = `https://app.slack.com/client/${result.data.team.id}/`;
        return {
          statusCode: 302,
          headers: { Location: redirectURL },
        };
      } else {
        return {
          body: result.data.error,
        };
      }
    } else {
      throw new Error('No code was returned');
    }
  } catch (error) {
    console.error(error);
    const e = error as Error;
    throw e;
  }
};
