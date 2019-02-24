// Create empty enviorment Object and fill it up with 'staging', 'production' and 'development' props

var enviorments = {};

enviorments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'Staging',
    'hashingSecret': 'CharriotOfFire',
};

enviorments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'Production',
    'hashingSecret': 'CharriotOfFire',
};

enviorments.development = {
    'httpPort': 8998,
    'httpsPort': 8999,
    'envName':'Development',
    'hashingSecret': 'CharriotOfFire',
};

// Check if the enviorment provided is a  valid string or not
var enviormentState = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';

//
var enviormentToExport = typeof(enviorments[enviormentState]) == 'object' ? enviorments[enviormentState] : enviorments.staging;

module.exports = enviormentToExport;