var Network = require('../Client/Network');
var RenderSystem = require('../Client/RenderSystem');
var InterpolationSystem = require('../Client/InterpolationSystem');
var NetworkSystem = require('../Client/NetworkSystem');
var InputSystem = require('../Client/InputSystem');
var Entity = require('../Shared/Entity');
var Components = require('../Shared/Components');

var EntityManager = require('../Shared/EntityManager');

/**
 * The main game class
 * @class
 */
class Game {
  /**
   * @constructor
   */
  constructor() {
    this.delta = 0;
    this.tick = 0;
    this.runTime = 0;
    this.updateDelta = 0;
    this.previous = Date.now() / 1000;

    this.entityManager = new EntityManager();

    Network.on('createEntity', (data) => {
      var entity = this.entityManager.createEntity(data.id);

      console.log("CreateEntity: " + data.id);

      for (let component in data) {
        if (component === 'id') {
          continue;
        }

        this.entityManager.addComponent(entity, component, data[component]);
      }
      this.entityManager.addComponent(entity, 'render', {
        sprite: new PIXI.Container()
      }).addComponent(entity, 'interpolation', {
        component: 'position',
        from: {x: 10, y: 10},
        to: {x: 10, y: 10},
        delta: 0,
        duration: 0.3 //This has to stay greater than 0.3 to ensure that enough data has been retrieved from the server before it starts interpolating
      });

      var square = new PIXI.Graphics();
      if (entity.input) {
        square.lineStyle(2, 0xFF0000, 1);
      } else {
        square.lineStyle(2, 0x0000FF, 1);
      }
      square.drawRect(0, 0, 100, 100);
      entity.render.sprite.addChild(square);

      RenderSystem.addChild(entity);
    }).on('removeEntity', (data) => {
      for (let i = 0, len = this.entityManager.entities.length; i < len; ++i) {
        if (this.entityManager.entities[i].id === data.id) {
          RenderSystem.removeChild(this.entityManager.entities[i]);
          break;
        }
      }
      this.entityManager.removeEntity(data);
    }).on('disconnect', (data) => {
      for (let i = 0, len = this.entityManager.entities.length; i < len; ++i) {
        RenderSystem.removeChild(this.entityManager.entities[i]);
      }
      this.entityManager.removeAllEntities();
    });

    // Handle the state coming back from the server
    Network.on('state', (data) => {
      for (let i = 0, len = data.length; i < len; ++i) {
        var entity = this.entityManager.getEntity(data[i].id);

        if (!entity) {
          continue;
        }

        entity.inputBuffer.history.push({tick: data[i].tick, time: Date.now(),
                            x: data[i].position.x, y: data[i].position.y});

        var removeLength = 0;
        while (entity.inputBuffer.history[removeLength].time < Date.now() - 1000) {
          removeLength++;
        }
        if (removeLength) {
          entity.inputBuffer.history.splice(0, removeLength);
        }
      }
    });

    var fps = document.createElement('div');
    fps.id = 'fpsCounter';
    fps.style.position = 'absolute';
    fps.style.top = '0px';
    fps.style.left = '0px';
    fps.style.color = 'white';
    document.body.appendChild(fps);

    window.setInterval(() => {
      var ele = document.getElementById('fpsCounter');
      ele.innerHTML = (1/this.delta).toFixed(2) + 'fps<br>' +
        this.delta.toFixed(3) + 's';
    }, 1000);

    requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Function that runs every frame, runs before physics
   * @param {number} delta - The time since the last frame
   */
  preUpdate(delta) {
    InputSystem.update(delta, this.entityManager.entities);
    NetworkSystem.update(delta, this.entityManager.entities);
  }

  /**
   * Function that runs every frame, will only perform actions every tick
   * @param {number} delta - The time since the last frame
   */
  updatePhysics(delta) {
    this.updateDelta += delta;

    while (this.updateDelta >= Network.tickRate) {
      this.updateDelta -= Network.tickRate;

      this.tick++;
    }
  }

  /**
   * Function that runs every frame, runs after physics
   * @param {number} delta - The time since the last frame
   */
  postUpdate(delta) {
  }

  /**
   * Function that runs every frame, runs after physics
   * @param {number} delta - The time since the last frame
   */
  render(delta) {
    RenderSystem.update(delta, this.entityManager.entities);
  }

  /**
   * Main update function calls all other update functions in the correct order
   */
  update() {
    var current = Date.now() / 1000;
    this.delta = current - this.previous;
    this.previous = current;

    this.runTime += this.delta;

    this.preUpdate(this.delta);
    this.updatePhysics(this.delta);
    this.postUpdate(this.delta);
    this.render(this.delta);

    requestAnimationFrame(this.update.bind(this));
  }
}

module.exports = Game;
