const Q = require('q'),
  helpers = require('./../helpers'),
  statistics = require('./util/statistics'),
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
      result['usedJSHeapSize_max'] = Math.max(...this.__data[0]) / (1024 * 1024)
      result['usedJSHeapSize_avg'] = statistics.ArithmeticMean(this.__data[0]) / (1024 * 1024)
    }
    return result
  }

}

module.exports = MemoryMetrics