'use strict'

require('dotenv').load()
var ContentHasher = require('./content-hasher')
var BucketCommunicator = require('./bucket-communicator')


var hasher = new ContentHasher('../street.js/fakes/') // From Project Root
hasher.on('built', function() {
  BucketCommunicator.pullRemoteManifest(hasher.getManifest())

  var diffFiles = BucketCommunicator.diffManifests(hasher.getManifest())
  console.log(diffFiles)

  var uploadables = hasher.findUploadables(diffFiles)

  BucketCommunicator.upload(uploadables, function (err, data) {
    console.log(data)
  })
})

hasher.build()
