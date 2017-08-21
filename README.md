# AWS S3 Pre-signed Query String URLs

Looking for help as to why this implementation does not comply with the reference signing available on

http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html

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

    [calculated signingKey] d949da6fe2897897d73557446db35c06dc34feb7f74e7d949c6fe9d674a02103
    [  expected signingKey] NOT PROVIDED

    [calculated signature] ec43271c228d0d408e25dd8ec1e3b71ed7c1dbfe5c76bd7f272d3bff665e1f16
    [  expected signature] aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404

    CALCULATED URL
    https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=ec43271c228d0d408e25dd8ec1e3b71ed7c1dbfe5c76bd7f272d3bff665e1f16

    EXPECTED URL
    https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404
