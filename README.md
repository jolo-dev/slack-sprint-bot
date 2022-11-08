# Slack Haiphen

This is a slash command using `/haiphen`.

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

## Demo

<a href="https://slack.com/oauth/v2/authorize?client_id=3646067385254.4086174160645&scope=commands&user_scope="><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

![haiphen-command](.drawio/slack-haiphen.gif)