require('dotenv').load();
var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var ManifestBuilder = require('./manifest-builder');
var storage = require('./s3');


// TODO Move BucketCommunicator to its own module
/* BucketCommunicator */

var BucketCommunicator = {

  remoteManifest: null,

  pullRemoteManifest: function (manifest) {
    // TODO get the manifest file from the S3 bucket
    this.remoteManifest = {}

    Object.keys(manifest).forEach(function (key) {
      this.remoteManifest[key] = manifest[key];
    }.bind(this))

    this.remoteManifest[Object.keys(this.remoteManifest)[0]] = 'bob';
    return this.remoteManifest;
  },

  diffManifests: function (manifest) {
    return Object.keys(manifest).filter(function (filename) {
      return manifest[filename] != this.remoteManifest[filename];
    }.bind(this))
  },

  upload: function (uploadables, done) {
    var promises = uploadables.map(function (uploadable) {
      return new Promise(function (resolve, reject) {
        storage.putFile(uploadable, function (err, data) {
          if (err) return reject(err);

          return resolve(data);
        })
      });
    })

    RSVP.all(promises).then(function (results) {
      done(null, results)
    });
  }
}



var builder = new ManifestBuilder('../street.js/fakes/'); // From Project Root
builder.build();

(function main() {
  if (builder.built) {
    BucketCommunicator.pullRemoteManifest(builder.manifest);

    var diffFiles = BucketCommunicator.diffManifests(builder.manifest);
    console.log(diffFiles);

    BucketCommunicator.upload(builder.createUploadables(diffFiles), function (err, data) {
      console.log(data)
    })

  } else {
    builder.on('built', function() {
      main()
    });
  }
})();
