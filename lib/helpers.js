/* 
*   Helping file for various purposes
*/

// Dependencies
const crypto = require("crypto");
const config = require("../configuration/config");

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

// Export the helpers-object
module.exports = helpers;
