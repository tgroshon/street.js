'use strict'

require('dotenv').load()
var ContentHasher = require('./content-hasher')
var BucketCommunicator = require('./bucket-communicator')

module.exports = function (contentDirectory) {
  var hasher = new ContentHasher('../street.js/fakes/') // From Project Root

  hasher.build(function (){
    BucketCommunicator.pullManifest(function(err, manifest) {
      if (err) console.log(err)

      var diffFiles = BucketCommunicator.diffManifests(hasher.getManifest(), manifest)

      console.log('Different Files')
      console.log(diffFiles)
      var uploadables = hasher.findUploadables(diffFiles)

      BucketCommunicator.upload(uploadables, function (err, data) {
        if (err){
          console.log('Upload Error')
          console.log(err)
          return
        }

        console.log('Upload data')
        console.log(data)
      })

    })
  })


}
