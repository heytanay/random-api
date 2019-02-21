// Create empty enviorment Object and fill it up with 'staging', 'production' and 'development' props

var enviorments = {};

enviorments.staging = {
    'port': 3000,
    'envName': 'Staging',
};

enviorments.production = {
    'port': 5000,
    'envName': 'Production',
};

enviorments.development = {
    'port': 8998,
    'envName':'Development',
};

// Check if the enviorment provided is a  valid string or not
var enviormentState = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';

//
var enviormentToExport = typeof(enviorments[enviormentState]) == 'object' ? enviorments[enviormentState] : enviorments.staging;

module.exports = enviormentToExport;