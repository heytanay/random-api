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

// Export the helpers-object
module.exports = helpers;
