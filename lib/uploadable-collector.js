'use strict'

var fs = require('fs')
var path = require('path')
var RSVP = require('rsvp')
var Promise = RSVP.Promise
var debug = require('debug')('street:collector')

var ManifestBuilder = require('./manifest-builder')
var Uploadable = require('./uploadable')


/*
 * UploadableCollector Object for walking a
 */
function UploadableCollector (dir) {
  debug('initialized in ' + dir + ' directory')
  this.contentDir = path.resolve(dir)
  this._manifestBuilder = new ManifestBuilder()
  this._uploadablesCache = {}
  this._filePaths = []
}


/*
 * Prefix a list of file names with Content Directory Path
 */
UploadableCollector.prototype.findUploadables = function (fileNames) {
  debug('searching for uploadables')
  debug(fileNames)
  return fileNames.map(function (name) {
    return this._uploadablesCache[name]
  }.bind(this))
}

/*
 * Get Manifest from Internal Builder
 */
UploadableCollector.prototype.getManifest = function () {
  return this._manifestBuilder.manifest
}

/*
 * Store Uploadable Model in cache and internal manifest builder
 */
UploadableCollector.prototype.storeUploadable = function (uploadable) {
  this._manifestBuilder.add(uploadable)
  this._uploadablesCache[uploadable.name] = uploadable
}

/*
 * Walk the content directory and construct Uploadables from files
 */
UploadableCollector.prototype.collect = function (done) {
  debug('collecting files')

  var self = this
  new Promise(function (resolve, reject) {
    self._findFilePaths(self.contentDir, function (err, filePaths) {
      if (err) return reject(err)

      debug(filePaths)
      resolve(filePaths)
    })
  })
  .then(function (filePaths) {
    filePaths.forEach(function (filepath) {
      self.storeUploadable(new Uploadable(filepath.replace(self.contentDir + '/', ''), filepath))
    })

    if (filePaths.length > 0){
      self._manifestBuilder.save(self.contentDir, function (err) {
        self.storeUploadable(new Uploadable('.manifest.json', self.contentDir + '/.manifest.json'))
        done(err)
      })
    }

  }, function (thenErr) {
    console.error(thenErr)
  })
}

/*
 * Serial loop through the files so we know when we found them all.
 */
UploadableCollector.prototype._findFilePaths = function (dir, done) {
  var self = this
  var filePaths = []

  fs.readdir(dir, function(err, filelist) {
    if (err) return done(err)

    var i = 0

    ;(function next() {
      var file = filelist[i++]

      if (!file) return done(null, filePaths)

      file = dir + '/' + file

      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          self._findFilePaths(file, function(err, res) {
            filePaths = filePaths.concat(res)
            next()
          })
        } else {
          filePaths.push(file)
          next()
        }
      })
    })()

  })
}


module.exports = UploadableCollector
