// populate environment variables locally.
require('dotenv').config();
const {
  NETLIFY_AUTH_TOKEN
} = process.env;

// hardcoding this for a moment
const URL = "https://jamstack-comments.netlify.com/";

/*
  delete this submission via the api
*/
async function purgeComment(id) {
  var url = `https://api.netlify.com/api/v1/submissions/${id}?access_token=${NETLIFY_AUTH_TOKEN}`;
  try {
    await fetch(url, { method: "DELETE" });
    console.log("Comment deleted from queue.");
  } catch (err) {
    console.log(err);
  }
}


/*
  Handle the lambda invocation
*/
export async function handler(event) {

  // parse the payload
  var body = event.body.split("payload=")[1];
  var payload = JSON.parse(unescape(body));
  var method = payload.actions[0].name;
  var id = payload.actions[0].value;

  if(method == "delete") {
    await purgeComment(id);
    return {
      statusCode: 200,
      body: "Comment deleted"
    };
  } else if (method == "approve"){

    // get the comment data from the queue
    var url = `https://api.netlify.com/api/v1/submissions/${id}?access_token=${NETLIFY_AUTH_TOKEN}`;
    var response = await fetch(url);
    if (!response.ok) {
      return { statusCode: response.status, body: "Could not read the comment from the queue" };
    }
    var data = (await response.json()).data;

    // now we have the data, let's massage it and post it to the approved form
    var form = new FormData();
    form.append('form-name', "approved-comments");
    form.append('path', data.path);
    form.append('received', new Date().toString());
    form.append('email', data.email);
    form.append('name', data.name);
    form.append('comment', data.comment);
    var approvedURL = URL;

    console.log("Posting to", approvedURL);

    // post the comment to the approved list
    try {
      await fetch(approvedURL, { method: "POST", body: form });
      console.log('Post to approved comments list successful.');
      await purgeComment(id);
    } catch (err) {
      console.log('Post to approved comments failed:' + err);
    }
    var msg = "Comment registered. Site deploying to include it.";
    console.log(msg);
    return {
      statusCode: 200,
      body: msg
    };
  }
}
