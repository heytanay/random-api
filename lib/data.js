// Library used for Storing and Editing Data

var fs = require("fs");
var path = require("path");
var helpers = require("./helpers");

// Container for this Module
var lib = {};

// Base Directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/');

// This Function creates a specified file.
lib.create = (dir,file,data,callback) =>{

    // Requirements-  dir: Directory you are referencing
    //               file: The Name of file to be created
    //               data: Data object which needs to be written to the newly created file

    // Open the file for writing, if it doesnot exist; Create it.

    fs.open(lib.baseDir + dir + '/' + file + '.json','wx',function(err,fileDescriptor){
        if (!err && fileDescriptor){

            // Convert Data to String
            var stringData = JSON.stringify(data);

            // Write to File and Close it
            fs.writeFile(fileDescriptor,stringData,function(err){
                if (!err){
                    fs.close(fileDescriptor, function(err){
                        if (!err){
                            callback(false);
                        }
                        else {
                            callback("Error closing a New file");
                        };
                    });
                }
                else{
                    callback("Error writing to new file");
                };
            })
        }
        else {
            callback("Couldn't Create New File, It may already exist.");
        };
    });
};

// Used for reading contents of a file
lib.read = (dir,file,callback) =>{
    // takes 'dir': directory name; 'file': name of the file; 'callback': std callback function
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if (!err){
            // If there is NO error, parse the data and then pass on a 'false' error flag along with the parsed-data
            // If not => callback the error along with the unparsed-data
            // This uses '*.parseJSONToObject()' from helpers.js

            var parsedData = helpers.parseJSONToObject(data);
            callback(false,parsedData);
        }
        else {
            callback(err,data);
        };
    });
};

// This function updates an existing file in the file system
lib.update = (dir,file,data,callback) => {
    // Open the File for Writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function(err,fileDescriptor){
        if (!err && fileDescriptor){

            var stringData = JSON.stringify(data);

            // Truncate the File
            fs.ftruncate(fileDescriptor,function(err){
                if (!err){

                    // Write to the File
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if (!err){

                            // Close the File
                            fs.close(fileDescriptor,function(err){

                                if (!err){
                                    callback(false);
                                }
                                else {
                                    callback("Error Closing the File");
                                };
                            });
                        }
                        else {
                            callback("Error Writing to Existing File");
                        };
                    });
                }
                else {
                    callback("Error Truncating File");
                };
            });
        }
        else {
            callback("Could not open the File yet, it may not exist yet.");
        };
    });
};

// This Function deletes the file(unlinks from file system).
lib.delete = (dir,file,callback) =>{
    // Unlink the File from File System
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if (!err){
            callback(false);
        }
        else{
            callback("Trouble Deleting the File");
        };
    });
}


// This function lists all the items in a directory
lib.list = function(dir, callback){

    fs.readdir(lib.baseDir+dir+'/',function(err, data){

        // If there is no error and there is some data with length more than zero, go on;
        // else callback the error along with the data(if it exists)
        
        if (!err && data && data.length > 0){
            // Initialise an empty array "trimmedFileNames"
            var trimmedFileNames = [];

            // Iterate over all files in the directory and replace each one's '.json' extension with empty string
            // and then push them into the 'trimmedFileNames' array
            data.forEach(function(filename){
                trimmedFileNames.push(filename.replace('.json',''));
            });
            // After this, callback false (no error) and the 'trimmedFileNames' array
            callback(false, trimmedFileNames);
        }
        else{
            callback(err, data);
        }
    });
}


// Export this module
module.exports = lib;
