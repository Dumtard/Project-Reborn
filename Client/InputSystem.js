var System = require('../Shared/System');
var Network = require('../Client/Network');

var Keyboard = {};
var Key = {
  A: 65,
  S: 83,
  D: 68,
  W: 87,
  SPACE: 32
};

window.addEventListener('keydown', function(event) {
  Keyboard[event.keyCode] = true;
});

window.addEventListener('keyup', function(event) {
  Keyboard[event.keyCode] = false;
});

/**
 * Interpolation System
 * @class
 */
class InputSystem extends System {
  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * Does the work
   * @param {number} delta - Time since last frame
   */
  update(delta, entities) {
    for (let i = 0, len = entities.length; i < len; ++i) {
      var entity = entities[i];

      if (!entity.input) {
        continue;
      }

      Network.send('keys', {id: entity.id, keys: Keyboard});
    }
  }
}

module.exports = new InputSystem();
