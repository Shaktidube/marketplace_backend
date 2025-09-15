const { BucketManager , ObjectManager , NameManager , GatewayManager , PinManager  } = require("@filebase/sdk");

 
// Initialize BucketManager
const bucketManager = new BucketManager(S3_KEY, S3_SECRET);
// Create bucket
const bucketName = `create-bucket-[nft]`;
await bucketManager.create(bucketName);
 
// Initialize ObjectManager
const objectManager = new ObjectManager(S3_KEY, S3_SECRET, {
  bucket: bucketName
});
// Upload Object
const objectName = `new-object`;
const uploadedObject = await objectManager.upload(objectName, body);
// Download Object
await uploadedObject.download();
// Copy Object to a New Bucket
const bucketCopyDestinationName = `copy-dest-bucket`
await bucketManager.create(bucketCopyDestinationName);
await objectManager.copy(`new-object`, bucketCopyDestinationName);
 
// Initialize NameManager
const nameManager = new NameManager(S3_KEY, S3_SECRET);
// Create New IPNS Name with Broadcast Disabled
const ipnsLabel = `myFirstIpnsKey`;
const ipnsName = await nameManager.create(ipnsLabel, uploadedObject.cid, {
  enabled: true
});
 
// Initialize GatewayManager
const gatewayManager = new GatewayManager(S3_KEY, S3_SECRET);
// Create New Gateway
const gatewayName = "myRandomGatewayName";
const myGateway = await gatewayManager.create(gatewayName);
 
// Initialize PinManager
const pinManager = new PinManager(S3_KEY, S3_SECRET, {
  bucket: bucketName,
  gateway: {
    endpoint: "https://myRandomGatewayName.myfilebase.com"
  }
});
// Create New Pin with Metadata
const myNewPin = await pinManager.create("my-pin", "QmTJkc7crTuPG7xRmCQSz1yioBpCW3juFBtJPXhQfdCqGF", {
  "application": "my-custom-app-on-filebase"
});