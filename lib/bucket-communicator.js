'use strict'

var RSVP = require('rsvp')
var Promise = RSVP.Promise
var storage = require('./s3')

module.exports = {

  remoteManifest: null,

  pullRemoteManifest: function (manifest) {
    // TODO get the manifest file from the S3 bucket
    this.remoteManifest = {}

    Object.keys(manifest).forEach(function (key) {
      this.remoteManifest[key] = manifest[key]
    }.bind(this))

    this.remoteManifest[Object.keys(this.remoteManifest)[0]] = 'bob'
    return this.remoteManifest
  },

  diffManifests: function (manifest) {
    return Object.keys(manifest).filter(function (filename) {
      return manifest[filename] != this.remoteManifest[filename]
    }.bind(this))
  },

  upload: function (uploadables, done) {
    var promises = uploadables.map(function (uploadable) {
      return new Promise(function (resolve, reject) {
        storage.putFile('bucket', uploadable, function (err, data) {
          if (err) return reject(err)

          return resolve(data)
        })
      })
    })

    RSVP.all(promises).then(function (results) {
      done(null, results)
    })
  }
}
