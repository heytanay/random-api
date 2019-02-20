const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require('./configuration/config');

var server = http.createServer(function(req,res){

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
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct the data object
		var data = {
			'path': trimmedPath,
			'method': method,
			'query': queryString,
			'headers': headers,
			'payload': buffer,
		};

		chosenHandler(data,function(statusCode,payload){
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			
			payload = typeof(payload) == 'object' ? payload : {};

			var payloadString = JSON.stringify(payload);

			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log("Got this Response: ",statusCode,payload);
		});
	});
});


server.listen(config.port,function(){
	console.log("Server listening on Port: "+config.port+" under "+config.envName+" enviorment...");
});

var handlers = {};

handlers.home = function(data,callback){
	callback(200,{'message':'Welcome Home!'});
};

handlers.isAlive = function(data,callback){
	callback(200);
};

handlers.notFound = function(data,callback){
	callback(404);
};

var router = {
	'home': handlers.home,
	'isAlive': handlers.isAlive,
};