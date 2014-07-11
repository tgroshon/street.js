'use strict'

require('dotenv').load()
var ContentHasher = require('./content-hasher')
var BucketCommunicator = require('./bucket-communicator')


var hasher = new ContentHasher('../street.js/fakes/') // From Project Root

hasher.on('built', function() {

  BucketCommunicator.pullRemoteManifest(function(err, manifest) {
    var diffFiles = BucketCommunicator.diffManifests(hasher.getManifest())

    var uploadables = hasher.findUploadables(diffFiles)

    BucketCommunicator.upload(uploadables, function (err, data) {
      if (err){
        console.log('Error')
        console.log(err)
        return
      }

      console.log('Upload data')
      console.log(data)
    })

  })
})

hasher.build()
