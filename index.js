const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

var server = http.createServer(function(req,res){
    // Get the URL
    var parsedUrl = url.parse(req.url, true);

    // Get the Path from the URL
    var path = parsedUrl.pathname;

    // Get the Query String
    var queryString = parsedUrl.query;

    // Trim the Path Variable
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the Method of Request from the URL and store it's Lower Cased Version into a 'method' object
    var method = req.method.toLowerCase();

    // Get the Headers
    var headers = req.headers;

    // Get Payload (No Problem if it doesn't exist)
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });

    req.on('end',function(){
        buffer += decoder.end();

        // Choose the Handler which this request should go to. If none is listed, route the request to 404 notFound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        
        // Construct the data object to send to the Handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryString': queryString,
            'method': method,
            'headers': headers,
            'payload': buffer
        };  

        // End the Process by showing some message 
        res.end("Welcome to My API testing!");
        
        // Clog out the Trimmed Path, Method, Query String, Header and Payload
        console.log("Request Recieved on "+trimmedPath+" with method "+method+" with the queries: ",queryString);
        console.log("The Headers are: ",headers);
        console.log("The Payload is: ",buffer);
    });
});

server.listen(3000,function(){
    console.log("Server listening on Port: 3000");
});

// Handler Empty Object
var handlers = {};

// handler.sample function calls back a 406 request and sends the data.
handlers.sample = function(data,callback){
    callback(406, {'name': 'sample buffer'});
};

// handler.notFound function calls back a 404
handlers.notFound = function(data, callback){
    callback(404);
};

// Router object Combines 'route keys' with their Corresponding Handler Functions
var router = {
    'sample': handlers.sample,
};