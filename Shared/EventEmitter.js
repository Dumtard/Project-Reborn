(function() {
  'use strict';

  class EventEmitter {
    constructor() {
      this.listeners = [];
    }
    emit(event, data) {
      if (typeof this.listeners[event] === 'undefined') {
        return;
      }

      var len = this.listeners[event].length;
      for (let i = 0; i < len; ++i) {
        if (typeof this.listeners[event][i] === 'function') {
          this.listeners[event][i](data);
        }
      }
    }

    on(event, callback) {
      if (typeof this.listeners[event] === 'undefined') {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }
  }

  module.exports = new EventEmitter();
})();
