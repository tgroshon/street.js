'use strict'

var AWS = require('aws-sdk')

var s3 = new AWS.S3()

exports.instance = s3

exports.getFile = function (bucket, filename, done) {
  var params = {
    Bucket: bucket,
    Key: filename,
  }
  s3.getObject(params, function(err, data) {
    if (err) return done(err)

    done(null, data)
  })
}

exports.putFile = function (bucket, uploadable, done) {
  var params = {
    Bucket: bucket,
    Key: uploadable.name,
    Body: uploadable.stream,
    ContentMD5: uploadable.hash
  }
  s3.putObject(params, function(err, data) {
    if (err) return done(err)

    return done(null, data)
  })
}
