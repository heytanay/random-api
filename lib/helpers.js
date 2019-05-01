/* 
*   Helping file for various purposes
*/

// Dependencies
const crypto = require("crypto");
const config = require("../configuration/config");
const querystring = require("querystring");
const https = require("https");

// Create helpers object
var helpers = {};

// Create a SHA-256 bit hashed String
helpers.hash = function(string){
    if (typeof(string) == 'string' && string.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(string).digest('hex');
        return hash;
    }
    else {
        return false;
    }
}

// Parse an input JSON into an Object, if there is an error: return an empty object
helpers.parseJSONToObject = function(string){
    try {
        var object = JSON.parse(string);
        return object;
    } catch (error) {
        return {};
    };
};

// Create a Random String of Alphanumeric Characters given a length
helpers.createRandomString = function(strLen){
    strLen = typeof(strLen) == 'number' && strLen > 0 ? strLen : false;
    if (strLen){

        // Get all the Possible characters
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        // Empty string for later
        var randomString = '';

        // Generates random characters and append them to the string 
        for (i = 1; i <= strLen; i++){
            // Get a random character from possibleCharacters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            // Append randomCharacter into the randomString
            randomString += randomCharacter;
        }
        return randomString;
    }
    else{
        return false;
    }
} 


helpers.sendSMSTwilio = function(phone,msg,callback){
    // Validate the Parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg : false;

    if (phone && msg){
        // Configure the request payload
        var payload = {
            'From' : config.twilio.fromPhone,
            'To' : '+91'+phone,
            'Body' : msg   
        };

        // Stringify the payload
        var stringedPayload = querystring.stringify(payload);

        // Configure the request details
        var requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/'+config.twilio.sID+'/messages.json',
            'auth': config.twilio.sID+':'+config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringedPayload)
            },
        };
    
        // Instantiate the request object
        var req = https.request(requestDetails, function(res){
            // Grab the status of the sent request
            var status = res.statusCode;

            // Callback successfull if the request went through
            if (status == 200 || status == 201){
                callback(false);
            }  
            else{
                callback("Status Code returned was"+status);
            }
        });    

        // Bind to the error event
        req.on('error',function(e){
            callback(e);
        });

        // Add the payload
        req.write(stringedPayload);

        // End the request
        req.end();

    }
    else{
        callback("Given Paramters were missing or invalid");
    }
}   

// Export the helpers-object
module.exports = helpers;
