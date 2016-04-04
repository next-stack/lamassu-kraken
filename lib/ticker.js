require('es6-promise').polyfill()
var axios = require('axios')
var _ = require('lodash')

var BigNumber = require('bignumber.js')

exports.NAME = 'Kraken'
exports.SUPPORTED_MODULES = ['ticker']

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

exports.config = function config () {}

function findCurrency (fxRates, currency) {
  return new BigNumber(_.find(fxRates, function (r) { return r.code === currency }).rate)
}

exports.ticker = function ticker (currencies, cryptoCoin, callback) {
  // Note: we're being supplied an array, but it's really just one currency
  var currency = currencies[0]

  if (!callback) {
    callback = cryptoCoin
    cryptoCoin = BTC_COIN
  }

  if (currency === 'USD' || currency === 'EUR') {
    return getCurrencyRates(currency, cryptoCoin.unitCode)
    .then(function (res) {
      callback(null, res)
    })
    .catch(function (err) {
      callback(err)
    })
  }

  return axios.get('https://bitpay.com/api/rates')
  .then(function (response) {
    var fxRates = response.data
    var usdRate = findCurrency(fxRates, 'USD')
    var fxRate = findCurrency(fxRates, currency).div(usdRate)

    return getCurrencyRates('USD', cryptoCoin.unitCode)
    .then(function (res) {
      callback(null, {
        ask: res.ask.times(fxRate),
        bid: res.bid.times(fxRate)
      })
    })
    .catch(function (err) {
      callback(err)
    })
  })
}

function getCurrencyRates (currency, cryptoCode) {
  var pair = PAIRS[cryptoCode][currency]

  return axios.get('https://api.kraken.com/0/public/Ticker?pair=' + pair)
  .then(function (response) {
    var rates = response.data.result[pair]
    return {
      ask: new BigNumber(rates.a[0]),
      bid: new BigNumber(rates.b[0])
    }
  })
}
