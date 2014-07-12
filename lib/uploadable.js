'use strict'

var crypto = require('crypto')
var fs = require('fs')

module.exports = function Uploadable(name, path) {
  this.name = name
  this.path = path
  this.stream = fs.createReadStream(path)
  this.hash = crypto.createHash('md5').update(fs.readFileSync(path)).digest('hex')
}
