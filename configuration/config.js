// Create empty enviorment Object and fill it up with 'staging', 'production' and 'development' props

var enviorments = {};

enviorments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'Staging',
    'hashingSecret': 'CharriotOfFire',
    'maxChecks': 5
};

enviorments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'Production',
    'hashingSecret': 'CharriotOfFire',
    'maxChecks': 5
};

enviorments.development = {
    'httpPort': 8998,
    'httpsPort': 8999,
    'envName':'Development',
    'hashingSecret': 'CharriotOfFire',
    'maxChecks': 5
};

// Check if the enviorment provided is a  valid string or not
var enviormentState = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';

// Enviorment Object to be exported
var enviormentToExport = typeof(enviorments[enviormentState]) == 'object' ? enviorments[enviormentState] : enviorments.staging;

module.exports = enviormentToExport;