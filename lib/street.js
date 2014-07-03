var crypto = require('crypto');
var fs = require("fs");
var path = require('path');
var RSVP = require('rsvp');
var async = require('async');
var Promise = RSVP.Promise;
var EventEmitter = require('events').EventEmitter;

function ManifestBuilder (dir) {
  this.dir = path.resolve(dir);
  this.manifest = {};
  this._filePaths = [];
  EventEmitter.call(this);
};

ManifestBuilder.prototype.rehash = function () {
  var self = this;
  new Promise(function (resolve, reject) {
    self._findFiles(self.dir, function (err, files) {
      if (err)  return reject(err);

      resolve(files);
    });
  })
  .then(function (files) {
    async.each(files, self._fileHash.bind(self), function (err) {
      if (err) return console.log('ASYNC Err', err);

      self.emit('rehashed');
    });
  }, function (thenErr) {
    console.log('thenErr');
    console.log(thenErr);
  });
};

/*
 * Serial loop through the files so we know when we found them all.
 */
ManifestBuilder.prototype._findFiles = function (dir, done) {
  var self = this;
  var results = [];

  fs.readdir(dir, function(err, list) {
    if (err) return done(err);

    var i = 0;

    (function next() {
      var file = list[i++];

      if (!file) return done(null, results);

      file = dir + '/' + file;

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          self._findFiles(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();

  });
};

ManifestBuilder.prototype._fileHash = function (path, done) {
  var self = this;
  var reader = fs.createReadStream(path);
  var hash = crypto.createHash('sha1');

  hash.setEncoding('hex');

  reader.on('end', function() {
      hash.end();
      self.manifest[path] = hash.read();
      done();
  });
  // read all file and pipe it (write it) to the hash object
  reader.pipe(hash);
};

ManifestBuilder.prototype.__proto__ = EventEmitter.prototype;

var m = new ManifestBuilder('./fakes');
m.on('rehashed', function () {
  console.log('Event Fired');
  console.log(m.manifest);
});
m.rehash();
