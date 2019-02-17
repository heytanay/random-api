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