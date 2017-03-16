import AWS from 'aws-sdk'

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

var s3 = new AWS.S3();

export function saveWav(blob, filename, onProgress) {
  const config = {
    bucket: "vocalappstems"
  }

  const file = new File([blob], filename)

  var params = { Key: filename , ContentType: file.type, Body: file, Bucket: config.bucket};

  return new Promise((resolve, reject) => {
    s3.putObject(params, function(err, data) {
      if(err) {
        reject(err)
      }
      else {
        resolve(data)
      }
    })
    .on('httpUploadProgress', onProgress);
  })

}
