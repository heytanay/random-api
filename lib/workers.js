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
// workers.validateCheckData function coming in the next commit!

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
