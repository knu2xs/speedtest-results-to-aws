"use strict";
/* global require */

// hard variables to ensure always the same place
const dynamoTableName = "internet-speed";

// package imports
const speedTest = require('speedtest.net'),
    AWS = require('aws-sdk'),
    uuid = require('uuid/v4');

// import local location configuration
const localConfig = require('./resources/local_config');

// set Amazon configuration options
AWS.config.loadFromPath('./resources/aws_config.json');

// function to put results into Amazon DynamoDB
const putToDynamo = function(item){

  // create the document client object for working with AWS
  const docClient = new AWS.DynamoDB.DocumentClient();

  // create the put parameters
  const parameters = {
    TableName: dynamoTableName,
    Item: item
  };

  // put the data into the table
  docClient.put(parameters, function(error, data){
    if(error) console.log(error);
    else console.log(data);
  });
  
};  // close putToDynamo


// run the SpeedTest
speedTest.runTest(function (speedTestResponse) {

  // clean up and add all values to JSON item object
  const item = {
    uuid: uuid(),
    timestamp: speedTestResponse.timestamp,
    physicalAddress: localConfig.physicalAddress.toUpperCase(),
    serviceProvider: localConfig.serviceProvider.toUpperCase(),
    speedDownload: parseFloat(speedTestResponse.download),
    speedUpload: parseFloat(speedTestResponse.upload)
  };
  
  // put the results into Dynamo
  putToDynamo(item);

});  // close runTest