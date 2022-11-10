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
