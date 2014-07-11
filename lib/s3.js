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
  // var params = {
  //   Bucket: bucket, // required
  //   Key: uploadable.name, // required
  //   Body: uploadable.stream, // required
  //
  //   ContentMD5: 'STRING_VALUE',
  //   Expires: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
  //   WebsiteRedirectLocation: 'STRING_VALUE'
  // }
  // s3.putObject(params, function(err, data) {
  //   if (err) done(err)
  //   else     done(null, data)
  // })
  done(null, 'Uploaded ' + uploadable.name)
}
