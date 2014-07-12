'use strict'

var debug = require('debug')('street:main')
var UploadableCollector = require('./uploadable-collector')
var BucketCommunicator = require('./bucket-communicator')

module.exports = function (contentDirectory, isDryRun) {
  var collector = new UploadableCollector(contentDirectory) // From Project Root

  collector.collect(function (){

    BucketCommunicator.pullManifest(function(err, manifest) {
      if (err) console.error(err)

      var diffFiles = BucketCommunicator.diffManifests(collector.getManifest(), manifest)
      debug('found ' + (diffFiles.length - 1) + ' changed files besides manifest')

      if (diffFiles.length > 1){ // Always contains a new Manifest file
        var uploadables = collector.findUploadables(diffFiles)

        debug('uploading ' + (diffFiles.join(', ')) + ' files to S3')
        BucketCommunicator.upload(uploadables, isDryRun, function (err, data) {
          if (err) console.error(err)

          console.log('upload complete!')
          console.log('finished!')
        })
      } else {
        console.log('finished!')
      }
    })
  })
}
