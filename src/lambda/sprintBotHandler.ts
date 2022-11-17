import { App, AwsLambdaReceiver, BlockAction, LogLevel } from '@slack/bolt';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { throwExpression } from '../utility';

import conditions from './questions/conditions.json';
import options from './questions/options.json';
import question from './questions/questions.json';

const signingSecret = process.env.SLACK_SIGNING_SECRET ?? throwExpression('Please provide SLACK_SIGNING_SECRET');
const token = process.env.SLACK_TOKEN ?? throwExpression('No SLACK_TOKEN. Please provide one');
const SLACK_CHANNEL_ANSWERS_ARE_SENT = process.env.SLACK_CHANNEL_ANSWERS_ARE_SENT ?? throwExpression('No SLACK_CHANNEL_ANSWERS_ARE_SENT. Please provide one'); // needs to be changed
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID ?? throwExpression('No SLACK_CHANNEL_ID');

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret,
  logLevel: LogLevel.INFO,
});

const app = new App({
  token,
  receiver: awsLambdaReceiver,
});

app.command('/sprint', async ({ ack, body, client, logger }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'sprint_modal',
        title: {
          type: 'plain_text',
          text: 'Sprint Bot',
        },
        blocks: [
          {
            type: 'input',
            label: {
              type: 'plain_text',
              text: 'Is this a new or existing task?',
              emoji: true,
            },
            dispatch_action: true, // needed to listen to action
            element: {
              type: 'static_select',
              action_id: 'choose',
              placeholder: {
                type: 'plain_text',
                text: 'New or Existing',
                emoji: true,
              },
              // @ts-ignore
              options: options.new_or_existing, // Typescript is not recognizing that the type is "plain_text"
            },
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
      },
    });
  } catch (error) {
    logger.error(error);
  }

});

app.action<BlockAction>('choose', async ({ ack, body, logger, client, action }) => {
  await ack();
  logger.info('Listened to choose action');
  try {
    const view = body.view;
    if (view) {
      const blocks = view?.blocks;
      // @ts-ignore
      blocks.push(conditions[action.selected_option.value]);
      // @ts-ignore
      blocks[blocks.length - 1].element.options = options[action.selected_option.value];
      await client.views.update({
        view_id: view?.id,
        hash: view?.hash,
        view: {
          blocks: blocks,
          title: view.title,
          // @ts-ignore
          type: view.type, // Typescript is not recognizing that the type is "plain_text"
          callback_id: view.callback_id,
          submit: view.submit!,
        },
      });
    }
    // logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

app.action<BlockAction>('next', async ({ ack, body, logger, client }) => {
  await ack();
  try {
    const view = body.view;
    if (view) {
      const blocks = view?.blocks;
      const values = view.state.values;
      const result = await client.conversations.history({
        channel: SLACK_CHANNEL_ANSWERS_ARE_SENT,
      });

      blocks.forEach((block) => {
        const tmp = Object.values(values[block.block_id!])[0];
        // Hours spent is at position 7
        if (blocks.length > 6 && tmp.selected_option?.text.text.includes('Actual')) {
          const messages = result.messages?.filter(message => message.blocks );
          logger.info(messages);
          const themes = messages?.map(
            (message => message.blocks?.filter(messageBlock => messageBlock.text?.text?.includes('Hours'))),
          )[0]; // Get the latest value
          const previousValue = themes![0].text?.text?.split('\n')[1];
          question[7].element!.initial_value = previousValue;
        }
      });

      blocks.push(question[blocks.length]);
      await client.views.update({
        view_id: body.view?.id,
        hash: body.view?.hash,
        view: {
          blocks: blocks,
          title: view.title,
          // @ts-ignore
          type: view.type, // Typescript is not recognizing that the type is "plain_text"
          callback_id: view.callback_id,
          submit: view.submit!,
        },
      });
    }
    // logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

// On submit the modal
app.view('sprint_modal', async ({ ack, logger, view, body, client }) => {
  await ack();

  logger.debug('body', body.user.name);
  logger.debug('view', view.state.values);
  const answers = [{
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `Answers by ${body.user.name}:`,
    },
  }];
  const blocks = view.blocks;
  const values = view.state.values;
  blocks.forEach((block, idx) => {
    // logger.info(idx, question[idx]);
    const tmp = Object.values(values[block.block_id!])[0];
    const value = tmp.value ?? tmp.selected_option?.text.text;
    logger.info(value);
    answers.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${question[idx].label?.text}*\n${value}`,
      },
    });
  });
  try {
    await client.chat.postMessage({
      channel: SLACK_CHANNEL_ANSWERS_ARE_SENT,
      blocks: answers,
    });
    await client.chat.postEphemeral({
      channel: SLACK_CHANNEL_ID,
      user: body.user.id,
      blocks: [{
        type: 'section',
        text: {
          type: 'plain_text',
          text: `Thank you ${body.user.name}`,
          emoji: true,
        },
      }],
    });
  } catch (error) {
    logger.error(error);
  }
});

export const handler = async (event: APIGatewayProxyEvent, context: any, callback: any) => {
  try {
    console.log('Call Sprint Bot');

    const receiver = await awsLambdaReceiver.start();
    return await receiver(event, context, callback);

  } catch (error) {
    console.error(error);
    const e = error as Error;
    throw e;
  }
};
