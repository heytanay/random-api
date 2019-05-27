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
            console.log("Error: Could not find any checks to process");
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
    // Prepare the initial checkOutcome object that will be overwritten as the process proceeds
    var checkOutcome = {'error': false, 'responseCode': false};

    // Mark that outcome has not been sent yet
    var outcomeSent = false;

    // Parse the hostname and path out of the originalCheckData
    var parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
    var hostName = parsedUrl.hostname;

    // Using 'path' and not 'pathname' because we want the full url not just the pathname
    var path = parsedUrl.path;

    // Construct the request
    var requestDetails = {
        'protcol': originalCheckData.protcol + ':',
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    }


    // Instantiate the request object using either the http or https module
    var _moduleToUse = originalCheckData.protocol == 'http' ? http : https;

    var req = _moduleToUse.request(requestDetails, function(res){
        // Grab the status of the sent request
        status = res.statusCode;

        // Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;

        if (!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });
    
    // Bind to the error event so it doesnot get thrown
    req.on('error', function(e){
        // Update the checkOutcome and pass the data along
        checkOutcome.error = {'error': true, 'value':e};

        if (!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }

    });

    // Bind to the timeout event
    req.on('timeout', function(e){
        // Update the checkOutcome and pass the data along
        checkOutcome.error = {'error': true, 'value':'timeout'};

        if (!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }

    });


    // End the request
    req.end();
};

// Process the check outcome and update the check-data as needed and trigger an alert to the user if needed
// Special logic for accomodating a check that never has been tested before (don't want to alert on that one)
workers.processCheckOutcome = function(originalCheckData, checkOutcome){
    // Decide if the check is considered up or down in the current state
    var state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCode.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    // Decide if an alert is warranted
    var alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

    // Update the check-data
    var newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // Save the update to disk
    _data.update('checks',newCheckData.id, newCheckData, function(err){
        if (!err){
            // Send the new check-data to the next phase if needed
            if (alertWarranted){
                workers.alertUserToStatusChange(newCheckData);
            }
            else{
                console.log("Check outcome has not changed, no alert needed");
            }
        }
        else{
            console.log("Error trying to save updates to one of the checks");
        }
    });

};

// This function alerts the users to status change by SMS using the twilio API helper built in "helpers.js"
workers.alertUserToStatusChange = function(newCheckData){
    var message = 'Alert: Your Check for'+newCheckData.method.toUpperCase()+' '+newCheckData.protcol+'://'+newCheckData.url+' is currently '+newCheckData.state;

    _helpers.sendSMSTwilio(newCheckData.userPhone,message, function(err, callback){
        if (!err){
            console.log("Success! User was alerted to a status change in their check via SMS, this was the sent message: ",message);
        }
        else{
            console.log("Error: Couldnot send SMS alert to user who had a state change in their check");
        }
    })
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