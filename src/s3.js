import AWS from 'aws-sdk'
import { getCached, isCached } from './cache'

/*
 * Authenticates through environment variables:
 *  - AWS_ACCESS_KEY_ID
 *  - AWS_SECRET_ACCESS_KEY
 * Or by passing in values
 */
let params = {}

if (isCached('awsKey')) {
  params.accessKeyId = getCached('awsKey')
}

if (isCached('awsSecret')) {
  params.secretAccessKey = getCached('awsSecret')
}

var s3 = new AWS.S3(params)

export var instance = s3

export function getFile (filename) {
  var params = {
    Bucket: getCached('dest'),
    Key: filename
  }

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => { err ? reject(err) : resolve(data) })
  })
}

export function putUploadable (uploadable) {
  var params = {
    Bucket: getCached('dest'),
    Key: uploadable.name,
    Body: uploadable.stream(),
    ContentType: uploadable.contentType
  }

  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => { err ? reject(err) : resolve(data) })
  })
}
