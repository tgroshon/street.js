'use strict'

var RSVP = require('rsvp')
var Promise = RSVP.Promise
var storage = require('./s3')

module.exports = {

  remoteManifest: null,


  pullRemoteManifest: function (done) {
    var self = this
    storage.getFile(process.env.S3_BUCKET, 'manifest.json', function (err, data) {
      if (err) return done(err)

      self.remoteManifest = JSON.parse(data.Body)
      done(null, self.remoteManifest)
    })
  },

  diffManifests: function (manifest) {
    return Object.keys(manifest).filter(function (filename) {
      return manifest[filename] != this.remoteManifest[filename]
    }.bind(this))
  },

  upload: function (uploadables, done) {

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
}
