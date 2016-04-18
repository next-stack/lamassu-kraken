'use strict'

var Kraken = require('kraken-api')
var coinmath = require('./coinmath')

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

var kraken

exports.config = function config (_config) {
  console.log('DEBUG200')
  console.log(_config.key)
  console.log(_config.secret)

  kraken = new Kraken(_config.key, _config.secret)
}

exports.purchase = function purchase (cryptoAtoms, opts, callback) {
  trade('buy', cryptoAtoms, opts, callback)
}

exports.sell = function purchase (cryptoAtoms, opts, callback) {
  trade('sell', cryptoAtoms, opts, callback)
}

function trade (type, cryptoAtoms, opts, callback) {
  var cryptoCode = opts.cryptoCode || 'BTC'
  var fx = opts.fiat || 'USD'
  var amount = coinmath.toUnit(cryptoAtoms, cryptoCode)

  if (amount.lte('0.01')) {
    var err = new Error('Order size too small')
    err.name = 'orderTooSmall'
    return callback(err)
  }

  var amountStr = amount.toFixed(6)
  var pair = PAIRS[cryptoCode][fx]

  var orderInfo = {
    pair: pair,
    type: type,
    ordertype: 'market',
    volume: amountStr
  }

  console.log('DEBUG201: %s', amount)
  console.log('%j', orderInfo)

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
