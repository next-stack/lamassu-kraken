'use strict'

var trader = require('./lib/trader')

exports.NAME = 'Kraken'
exports.SUPPORTED_MODULES = ['ticker', 'trader']

exports.config = function config (localConfig) {
  console.log(localConfig)
  if (localConfig) trader.config(localConfig)
}
