'use strict'

var debug = require('debug')('street:model:uploadable')
var crypto = require('crypto')
var fs = require('fs')

function Uploadable(name, path) {
  this.name = name
  this.path = path
  this.hash = crypto.createHash('md5').update(fs.readFileSync(this.path)).digest('hex')

  debug('Uploadable: ' + this.name + ' (' + this.hash + ')')
}

Uploadable.prototype.getStream = function () {
  return fs.createReadStream(this.path)
}

module.exports = Uploadable
