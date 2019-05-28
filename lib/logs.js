/*
*   Library for Storing and rotating (compressing and decompressing) the logs
*/

// Dependencies
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');


// Container for the Module
var lib = {};

// All the log files go into the "root> /.logs/" directory
lib.baseDir = path.join(__dirname+'/../.logs/');

// Append a string to a file, create the file if it doesnot exists
lib.append = function(fileName, stringToAppend, callback){
    // Open the file for appending
    fs.open(lib.baseDir+fileName+'.log','a',function(err, fileDescriptor){
        if (!err && fileDescriptor){
            // Append the string to the specified file
            fs.appendFile(fileDescriptor, stringToAppend+'\n',function(err){
                if (!err){
                    fs.close(fileDescriptor, function(err){
                        if (!err){
                            callback(false);
                        }
                        else{
                            callback("Error closing file that was being appended");
                        }
                    });
                }
                else{
                    callback("Error appending to the file");
                }
            });
        }
        else{
            callback("Error, Couldnot open file for appending");
        }
    });
}



// Export the Container
module.exports = lib;



