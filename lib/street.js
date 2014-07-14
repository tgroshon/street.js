'use strict'

var debug = require('debug')('street:main')
var UploadableCollector = require('./uploadable-collector')
var validateOptions = require('./validate-options')

module.exports = function (options) {

  validateOptions(options)

  var BucketCommunicator = require('./bucket-communicator') // Must come after validateOptions

  var collector = new UploadableCollector(options.src)

  collector.collect(function (){

    BucketCommunicator.pullManifest(options, function(err, manifest) {
      if (err) console.error(err)

      var diffFiles = BucketCommunicator.diffManifests(collector.getManifest(), manifest)
      debug('found ' + (diffFiles.length - 1) + ' changed files besides manifest')

      if (options.verbose && !process.env.DEBUG)
        console.log('found ' + (diffFiles.length - 1) + ' changed files besides manifest')

      if (diffFiles.length > 1){ // Always contains a new Manifest file
        var uploadables = collector.findUploadables(diffFiles)

        debug('uploading ' + (diffFiles.join(', ')) + ' files to S3')

        if (options.verbose && !process.env.DEBUG)
          console.log('uploading ' + (diffFiles.join(', ')) + ' files to S3')

        BucketCommunicator.upload(uploadables, options, function (err, data) {
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
