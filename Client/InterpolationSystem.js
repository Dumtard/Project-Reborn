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

      // Update the current position
      entity.position.x = entity.interpolation.from.x + (entity.interpolation.to.x - entity.interpolation.from.x) * (entity.interpolation.delta / entity.interpolation.duration);
      entity.position.y = entity.interpolation.from.y + (entity.interpolation.to.y - entity.interpolation.from.y) * (entity.interpolation.delta / entity.interpolation.duration);

    }
  }
  //update(delta, entities) {
  //  var len = entities.length;
  //  for (let i = 0; i < len; ++i) {
  //    var entity = entities[i];

  //    entity.inputBuffer.delta += delta;

  //    // This section of code should only be done if it needs to change what it
  //    // is interpolating between.
  //    // First time it's got at least 3 entries
  //    // Every other time when the delta is greater than the time
  //    if (entity.inputBuffer.delta >= entity.inputBuffer.time &&
  //        entity.inputBuffer.history.length > 3
  //    ) {
  //      entity.inputBuffer.delta -= entity.inputBuffer.time;

  //      var data = entity.inputBuffer.history.shift();

  //      // Update the previous position information
  //      entity.previousPosition.x = entity.position.x;
  //      entity.previousPosition.y = entity.position.y;

  //      // Set the interpolation time to the delta of the inputBuffer
  //      entity.interp = entity.inputBuffer.delta;
  //      //TODO: Refactor this into 1 variable?? This is being increased in 2
  //      //places now as interp and inputBuffer.delta

  //      // Update the current position
  //      entity.position.x = data.x;
  //      entity.position.y = data.y;

  //      // This is for the first time, set the tick to the data.tick, gets the
  //      // tick from the server
  //      if (!entity.inputBuffer.tick) {
  //        entity.inputBuffer.tick = data.tick;
  //      }

  //      // Difference in time between previous tick and current tick for
  //      // interpolation.
  //      entity.inputBuffer.time = (data.tick - entity.inputBuffer.tick) * Network.tickRate;
  //      entity.inputBuffer.tick = data.tick;

  //    } else if (entity.inputBuffer.history.length <= 3) {
  //      entity.inputBuffer.delta = 0;
  //    }

  //    entity.interp += delta;
  //  }
  //}
}

module.exports = InterpolationSystem;
