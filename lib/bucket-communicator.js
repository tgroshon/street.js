'use strict'

var debug = require('debug')('street:communicator')
var RSVP = require('rsvp')
var Promise = RSVP.Promise
var storage = require('./s3')

var calculateDryRun = function (uploadables) {
  return uploadables.map(function (uploadable) {
    return 'Uploaded ' + uploadable.name
  })
}

exports.pullManifest = function (done){
  debug('Pulling Remote Manifest from S3')
  storage.getFile(process.env.S3_BUCKET, '.manifest.json', function (err, data) {
    if (err)
      return (err.code == 'NoSuchKey') ? done(null, {}) : done(err)

    done(null, JSON.parse(data.Body))
  })
}

exports.diffManifests = function (currentManifest, oldManifest) {
  debug('Calculating Manifest Diffs')
  return Object.keys(currentManifest).filter(function (filename) {
    return currentManifest[filename] != oldManifest[filename]
  })
}

exports.upload = function (uploadables, isDryRun, done) {
  if (uploadables.length <= 1) // Only Manifest file has changed.
    return done(null, 'No Files Uploaded')

  if (isDryRun)
    return done(null, calculateDryRun(uploadables))

  var promises = uploadables.map(function (uploadable) {
    return new Promise(function (resolve, reject) {
      storage.putFile(process.env.S3_BUCKET, uploadable, function (err, data) {
        if (err) return reject(err)

        debug('uploaded ' + uploadable.name)
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
