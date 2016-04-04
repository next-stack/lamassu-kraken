'use strict'

var _ = require('lodash')

exports.NAME = 'Kraken'
exports.SUPPORTED_MODULES = ['ticker', 'trader']

exports.config = function config (localConfig) {
  if (localConfig) _.merge(exports, localConfig)
}
