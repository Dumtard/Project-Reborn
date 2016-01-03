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
    for (let i = 0, len = entities.length; i < len; ++i) {
      var entity = entities[i];

      if (!entity.interpolation || !entity.inputBuffer) {
        continue;
      }

      entity.interpolation.delta += delta;

      // This section of code should only be done if it needs to change what it
      // is interpolating between.
      // First time it's got at least 3 entries
      // Every other time when the delta is greater than the time
      if (entity.interpolation.delta >= entity.interpolation.duration) {
        entity.interpolation.delta -= entity.interpolation.duration;

        var from, to;
        for (let j = 0, len2 = entity.inputBuffer.history.length; j < len2; ++j) {
          if (entity.inputBuffer.history[j].time + 300 > Date.now() && entity.inputBuffer.previousTick !== entity.inputBuffer.history[j].tick) {
            from = entity.inputBuffer.history[j];
            to = entity.inputBuffer.history[j+1];
            entity.inputBuffer.previousTick = from.tick;

            break;
          }
        }

        if (!from || !to) {
          continue;
        }

        // Difference in time between previous tick and current tick for
        // interpolation.
        entity.interpolation.duration = (to.tick - from.tick) * Network.tickRate;

        // Update the from and to values
        entity.interpolation.from.x = from.x;
        entity.interpolation.from.y = from.y;

        entity.interpolation.to.x = to.x;
        entity.interpolation.to.y = to.y;
      }

      // Linear interplotion between the 2 data points.
      entity.position.x = entity.interpolation.from.x + (entity.interpolation.to.x - entity.interpolation.from.x) * (entity.interpolation.delta / entity.interpolation.duration);
      entity.position.y = entity.interpolation.from.y + (entity.interpolation.to.y - entity.interpolation.from.y) * (entity.interpolation.delta / entity.interpolation.duration);
    }
  }
}

module.exports = InterpolationSystem;
