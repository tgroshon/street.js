var fs = require('fs')

function ManifestBuilder () {
  this.manifest = {}
}

/*
 * Write Manifest to a file
 */
ManifestBuilder.prototype.save = function (dir, done) {
  if (!done){
    throw new Error('Missing Callback in ManifestBuilder#save')
  }

  fs.writeFile(dir + '/manifest.json', JSON.stringify(this.manifest), function (err) {
    if (err) done(err)

    done()
  })
}

ManifestBuilder.prototype.add = function (uploadable) {

  this.manifest[uploadable.name] = uploadable.hash
}

module.exports = ManifestBuilder
