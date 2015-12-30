var System = require ('../Shared/System');
var Network = require('../Client/Network');

/**
 * Interpolation System
 * @class
 */
class InterpolationSystem extends System {
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
    var len = entities.length;
    for (let i = 0; i < len; ++i) {
      var entity = entities[i];

      entity.interpolation.delta += delta;

      // This section of code should only be done if it needs to change what it
      // is interpolating between.
      // First time it's got at least 3 entries
      // Every other time when the delta is greater than the time
      if (entity.interpolation.delta >= entity.interpolation.duration &&
          entity.inputBuffer.history.length > 3
      ) {
        entity.interpolation.delta -= entity.interpolation.duration;

        var data = entity.inputBuffer.history.shift();

        // This is for the first time, set the tick to the data.tick, gets the
        // tick from the server
        if (!entity.inputBuffer.tick) {
          entity.inputBuffer.tick = data.tick;
        }

        // Difference in time between previous tick and current tick for
        // interpolation.
        entity.interpolation.duration = (data.tick - entity.inputBuffer.tick) * Network.tickRate;
        entity.inputBuffer.tick = data.tick;


        // Update the from and to values
        entity.interpolation.from.x = entity.interpolation.to.x;
        entity.interpolation.from.y = entity.interpolation.to.y;

        entity.interpolation.to.x = data.x;
        entity.interpolation.to.y = data.y;

      } else if (entity.inputBuffer.history.length <= 3) {
        entity.interpolation.delta = 0;
      }
    }
  }
}

module.exports = InterpolationSystem;
