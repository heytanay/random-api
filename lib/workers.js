// Dependecies
var path = require('path');
var fs = require('fs');
var https = require('https');
var http = require('http');
var url = require('url');
var _data = require('./data');
var _helpers = require('./helpers');

// Instantiate the worker object
var workers = {};

// Lookup all the checks and send their data to a validator
workers.gatherAllChecks = function(){
    // Get all the checks that exists in the system
    _data.list('checks',function(err, checks){

        if (!err && checks && checks.length > 0){

            // Iterate over each check in the directory and read it using the '_data.read()' function
            checks.forEach(function(check){
                
                // Read-in the check data
                _data.read('checks',check,function(err, originalCheckData){
                    
                    if (!err && originalCheckData){
                        
                        // Pass the originalCheckData to a check-validator and let that function continue
                        workers.validateCheckData(originalCheckData);
                    }
                    else{

                        console.log("Error reading one of the check data");
                    }
                });
            }); 
        }
        else{
            // Log the error on the console because, worker is a background process, so we cannot call it back
            console.log("Error: Couldnot find any checks to process");
        }
    });
}
// This function validates the originalCheckData passed onto it
workers.validateCheckData = function(originalCheckData){
    // If the originalCheckData is null or is not an object, assign it to an empty object, else carry on 
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};

    // Sanity check all the key-values in the provided originalCheckData
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
   
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
   
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
   
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
   
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
   
    originalCheckData.successCode = typeof(originalCheckData.successCode) == 'object' && originalCheckData.successCode instanceof Array && originalCheckData.successCode.length > 0 ? originalCheckData.successCode : false;
    
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds.length >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;
    
    // Set the keys that may not have been set (if the workers have never seen this checks before)
    // 'originalCheckData.state' can have either of two values 'up' or 'down'
    // If a url has never been checked (if a check has never been performed), default it to down
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    // If all the checks pass, pass the data along the next step in the process
    if (originalCheckData.id && 
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCode &&
    originalCheckData.timeoutSeconds){

        workers.performCheck(originalCheckData);
    }
    else {
        console.log("Error: One of the check data is not properly formatted, skipping it");
    }
}
// Perform the check, send the originalCheckData and the outcome of the check process to next step of the process
workers.performCheck = function(originalCheckData){
    // Comming in the next commit
};


// Timer to execute workers-process once per minute
workers.loop = function(){
    // Set an interval and execute it every minute
    setInterval(function(){

        // Every 1 minute, call the 'workers.gatherAllChecks()' function to execute checks    
        workers.gatherAllChecks();
    
    },1000 * 60);
}

// Init script for the worker object
workers.init = function(){
    // Execute all checks immediately
    workers.gatherAllChecks();

    // Call the loop so that the checks keep on executing later on
    workers.loop();
} 

// Export the worker object
module.exports = workers;