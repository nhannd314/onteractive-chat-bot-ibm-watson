var express = require('express')
var app = express()
var bodyParser = require('body-parser')

const AssistantV2 = require('ibm-watson/assistant/v2')
const { IamAuthenticator } = require('ibm-watson/auth')

const apikey = 'XGU8ZXWeKp5j-mzp581CfEt0klt2PrHDX1qDhbcuQ67P'
const serviceUrl = 'https://gateway.watsonplatform.net/assistant/api'
const assistantId = '68114f1b-4a48-402a-b4f7-c82b7c641e66'

// create chat bot service
const service = new AssistantV2({
	version: '2019-02-28',
  	authenticator: new IamAuthenticator({
    	apikey: apikey,
  	}),
  	url: serviceUrl,
})
//console.log(service)

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'jade')

app.get('/', function(req, res) {
	res.render('doChat')
})

app.post('/doChat', doChat)

var server = app.listen(process.env.PORT || 8888, function() {
	console.log('Your server is running')
})


function doChat(req, res) {
	
	var userText = req.body.text
	var userSession = req.body.session
	
	// if session not create
	if (userSession == '') {
		// connect to chat bot service and get session
		service.createSession({
		  	assistantId: assistantId
		})
		  	.then(resx => {
		  		//console.log(resx)
		    	userSession = resx.result.session_id
		    	
		    	// get reply from chat bot
		    	service.message({
				  	assistantId: assistantId,
				  	sessionId: userSession,
				  	input: {
				    	'message_type': 'text',
				    	'text': userText
				    	}
		  		})
				  	.then(resz => {
				  		
				    	data = {
				    		session: userSession,
				    		text: resz.result.output.generic[0].text
				    	}
				    	res.send(data)
				  	})
				  	.catch(err => {
				    	console.log(err);
				  	});
		  	})
		  	.catch(err => {
		    	console.log(err);
	  	});

	}
	
	// session created already
	else {
		// get reply from chat bot
    	service.message({
		  	assistantId: assistantId,
		  	sessionId: userSession,
		  	input: {
		    	'message_type': 'text',
		    	'text': userText
		    	}
  		})
		  	.then(resz => {
		  		
		    	data = {
		    		session: userSession,
		    		text: resz.result.output.generic[0].text
		    	}
		    	res.send(data)
		  	})
		  	.catch(err => {
		    	console.log(err);
		  	});
	}
	
}