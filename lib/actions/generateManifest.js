const { messages } = require('elasticio-node');
const aws = require('aws-sdk');

exports.process = async function (msg, cfg) {
  const s3 = new aws.S3({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.accessKeySecret,
  });

  // eslint-disable-next-line no-param-reassign
  cfg.bucketName = msg.body.bucketName ? msg.body.bucketName : cfg.bucketName;

/*
{
  "entries": [
    {"url":"s3://mybucket-alpha/custdata.1","mandatory":true},
    {"url":"s3://mybucket-alpha/custdata.2","mandatory":true},
    {"url":"s3://mybucket-beta/custdata.1","mandatory":false}
  ]
}
*/

  // eslint-disable-next-line no-use-before-define
  var awsInputs = createAWSInputs(cfg.bucketName)
  const data = await s3.listObjectsV2(awsInputs).promise();
  var results = []
  data.Contents.forEach((c) => {
    results.push({
        url: "s3://" + awsInputs.Bucket + "/" + c.Key,
        mandatory: true
    })
  });

  s3.putObject({
      Bucket: cfg.BucketName,
      Key: 'manifest.txt',
      Body: JSON.stringify({entries: results}),
      ContentType: "application/json"});

  this.emit('data', messages.newMessageWithBody({ filename: 'manifest.txt' }));
};

function createAWSInputs(bucketName) {
  if (bucketName.indexOf('/') > -1) {
    const index = bucketName.indexOf('/');
    const folder = `${bucketName.substring(index + 1)}/`;
    const bucket = bucketName.substring(0, index);
    return { Bucket: bucket, Delimiter: '/', Prefix: folder, EncodingType: url };
  }
  return { Bucket: bucketName, EncodingType: url };
}