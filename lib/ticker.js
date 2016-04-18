require('es6-promise').polyfill()
var axios = require('axios')
var _ = require('lodash')

var BigNumber = require('bignumber.js')

exports.NAME = 'Kraken'
exports.SUPPORTED_MODULES = ['ticker']

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

function findCurrency (fxRates, currency) {
  return new BigNumber(_.find(fxRates, function (r) { return r.code === currency }).rate)
}

exports.ticker = function ticker (currencies, cryptoCoin, callback) {
  // Note: we're being supplied an array, but it's really just one currency
  var currency = currencies[0]

  if (!callback) {
    callback = cryptoCoin
    cryptoCoin = 'BTC'
  }

  if (currency === 'USD' || currency === 'EUR') {
    return getCurrencyRates(currency, cryptoCoin)
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

    return getCurrencyRates('USD', cryptoCoin)
    .then(function (res) {
      var rec = {}
      rec[currency] = {
        currency: currency,
        rates: {
          ask: res.USD.rates.ask.times(fxRate),
          bid: res.USD.rates.bid.times(fxRate)
        }
      }
      callback(null, rec)
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
    var rec = {}
    rec[currency] = {
      currency: currency,
      rates: {
        ask: new BigNumber(rates.a[0]),
        bid: new BigNumber(rates.b[0])
      }
    }
    return rec
  })
}
