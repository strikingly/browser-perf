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
            window.setTimeout(callback, 1000 / 60)
          }
      })().bind(window)

      window.__MemoryRecorder = {
        memorySnapshots: [],
        flush: true,
        record: function() {
          if (__MemoryRecorder.flush) {
            __MemoryRecorder.memorySnapshots = []
            __MemoryRecorder.flush = false
          }
          __MemoryRecorder.memorySnapshots.push(performance.memory.usedJSHeapSize)
          requestAnimationFrame(__MemoryRecorder.record)
        },
        get: function() {
          __MemoryRecorder.flush = true
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