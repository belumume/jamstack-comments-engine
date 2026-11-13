'use strict';

// populate environment variables locally.
require('dotenv').config()

const URL = "https://jamstack-comments.netlify.com";

/*
  Our serverless function handler
*/
export async function handler(event) {

  // get the arguments from the notification
  var body = JSON.parse(event.body);

  // prepare call to the Slack API
  var slackURL = process.env.SLACK_WEBHOOK_URL
  var slackPayload = {
    "text": "New comment on " + URL,
	  "attachments": [
      {
        "fallback": "New comment on the comment example site",
        "color": "#444",
        "author_name": body.data.email,
        "title": body.data.path,
        "title_link": URL + body.data.path,
        "text": body.data.comment
      },
      {
        "fallback": "Manage comments on " + URL,
        "callback_id": "comment-action",
        "actions": [
          {
            "type": "button",
            "text": "Approve comment",
            "name": "approve",
            "value": body.id
          },
          {
            "type": "button",
            "style": "danger",
            "text": "Delete comment",
            "name": "delete",
            "value": body.id
          }
        ]
      }]
    };

    // post the notification to Slack
    var msg;
    try {
      var response = await fetch(slackURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackPayload)
      });
      msg = 'Post to Slack successful!  Server responded with:' + await response.text();
    } catch (err) {
      msg = 'Post to Slack failed:' + err;
    }
    console.log(msg);
    return {
      statusCode: 200,
      body: msg
    };

}
