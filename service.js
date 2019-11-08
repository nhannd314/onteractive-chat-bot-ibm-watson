// service.js
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const service = new AssistantV2({
  version: '2019-02-28',
    authenticator: new IamAuthenticator({
      apikey: process.env.APIKEY,
    }),
    url: process.env.ASSITANT_URL,
});

service.createSession({
    assistantId: process.env.ASSITANT_ID
  })
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
    })
    .catch(err => {
      console.log(err);
});

service.message({
  assistantId: assistantId,
  sessionId: '0dbbec32-f4a8-4cfb-9ddd-7d90c2d2a06c',
  input: {
    'message_type': 'text',
    'text': 'Hello'
  }
  })
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
    })
    .catch(err => {
      console.log(err);
    });



exports.getMessage = body =>
    new Promise((resolve, reject) => {
    assistant.message(
      {
        workspace_id: process.env.WATSON_WORKSPACE_ID,
        input: { text: body.input }
      },
      function(err, response) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(response);
        }
      }
    );
  });