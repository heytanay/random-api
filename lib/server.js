// TODO: Add HTTPS Support (present commit: 372aad4)

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("../configuration/config");
const handlers = require("./handlers");
const helpers = require("./helpers");
const path = require("path");

// Wrap the Server and all other dependecies into 'app' object to export it later
var app = {};

app.httpServer = http.createServer(function(req,res){
    app.invokeServerHandler(req, res);
});

// app.invokeServerHandler: Abstract function to initialise the server

app.invokeServerHandler = function(req, res){

	// Get the Method of the request
	var method = req.method.toLowerCase();

	// Parse the Url and get it's path
	var parsedUrl = url.parse(req.url, true);
	var path= parsedUrl.pathname;

	// Trim the Path
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query String
	var queryString = parsedUrl.query;

	// Get the Headers from the request object
	var headers = req.headers;

	// Store the incoming data into 'buffer' variable
	var buffer = '';
	var decoder = new StringDecoder('utf-8');
	req.on('data',function(data){
		buffer += decoder.write(data);
	});

	// When the Request ends => clog recieved information and res-end the status code
	req.on('end',function(){
		buffer += decoder.end();

		// Choose the Handler where this request should go to, if none, go to 404 notFound Handler
		var chosenHandler = typeof(app.router[trimmedPath]) !== 'undefined' ? app.router[trimmedPath] : handlers.notFound;

		// Construct the data object
		var data = {
			'path': trimmedPath,
			'method': method,
			'query': queryString,
			'headers': headers,
			'payload': helpers.parseJSONToObject(buffer),
		};

		// The Below function is basically used for the respective route (function) that is requested by the user.
		// Here the, 'function(statusCode,payload)' is passed as the callback function defined in the 'handler.*route*' property.

		chosenHandler(data,function(statusCode,payload){
			// Check the Status Code, if none => statusCode = 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			// Check the payload object, if none => pass an empty object
			payload = typeof(payload) == 'object' ? payload : {};

			// Stringify the Payload object JSON file
			var payloadString = JSON.stringify(payload);

			// Set the Header, Status Code (writeHead function) and display the stringified payload string (statusCode to be passed from the callback)

			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Logout the Status Code and the Payload from above.
			console.log("Got this Response: ",statusCode,payload);
		});
	});
};


app.router = {
	'home': handlers.home,
	'isAlive': handlers.isAlive,
	'users': handlers.users,
	'tokens': handlers.tokens,
	'checks': handlers.checks
};

// app.init: Start the server by making it listen at config.httpPort
app.init = function(){
	// Starts the HTTP Server at the port {httpPort} in ../configuration/config.js
    app.httpServer.listen(config.httpPort,function(){
        console.log(`Server is active on localhost:${config.httpPort}`);
    });    
};

// Export the server module
module.exports = app;
