'use strict'

var debug = require('debug')('street:setup')
require('dotenv').load()

debug('environment loaded')
module.exports = require('./lib/street')
