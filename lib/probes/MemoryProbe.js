const EventEmitter = require('events'),
      helpers = require('../helpers'),
      debug = require('debug')('bp:probes:MemoryProbe')

class MemoryProbe extends EventEmitter {
  constructor() {
    super()
    this.id = 'MemoryProbe'
  }

  start(browser) {
    const code = function() {
      if (!window.performance || !window.performance.memory) return
      const requestAnimationFrame = (function() {
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
      })().bind(window)

      window.__MemoryRecorder = {
        memorySnapshots: [],
        record: function() {
          __MemoryRecorder.memorySnapshots.push({
            'usedJSHeapSize': performance.memory.usedJSHeapSize,
            'jsHeapSizeLimit': performance.memory.jsHeapSizeLimit,
            'totalJSHeapSize': performance.memory.totalJSHeapSize,
            'rate': performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
          })
          requestAnimationFrame(__MemoryRecorder.record)
        },
        get: function() {
          return __MemoryRecorder.memorySnapshots
        }
      }
      requestAnimationFrame(window.__MemoryRecorder.record)
    }

    return browser.execute(helpers.fnCall(code))
  }

  teardown(browser) {
    return browser.eval('window.__MemoryRecorder.get()').then(res => {
      // debug('res', res)
      if(Array.isArray(res) && res.length > 0) {
        this.emit('data', res)
      }
    }, err => this.emit('error', err))
  }
}

module.exports = MemoryProbe