# Sprint Bot

This is a slash command using `/sprint`.

## Tech Stack

- Amazon API Gateway and AWS Lambda
- [Boltjs](https://slack.dev/bolt-js/tutorial/getting-started) as Slack SDK
- [Projen](https://github.com/projen/projen) as Infrastructure as code

## Deployment

![Architecture](.drawio/architecture.drawio.svg)

### Pre-requisite

- AWS Account

```bash
npx projen deploy
```

## Hosting

This is an AWS Lambda but can be replaced by `receiver` which accepts HTTPS.
Please, check out their [documentation](https://slack.dev/bolt-js/tutorial/getting-started).
Besides the [API Tokens](https://api.slack.com/legacy/oauth), you have to have [Interactivity and Shortcuts](https://api.slack.com/messaging/interactivity#components) enabled.

### Credentials

`.env.template` needs to be replaced with `.env` and fill out the credentials accordingly.

## Questions

The questions are inside `src/lambda/questions/` and divided into `questions.json` which is the metadata of all the questions, `conditions.json` for questions with conditions and `options.json` for their options of the dropdown.

Inside the `questions.json` there is the `"action_id": "choose",` which can be either `choose` or `next`.

When it's `choose` means it goes to the `conditions.json` otherwise `next` means just go to the next question.
