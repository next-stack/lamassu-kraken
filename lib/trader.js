'use strict'

var BigNumber = require('bignumber.js')
var Kraken = require('kraken-api')
var config = require('../config')
var coinmath = require('./coinmath')

var kraken = new Kraken(config.key, config.secret)
var BTC_COIN = {
  unitCode: 'BTC',
  displayCode: 'mBTC',
  unitScale: 8,
  displayScale: 5
}

var PAIRS = {
  BTC: {
    USD: 'XXBTZUSD',
    EUR: 'XXBTZEUR'
  },
  ETH: {
    USD: 'XETHZUSD',
    EUR: 'XETHZEUR'
  }
}

exports.purchase = function purchase (cryptoUnits, opts, callback) {
  trade('buy', cryptoUnits, opts, callback)
}

exports.sell = function purchase (cryptoUnits, opts, callback) {
  trade('sell', cryptoUnits, opts, callback)
}

function trade (type, cryptoUnits, opts, callback) {
  var coin = opts.coin || BTC_COIN
  var fx = opts.fiat || 'USD'
  var amount = coinmath.toCoin(new BigNumber(cryptoUnits), coin)

  if (amount.lte('0.01')) {
    var err = new Error('Order size too small')
    err.name = 'orderTooSmall'
    return callback(err)
  }

  var amountStr = amount.toFixed(6)
  var pair = PAIRS[coin.unitCode][fx]

  var orderInfo = {
    pair: pair,
    type: type,
    ordertype: 'market',
    volume: amountStr
  }

  kraken.api('AddOrder', orderInfo, function (error, response) {
    if (error) {
      console.log(error)
      // TODO: handle: EOrder:Order minimum not met (volume too low)
      return callback(error)
    } else {
      return callback()
    }
  })
}
