'use strict'

var fs = require('fs')
var zlib = require('zlib')
var debug = require('debug')('street:builder')
function ManifestBuilder () {
  this.manifest = {}
}

/*
 * Write Manifest to a file
 */
ManifestBuilder.prototype.save = function (dir, done) {
  if (!done)
    throw new Error('Missing Callback in ManifestBuilder#save')


  debug('compressing manifest')
  zlib.gzip(JSON.stringify(this.manifest), function(deflateErr, buffer) {
    if (deflateErr) return done(deflateErr)

    debug('manifest compressed')
    debug('writing manifest to disk')
    fs.writeFile(dir + '/.manifest.json', buffer, function (fileWriteErr) {
      if (fileWriteErr) return done(fileWriteErr)

      debug('manifest written')
      done()
    })
  })
}

ManifestBuilder.prototype.add = function (uploadable) {
  this.manifest[uploadable.name] = uploadable.hash
}

module.exports = ManifestBuilder
