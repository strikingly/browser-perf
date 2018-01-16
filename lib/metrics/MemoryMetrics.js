const Q = require('q'),
  helpers = require('./../helpers'),
  BaseMetrics = require('./BaseMetrics'),
  debug = require('debug')('bp:metrics:MemoryMetrics')

class MemoryMetrics extends BaseMetrics {
  constructor() {
    super(arguments)
    this.id = 'MemoryMetrics'
    this.probes = ['MemoryProbe']
  }

  setup(cfg) {
    cfg.browsers = cfg.browsers.map(browser => {
      helpers.extend(browser, {
        chromeOptions: {
          args: ['--enable-precise-memory-info']
        }
      })
      return browser
    })
    return Q(cfg)
  }

  getResults() {
    let result = {}
    if (this.__data.length > 0) {
      result['memoryUsedRate_max'] = this.getMaxRate()
      result['memoryUsedRate_min'] = this.getMinRate()
    }
    return result
  }

  getMaxRate() {
    let rawData = this.__data[0],
      maxRateData = rawData[0]
    for (let memoryInfo of rawData) {
      if (memoryInfo.rate > maxRateData.rate) {
        maxRateData = memoryInfo
      }
    }
    debug('maxRateData', maxRateData)
    return maxRateData.rate
  }

  getMinRate() {
    let rawData = this.__data[0],
      minRateData = rawData[0]
    for (let memoryInfo of rawData) {
      if (memoryInfo.rate < minRateData.rate) {
        minRateData = memoryInfo
      }
    }
    debug('minRateData', minRateData)
    return minRateData.rate
  }

}

module.exports = MemoryMetrics