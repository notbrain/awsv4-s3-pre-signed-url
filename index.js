#!/usr/bin/env node

const s3v4signer = require('./awsv4-s3-pre-signed-url.js');

let doc = {
  name: 'test.txt'
};

const presignedURL = s3v4signer.getS3SignedDocumentURL(doc);

console.log('\nCALCULATED URL');
console.log(presignedURL);

console.log('\nEXPECTED URL');
console.log('https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404');
