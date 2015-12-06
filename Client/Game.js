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

var event = new EventEmitter();

class Entity {
  constructor() {
    this.id = Math.random() * 1000;
    event.emit('entityCreated', {id: this.id});
  }

  addComponent(component) {
    this[component.name] = component;

    event.emit('componentAdded', {entity: this, component: component.name});

    return this;
  }

  removeComponent(component) {
    this[component] = undefined;
    delete this[component];

    event.emit('componentAdded', {entity: this, component: component});

    return this;
  }
}

class System {
  update() {
  }
}

class RenderSystem {
  constructor() {
    stage = new PIXI.Container();
    this.renderer = PIXI.autoDetectRenderer(
      window.innerWidth, window.innerHeight, { antialias: false }
    );
    document.body.appendChild(this.renderer.view);

    this.updateDelta = 0;
  }

  update(delta) {
    this.updateDelta += delta;

    if (this.updateDelta >= netRate) {
      this.updateDelta -= netRate;
    }

    var len = entities.length;
    for (let i = 0; i < len; ++i) {
      var entity = entities[i];
      if (entity.render && entity.position && entity.previousPosition) {
        var pos = entity.position;
        var prevPos = entity.previousPosition;
        var renderPos = entity.render.sprite.position;

        entity.interp += delta;

        renderPos.x = prevPos.x + (pos.x - prevPos.x) * (entity.interp / netRate);
        renderPos.y = prevPos.y + (pos.y - prevPos.y) * (entity.interp / netRate);
      }
    }

    this.renderer.render(stage);
  }
}

var socket = io.connect('http://dumtard.com:9191');

class Network {
  constructor() {
    this.tickRate = 0.03125;
  }

  send(event, data) {
    socket.emit(event, data);
  }

  on(event, callback) {
    socket.on(event, callback);
  }
}

var network = new Network();

var Components = require('../Shared/Components');

var PositionComponent = Components.position;
var PreviousPositionComponent = Components.previousPosition;
var VelocityComponent = Components.velocity;
var RenderComponent = Components.render;

var entities = [];
var stage;

var keyboard = {};
//var inputs = [];
//var inputID = 1;

var netRate = 0.1;
var delta = 0;
var previous = Date.now() / 1000;
var updateDelta = 0;
var netUpdate = 0;
var sendDelta = 0;
var runTime = 0;
var tick = 0;

window.addEventListener('keydown', (event) => {
  keyboard[event.keyCode] = true;
});

window.addEventListener('keyup', (event) => {
  keyboard[event.keyCode] = false;
});

class Game {
  constructor() {
    this.loadPIXI('3.0.8').then(() => {
      this.renderSystem = new RenderSystem();

      this.initialize();
    });
  }

  initialize() {
    var entity = new Entity()
    .addComponent(new PositionComponent({x: 10, y: 10}))
    .addComponent(new PreviousPositionComponent({x: 10, y: 10}))
    .addComponent(new VelocityComponent({x: 0, y: 0}))
    .addComponent(new RenderComponent({sprite: new PIXI.Container()}));
    entity.history = [];

    var square = new PIXI.Graphics();
    square.lineStyle(2, 0x0000FF, 1);
    square.drawRect(0, 0, 100, 100);
    entity.render.sprite.addChild(square);

    stage.addChild(entity.render.sprite);

    window.entity = entity;

    entities.push(entity);

    // Handle the state coming back from the server
    network.on('state', (data) => {
      entity.history.push({tick: data.tick, time: Date.now(),
                          x: data.position.x, y: data.position.y});

      var removeLength = 0;
      while (entity.history[removeLength].time < Date.now() - 1000) {
        removeLength++;
      }
      if (removeLength) {
        entity.history.splice(0, removeLength);
      }

      //entity.position.x = data.position.x;
      //entity.position.y = data.position.y;

      //var lastProcessed = data.id;
      //var inputIndex = 0;

      //len = tick - data.id;
      //for (let i = 0; i < len; ++i) {
      //  var input = inputs[inputIndex];

      //  //gravity system
      //  entity.velocity.y += 20;

      //  //input system
      //  entity.velocity.x = 0;

      //  if (input && input.id === lastProcessed + 1) {
      //    inputIndex++;
      //    if (input[65]) {
      //      entity.velocity.x = -200;
      //    } else if (input[68]) {
      //      entity.velocity.x = 200;
      //    }
      //    if (input[32]) {
      //      entity.velocity.y = -300;
      //    }
      //  }
      //  entity.position.x += entity.velocity.x * network.tickRate;
      //  entity.position.y += entity.velocity.y * network.tickRate;

      //  //collision system
      //  if (entity.position.y > 400) {
      //    entity.position.y = 400;
      //    entity.velocity.y =  0;
      //  }
      //  lastProcessed++;
      //}
    });

    requestAnimationFrame(this.update.bind(this));
  }

  update() {
    var current = Date.now() / 1000;
    delta = current - previous;
    previous = current;

    runTime += delta;
    updateDelta += delta;
    netUpdate += delta;
    sendDelta += delta;

    if (netUpdate >= netRate && entity.history.length > 5) {
      netUpdate -= netRate;

      var data = entity.history.shift();

      entity.previousPosition.x = entity.position.x;
      entity.previousPosition.y = entity.position.y;
      entity.previousTick = entity.tick || data.tick;
      entity.interp = netUpdate;

      entity.position.x = data.x;
      entity.position.y = data.y;
      entity.tick = data.tick;

      netRate = (entity.tick - entity.previousTick) * network.tickRate;

    } else if (entity.history.length <= 5) {
      netUpdate = 0;
    }

    while (updateDelta >= network.tickRate) {
      updateDelta -= network.tickRate;

      //gravity system
      //entity.velocity.y += 20;

      //input system
      //entity.velocity.x = 0;
      //var input = {};
      //if (keyboard[65]) {
      //  input[65] = true;
      //  entity.velocity.x = -100;
      //} else if (keyboard[68]) {
      //  input[68] = true;
      //  entity.velocity.x = 100;
      //}
      //if (entity.grounded && keyboard[32]) {
      //  input[32] = true;
      //  entity.velocity.y = -300;
      //  entity.grounded = false;
      //}

      //movement system
      //entity.previousPosition.x = entity.position.x;
      //entity.previousPosition.y = entity.position.y;
      //entity.position.x += entity.velocity.x * network.tickRate;
      //entity.position.y += entity.velocity.y * network.tickRate;

      //collision system
      //if (entity.position.y > 200) {
      //  entity.position.y = 200;
      //  entity.velocity.y =  0;
      //  entity.grounded = true;
      //}

      //if (Object.keys(input).length > 0) {
      //  input.id = tick;
      //  inputs.push(input);
      //}

      tick++;
    }

    //if (sendDelta >= 0.1 && inputs.length > 0) {
    //  sendDelta -= 0.1;

    //  network.send('keys', inputs);
    //}
    //console.log('-----' + delta + '-----');

    this.renderSystem.update(delta);
    requestAnimationFrame(this.update.bind(this));
  }

  loadPIXI(version, callback) {
    return new Promise((resolve, reject) => {
      var pixiScript = document.createElement('script');
      pixiScript.async = true;
      pixiScript.src = '//cdnjs.cloudflare.com/ajax/libs/pixi.js/' +
        version + '/pixi.js';

        pixiScript.addEventListener('load', (event) => {
          resolve();
        });
        document.head.appendChild(pixiScript);
    });
  }
}

module.exports = Game;
