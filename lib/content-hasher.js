var crypto = require('crypto')
var fs = require('fs')
var path = require('path')

var EventEmitter = require('events').EventEmitter
var RSVP = require('rsvp')
var Promise = RSVP.Promise
var ManifestBuilder = require('./manifest-builder')
var Uploadable = require('./uploadable')


/*
 * ContentHasher
 */
function ContentHasher (dir) {
  this.contentDir = path.resolve(dir)
  this._manifestBuilder = new ManifestBuilder()
  this._uploadablesCache = {}
  this.built = false
  this._filePaths = []
  EventEmitter.call(this)
}


/*
 * Prefix a list of filenames with Content Directory Path
 */
ContentHasher.prototype.findUploadables = function (filenames) {
  return filenames.map(function (filename) {
    return this._uploadablesCache[filename]
  }.bind(this))
}

ContentHasher.prototype.getManifest = function () {
  return this._manifestBuilder.manifest
}
/*
 * Construct a Manifest of content directory
 */
ContentHasher.prototype.build = function () {
  var self = this
  new Promise(function (resolve, reject) {
    self._findFiles(self.contentDir, function (err, files) {
      if (err)  return reject(err)

      resolve(files)
    })
  })
  .then(function (files) {
    files.forEach(function (filepath) {
      var uploadable = new Uploadable(filepath.replace(self.contentDir + '/', ''), filepath)
      self._manifestBuilder.add(uploadable)
      self._uploadablesCache[uploadable.name] = uploadable
    })

    self._manifestBuilder.save(self.contentDir, function (err) {
      self.built = true
      self.emit('built')
    })

  }, function (thenErr) {
    console.log('thenErr')
    console.log(thenErr)
  })
}

/*
 * Serial loop through the files so we know when we found them all.
 */
ContentHasher.prototype._findFiles = function (dir, done) {
  var self = this
  var results = []

  fs.readdir(dir, function(err, filelist) {
    if (err) return done(err)

    var i = 0

    ;(function next() {
      var file = filelist[i++]

      if (!file) return done(null, results)

      file = dir + '/' + file

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          self._findFiles(file, function(err, res) {
            results = results.concat(res)
            next()
          })
        } else {
          results.push(file)
          next()
        }
      })
    })()

  })
}


ContentHasher.prototype.__proto__ = EventEmitter.prototype

module.exports = ContentHasher
