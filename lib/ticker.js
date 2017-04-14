var axios = require('axios')
var _ = require('lodash/fp')

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

function findCurrency (fxRates, fiatCode) {
  const rates = _.find(_.matchesProperty('code', fiatCode), fxRates)
  if (!rates || !rates.rate) throw new Error(`Unsupported currency: ${fiatCode}`)
  return new BigNumber(rates.rate)
}

exports.ticker = function ticker (account, fiatCode, cryptoCode) {
  if (fiatCode === 'USD' || fiatCode === 'EUR') {
    return getCurrencyRates(fiatCode, cryptoCode)
  }

  return axios.get('https://bitpay.com/api/rates')
  .then(response => {
    var fxRates = response.data
    var usdRate = findCurrency(fxRates, 'USD')
    var fxRate = findCurrency(fxRates, fiatCode).div(usdRate)

    return getCurrencyRates('USD', cryptoCode)
    .then(res => ({
      rates: {
        ask: res.rates.ask.times(fxRate),
        bid: res.rates.bid.times(fxRate)
      }
    }))
  })
}

function getCurrencyRates (fiatCode, cryptoCode) {
  var pair = PAIRS[cryptoCode][fiatCode]

  return axios.get('https://api.kraken.com/0/public/Ticker?pair=' + pair)
  .then(function (response) {
    var rates = response.data.result[pair]
    return {
      rates: {
        ask: new BigNumber(rates.a[0]),
        bid: new BigNumber(rates.b[0])
      }
    }
  })
}
