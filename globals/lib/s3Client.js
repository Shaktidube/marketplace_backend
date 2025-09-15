require('dotenv').config();
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  endpoint: "https://s3.filebase.com",
  region: process.env.FILEBASE_REGION || "",
  credentials: {
    accessKeyId: process.env.FILEBASE_ACCESS_KEY || "",
    secretAccessKey: process.env.FILEBASE_SECRET_KEY || "",
  },
});

module.exports = s3;