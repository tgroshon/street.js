'use strict'

var fs = require('fs')
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


  debug('writing manifest to file content directory')
  fs.writeFile(dir + '/.manifest.json', JSON.stringify(this.manifest), function (err) {
    if (err) return done(err)

    debug('manifest written')
    done()
  })
}

ManifestBuilder.prototype.add = function (uploadable) {
  this.manifest[uploadable.name] = uploadable.hash
}

module.exports = ManifestBuilder
