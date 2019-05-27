/*
*	Primary file for Server
*/
const path = require("path");
const server = require("./lib/server");
const workers = require("./lib/workers");

var app = {};

app.init = function(){
	
	workers.init();
	server.init();
};

app.init();

module.exports = app;
