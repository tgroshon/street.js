'use strict'

var debug = require('debug')('street:setup')

exports = module.exports = require('./lib/street')
exports.ManifestBuilder = require('./lib/manifest-builder')
exports.Uploadable = require('./lib/uploadable')
exports.UploadableCollector = require('./lib/uploadable-collector')
exports.s3 = require('./lib/s3')
