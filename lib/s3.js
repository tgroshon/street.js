'use strict'

var AWS = require('aws-sdk')
var debug = require('debug')('street:S3')

/*
 * Authenticates through environment variables
 *  - AWS_ACCESS_KEY_ID
 *  - AWS_SECRET_ACCESS_KEY
 */
var s3 = new AWS.S3()

exports.instance = s3

exports.getFile = function (options, filename, done) {
  var params = {
    Bucket: options.dest,
    Key: filename,
  }

  debug('downloading ' + filename)
  s3.getObject(params, function(err, data) {
    if (err) return done(err)

    done(null, data)
  })
}

exports.putFile = function (options, uploadable, done) {
  var params = {
    Bucket: options.dest,
    Key: uploadable.name,
    Body: uploadable.getStream(),
    ContentType: uploadable.contentType
  }

  debug('uploading ' + uploadable.name + ' (' + uploadable.hash + ')')
  s3.putObject(params, function(err, data) {
    if (err) return done(err)

    return done(null, data)
  })
}
