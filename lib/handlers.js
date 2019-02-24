// Dependencies
const _data = require("./data");
const helpers = require("./helpers");

// Handlers object
var handlers = {};

// Handler for '/users' - public route
handlers.users = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    }
    else {
        callback(405);
    };
}

// Handler for '/users' - private route
handlers._users = {};

// Required Data: firstName, lastName, Phone, Password, TOSagreement

handlers._users.post = function(data,callback){
    // Basic Sanity Check for 
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var TOSagreement = typeof(data.payload.TOSagreement) == 'boolean' && data.payload.TOSagreement == true ? true : false;

    if (firstName && lastName && phone && password && TOSagreement){
        // Make sure the User doesn't already exist
        // Using the '*.read() function from ./data.js
        _data.read('users',phone,function(err,data){
            if (err){
                // If the a User with the specified phone number doesnot exist, the _data.read() will call an error
                // which this control-statement catches and then hashes it by help of 'helpers.js' dependency

                var hashedPass = helpers.hash(password);

                if (hashedPass){
                    // If Password is Hashed Successfully, then store it into 'userObject' and create a new
                    // file using the '*.create()' function from data.js library
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPass': hashedPass,
                        'TOSagreement': true,
                    };
    
                    _data.create('users',phone,userObject,function(err){
                        if (!err){
                            callback(200);
                        }
                        else {
                            console.log(err);
                            callback(500,{'Error':'Couldn\'t create a new user'});
                        };
                    });
                }
                else {
                    callback(500,{'Error':'Couldn\'t hash user\'s password'});
                };
            }
            else {
                // User with specified phone number already exists
                callback(400,{"Error":"User with that phone number already exists"});
            }
        });
    }
    else {
        callback(400,{"Error":"Missing Required Fields"});
    };
};
handlers._users.get = function(data,callback){

};
handlers._users.put = function(data,callback){

};
handlers._users.delete = function(data,callback){

};

// Handlers for 'home', 'isAlive' and 'notFound' routes
handlers.home = function(data,callback){
	callback(200,{'message':'Welcome Home!'});
};

handlers.isAlive = function(data,callback){
	callback(200);
};

handlers.notFound = function(data,callback){
	callback(404);
};

module.exports = handlers;
