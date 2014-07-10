var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var RSVP = require('rsvp');
var Promise = RSVP.Promise;

var Uploadable = require('./uploadable')


/*
 * ManifestBuilder
 */
function ManifestBuilder (dir) {
  this.contentDir = path.resolve(dir);
  this.manifest = {};
  this.built = false;
  this._filePaths = [];
  EventEmitter.call(this);
};


/*
 * Write Manifest to a file
 */
ManifestBuilder.prototype.save = function () {
  var self = this;

  fs.writeFile(self.contentDir + '/manifest.json', JSON.stringify(self.manifest), function (err) {
    if (err) throw err;

    self.emit('saved');
  });
};

/*
 * Prefix a list of filenames with Content Directory Path
 */
ManifestBuilder.prototype.createUploadables = function (filenames) {
  return filenames.map(function (filename) {
    return new Uploadable(filename, this.contentDir + '/' + filename)
  }.bind(this))
};

/*
 * Construct a Manifest of content directory
 */
ManifestBuilder.prototype.build = function () {
  var self = this;
  new Promise(function (resolve, reject) {
    self._findFiles(self.contentDir, function (err, files) {
      if (err)  return reject(err);

      resolve(files);
    });
  })
  .then(function (files) {
    async.each(files, self._fileHash.bind(self), function (err) {
      if (err) return console.log('ASYNC Err', err);

      Object.keys(self.manifest).forEach(function (filepath) {
        var hash = self.manifest[filepath];
        delete self.manifest[filepath];

        self.manifest[filepath.replace(self.contentDir + '/', '')] = hash;
      });

      self.built = true;
      self.emit('built');
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
  var hash = crypto.createHash('md5');

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

module.exports = ManifestBuilder;
