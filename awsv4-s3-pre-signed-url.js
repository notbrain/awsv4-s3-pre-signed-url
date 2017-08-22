const moment   = require('moment');
const crypto   = require("crypto");
const qs       = require('qs');

const S3_KEY_ID      = 'AKIAIOSFODNN7EXAMPLE';
const S3_SECRET_KEY  = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const S3_REGION      = 'us-east-1';
const DOCUMENTS_HOST = 'examplebucket.s3.amazonaws.com';
const S3_DOCS_BUCKET = 'examplebucket';

const AWS_SIGNING_ALGORITHM  = 'AWS4-HMAC-SHA256';
const S3_SERVICE             = 's3';
const S3_REQUEST_TYPE        = 'aws4_request';

/**
 * hmac helper function to wrap crypto.createHmac
 * @param  {string} key       The secret key
 * @param  {string} string    The string to encode
 * @param  {string} encoding  (Optional) The encoding to output
 * @return {string}           The result of the HMAC-SHA256
 */
function sha256hmac(key, string, encoding) {
  return crypto.createHmac('sha256', key).update(string, 'utf8').digest(encoding);
};

/**
 * hash helper function to wrap crypto.createHmac
 * @param  {string} key       The secret key
 * @param  {string} string    The string to encode
 * @param  {string} encoding  (Optional) The encoding to output
 * @return {string}           The result of the HMAC-SHA256
 */
function sha256hash(string, encoding) {
  return crypto.createHash('sha256').update(string, 'utf8').digest(encoding);
};

function getSigningDates() {
  // real implemetation use moment().utc
  return {
    longDate: '20130524T000000Z',
    shortDate: '20130524'
  };
}

// This function assumes the string has already been percent encoded
// Taken from https://github.com/mhart/aws4/blob/master/aws4.js
//
// maybe this is needed? Not seeing where anything would be caught by this
//
// function encodeRfc3986(urlEncodedString) {
//   return urlEncodedString.replace(/[!'()*]/g, function(c) {
//     return '%' + c.charCodeAt(0).toString(16).toUpperCase()
//   })
// }

/**
 * Build an object with request compnents, incl combined canonical request string
 * @param  {Document} document  The document name to retrieve from S3
 * @param  {string}   verb      HTTP Verb GET, POST, PUT, etc
 * @param  {[string]} scope     AWS Scope string
 * @return {[object]}           Component parts of Canonical request and string version of itself
 *
 * Example Ref Canonical Request:
 *
 * http verb: GET
 * canonicalUri: /test.txt
 * canonical querystring: X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host
 * canonical headers: host:examplebucket.s3.amazonaws.com
 *
 * host
 * UNSIGNED-PAYLOAD
 *
 */
function buildCanonicalRequest(document, verb, scope, signingDates) {

  let canonicalRequestObj = {
    verb,
    docURI: `/${document.name}`,
    queryStringObj: {
      'X-Amz-Algorithm': AWS_SIGNING_ALGORITHM,
      'X-Amz-Credential': `${S3_KEY_ID}/${scope}`,
      'X-Amz-Date': signingDates.longDate,
      'X-Amz-Expires': 86400,
      'X-Amz-SignedHeaders': 'host'
    },
    queryString: '',
    headers: `host:${DOCUMENTS_HOST}`,
    signedHeaders: 'host',
    canonicalRequest: ''
  };

  const queryString = qs.stringify(canonicalRequestObj.queryStringObj);
  canonicalRequestObj.queryString = queryString;

  const { docURI, headers, signedHeaders } = canonicalRequestObj;

  canonicalRequestObj.canonicalRequest = `${verb}\n${docURI}\n${queryString}\n${headers}\n\n${signedHeaders}\nUNSIGNED-PAYLOAD`.trimLeft();

  // console.log(JSON.stringify(canonicalRequestObj, null, 2));
  console.log('\n------------[canonicalRequest]------------\n' + canonicalRequestObj.canonicalRequest);
  console.log('------------[/canonicalRequest]------------\n');

  return canonicalRequestObj;

}

/**
 * Create string to sign
 *
 * @see
 *
 * @param  {string} canonicalRequest The canonical request string
 * @param  {object} signingDates     Object with longDate and shortDate
 * @param  {string} scope            AWS scope string
 * @return {string}                  The resulting string to sign
 */
function getStringToSign(canonicalRequest, signingDates, scope) {

  let encodedCanonicalRequest = sha256hash(canonicalRequest, 'hex');

  const stringToSign = `AWS4-HMAC-SHA256\n${signingDates.longDate}\n${scope}\n${encodedCanonicalRequest}`;

  console.log('[         encoded canonical request] ' + encodedCanonicalRequest);
  console.log('[expected encoded canonical request] 3bfa292879f6447bbcda7001decf97f4a54dc650c8942174ae0a9121cf58ad04');

  return stringToSign;

}

/**
 * Calculate signature
 * @param  {string} stringToSign Output from stringToSign()
 * @param  {object} signingDates Object with short and long date formats
 * @return {string}              Hex string signature
 */
function getSignature(stringToSign, signingDates) {

  // leaving off encoding causes hmac to return buffer
  // only need to return hex at last step
  const dateKey = sha256hmac('AWS4' + S3_SECRET_KEY, signingDates.shortDate);
  const dateRegionKey = sha256hmac(dateKey, S3_REGION);
  const dateRegionServiceKey = sha256hmac(dateRegionKey, S3_SERVICE);
  const signingKey = sha256hmac(dateRegionServiceKey, S3_REQUEST_TYPE);
  const signature = sha256hmac(signingKey, stringToSign, 'hex');

  console.log('\n[calculated signature] ' + signature);
  console.log('[  expected signature] aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404');

  return signature;

}

/**
 * Return a signed document URL given a Document instance
 * @param  {object} document Document
 * @return {string}          Pre-signed URL to document in S3 bucket
 *
 * @see http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
 *
 */
const getS3SignedDocumentURL = function getS3SignedDocumentURL(document) {
  const signingDates = getSigningDates();

  const aws_scope = `${signingDates.shortDate}/${S3_REGION}/${S3_SERVICE}/${S3_REQUEST_TYPE}`;

  const canonicalRequestObj = buildCanonicalRequest(document, 'GET', aws_scope, signingDates);

  const { canonicalRequest, docURI } = canonicalRequestObj;

  const stringToSign = getStringToSign(canonicalRequest, signingDates, aws_scope);

  const signature = getSignature(stringToSign, signingDates);

  const signedRequestQueryStringObject = {
    'X-Amz-Algorithm': AWS_SIGNING_ALGORITHM,
    'X-Amz-Credential': canonicalRequestObj.queryStringObj['X-Amz-Credential'],
    'X-Amz-Date': signingDates.longDate,
    'X-Amz-Expires': 86400,
    'X-Amz-SignedHeaders': canonicalRequestObj.signedHeaders,
    'X-Amz-Signature': signature
  };

  const querystring = qs.stringify(signedRequestQueryStringObject);

  // Expected output
  // ---------------
  // `https://s3.amazonaws.com/examplebucket/test.txt
  // ?X-Amz-Algorithm=AWS4-HMAC-SHA256
  // &X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request
  // &X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host
  // &X-Amz-Signature=<signature-value>`;
  //
  const signedDocumentURL = `https://${DOCUMENTS_HOST}${docURI}?${querystring}`;

  return signedDocumentURL;

}

module.exports = {
  getS3SignedDocumentURL
};
