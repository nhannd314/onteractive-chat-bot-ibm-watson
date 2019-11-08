const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const apikey = 'XGU8ZXWeKp5j-mzp581CfEt0klt2PrHDX1qDhbcuQ67P';
const serviceUrl = 'https://gateway.watsonplatform.net/assistant/api';
const assistantId = '68114f1b-4a48-402a-b4f7-c82b7c641e66';

const service = new AssistantV2({
	version: '2019-02-28',
  	authenticator: new IamAuthenticator({
    	apikey: apikey,
  	}),
  	url: serviceUrl,
});

service.createSession({
  	assistantId: '68114f1b-4a48-402a-b4f7-c82b7c641e66'
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