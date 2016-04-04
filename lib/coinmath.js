'use strict'

var BigNumber = require('bignumber.js')

var TEN = new BigNumber(10)

exports.toUnit = function toCoin (cryptoUnits, coin) {
  var scale = TEN.pow(coin.unitScale)
  return cryptoUnits.div(scale)
}
