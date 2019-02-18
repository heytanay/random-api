/*
* Create and Export Configuration Variables
*/

// Container for all the Enviorments
var enviorements = {};

// Staging (default) enviorment
enviorements.staging = {
    'port': 3000,
    'envName': 'Staging',
};

// Production enviorment
enviorements.production = {
    'port': 5000,
    'envName': 'Production',
};

// Determine which enviorment was passed as a command-line argument, if the passed input is not a string, then an empty string is passed
var currentEnviorment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check the Current enviorment and get it ready for export
var enviormentToExport = typeof(enviorements[currentEnviorment]) == 'object' ? enviorements[currentEnviorment] : enviorements.staging;

// Export the Enviorment state
module.exports = enviormentToExport;