'use strict'

var RSVP = require('rsvp')
var Promise = RSVP.Promise
var storage = require('./s3')


exports.pullManifest = function (done){
  storage.getFile(process.env.S3_BUCKET, '.manifest.json', function (err, data) {
    if (err)
      return (err.code == 'NoSuchKey') ? done(null, {}) : done(err)

    console.log('Trying to Parse')
    done(null, JSON.parse(data.Body))
  })
}

exports.diffManifests = function (currentManifest, oldManifest) {
  return Object.keys(currentManifest).filter(function (filename) {
    return currentManifest[filename] != oldManifest[filename]
  })
}

exports.upload = function (uploadables, done) {
  if (uploadables.length <= 1) // Only Manifest file has changed.
    return done(null, 'No Files Uploaded')

  var promises = uploadables.map(function (uploadable) {
    return new Promise(function (resolve, reject) {
      storage.putFile(process.env.S3_BUCKET, uploadable, function (err, data) {
        if (err) return reject(err)

        return resolve(data)
      })
    })
  })

  RSVP.all(promises).then(function (results) {
    done(null, results)
  }, function (rejectData){
    done(rejectData)
  })
}
