const http = require("http");
const url = require("url");


var server = http.createServer(function(req,res){
    // Get the URL
    var parsedUrl = url.parse(req.url, true);

    // Get the Path from the URL
    var path = parsedUrl.pathname;

    // Get the Query String
    var queryString = parsedUrl.query;

    // Trim it to Some extent
    var trimmedPath = path.replace('/','');

    // Get the Method of Request from the URL and store it's Lower Cased Version into a 'method' object
    var method = req.method.toLowerCase();

    // Get the Headers
    var headers = req.headers;

    // End the Process by showing some message 
    res.end("Welcome to My API testing!");

    // Clog out the Trimmed Path, Method, Query String and headers
    console.log("Request Recieved on "+trimmedPath+" with method "+method+" with the queries: ",queryString);
    console.log("The Headers are: ",headers);
});


server.listen(3000,function(){
    console.log("Server listening on Port: 3000");
});