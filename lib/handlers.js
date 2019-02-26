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
    /*
    *   Required Data: firstName, lastName, phone, password, TOSagreement
    *   Optional Data: None
    */

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
    /*
    *   Required Data: Phone (only through Query String, not payload; Payloads aren't accepted in GET and DELETE methods)
    *   Optional Data: None
    */

    // Check the Phone Number
    var phone = typeof(data.query.phone) == 'string' && data.query.phone.trim().length == 10 ? data.query.phone.trim() : false;

    // If Phone number exists, then read is using '*.read()' function, else callback an error with a statusCode 400
    if (phone){
        _data.read('users',phone,function(err,data){
            // If there is No error and data got while reading, then delete hashedPass and callback 200 and return the data
            // else callback a 404 

            if (!err && data){
                // Remove the Hashed Password from User Object before returning it to requester
                
                delete data.hashedPass;
                callback(200,data);
            }
            else{
                callback(404);
            }
        });
    }
    else {
        callback(400,{"Error":"Phone number not provided"});
    }

};


handlers._users.put = function(data,callback){
    /* 
    *  Required Data: Phone
    *  Optional Data: firstName, lastName, Password (atleast one of the Optional data must be specified along with required Phone Number)
    */
    
    // Check for Required Fields
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for Optional Fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    // If Phone number is provided, then continue, else error out with statusCode 400
    if(phone){
        
        // If anyone of firstName, lastName or password is provided then continue, else error-out with statusCode 400
        if(firstName || lastName || password){

            // Read the data from the disk/database
            _data.read('users',phone,function(err,userData){
                if (firstName){
                    userData.firstName = firstName;
                }
                if (lastName){
                    userData.lastName = lastName;
                }
                if (password){
                    userData.hashedPass = helpers.hash(password);
                }

                // Update the new userData to the Disk
                _data.update('users',phone,userData,function(err){
                    if (!err){
                        callback(200);
                    }
                    else {
                        console.log(err);
                        callback(500,{'Error':'Couldnot Update UserData'});
                    }
                });
            });
        }
        else {
            callback(400,{'Error':'You should provide atleast 1 Optional Field'});
        }
    } 
    else{
        callback(400,{'Error':'Missing Required Fields'});
    }
};
handlers._users.delete = function(data,callback){
    /*
    *   Required Data: Phone (Only through Query String, since GET and DELETE methods don't expect Payload)
    *   Optional Data: None
    */

    // Check if the Phone number is valid
    var phone = typeof(data.query.phone) == 'string' && data.query.phone.trim().length == 10 ? data.query.phone.trim() : false;
   
    // If Phone number is valid, read the data with '*.read()', else callback a 400 statusCode
    if (phone){

        // If there is no error reading data and data is returned, delete the data using the '*.delete()' method
        _data.read('users',phone,function(err,data){
            if (!err && data){
                _data.delete('users',phone,function(err){

                    // If there is no error, callback a statusCode 200, else callback a statusCode 500 (Internal error);
                    if (!err){
                        callback(200);
                    }
                    else{
                        callback(500,{'Error':'Couldnot delete User'});
                    }
                });
            }
            else{
                callback(404,{'Error':'Couldnot find the specified User'});
            }
        });
    }
    else {
        callback(400,{"Error":"Phone number not provided"});
    }
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