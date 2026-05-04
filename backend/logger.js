const winston = require("winston");
require("winston-cloudwatch");

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),

    new winston.transports.CloudWatch({
      logGroupName: "reloop-app-logs",
      logStreamName: "local-dev",
      awsRegion: process.env.AWS_REGION,

      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,

      jsonMessage: true,
    }),
  ],
});

module.exports = logger;
