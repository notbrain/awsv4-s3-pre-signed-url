# AWS S3 Pre-signed Query String URLs

Quick and dirty implementation of

http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html

This mini-app uses the example values referenced on that page.

![AWS V4 Signing Flow](http://docs.aws.amazon.com/AmazonS3/latest/API/images/sigV4-using-query-params.png)

# Installation

`git clone git@github.com:notbrain/awsv4-s3-pre-signed-url.git`

`npm install`

`node .`

## Expected output:

    $ node .

    ------------[canonicalRequest]------------
    GET
    /test.txt
    X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host
    host:examplebucket.s3.amazonaws.com

    host
    UNSIGNED-PAYLOAD
    ------------[/canonicalRequest]------------

    [         encoded canonical request] 3bfa292879f6447bbcda7001decf97f4a54dc650c8942174ae0a9121cf58ad04
    [expected encoded canonical request] 3bfa292879f6447bbcda7001decf97f4a54dc650c8942174ae0a9121cf58ad04

    [calculated signature] aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404
    [  expected signature] aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404

    CALCULATED URL
    https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404

    EXPECTED URL
    https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404
