(function() {
  'use strict';

  var io = require('socket.io')(9191);
  var Log = require('../Server/Log');

  var EntityManager = require('../Shared/EntityManager');

  var entities = [];

  var delta = 0;
  var previous = Date.now() / 1000;
  var runTime = 0;
  var updateDelta = 0;
  var sendDelta = 0;
  var tick = 0;

  var entityManager = new EntityManager();

  io.on('connection', (socket) => {
    for (let i = 0, len = 1; i < len; ++i) {
      let entity = entityManager.createEntity();

      entityManager.addComponent(entity, 'position', {
        x: 20 * i + 10,
        y: 10
      }).addComponent(entity, 'velocity', {
        x: 100,
        y: 0
      });

      socket.emit('createEntity', entity);

      entity.socket = socket;
    }

    socket.on('keys', (data) => {
    })
    .on('disconnect', (data) => {
       entityManager.removeAllEntities();
    });
  });

  class Server {
    constructor() {
      Log("Started");

      setInterval(this.update, 1000/30);
    }

    update() {
      var current = Date.now() / 1000;
      delta = current - previous;
      previous = current;

      runTime += delta;
      updateDelta += delta;
      sendDelta += delta;

      while (updateDelta >= 0.03125) {
        updateDelta -= 0.03125;

        for (var i = 0; i < entityManager.entities.length; i++) {
          var entity = entityManager.entities[i];

          //gravity system
          entity.velocity.y += 20;

          if (Math.random() < 0.03 && entity.position.y === 200) {
            entity.velocity.y = -300;
          }

          //movement system
          entity.position.x += entity.velocity.x * 0.03125;
          entity.position.y += entity.velocity.y * 0.03125;

          //if (entity.id === 1) {
          //  Log(entity.position.y);
          //}

          //collision system
          if (entity.position.y > 200) {
            entity.position.y = 200;
            entity.velocity.y =  0;
          }
          if (entity.position.x > 800) {
            entity.position.x = 800;
            entity.velocity.x *= -1;
          } else if (entity.position.x < 0) {
            entity.position.x = 0;
            entity.velocity.x *= -1;
          }

          //entity.velocity.x = 0;
        }

        tick++;
      }

      if (sendDelta >= 1/10) {
        sendDelta -= 1/10;

        let state = [];

        // Build the state to send to the clients
        for (var i = 0; i < entityManager.entities.length; i++) {
          var entity = entityManager.entities[i];

          state.push({
            tick: tick,
            id: entity.id,
            position: entity.position,
          });
        }

        //Log(JSON.stringify(state).length);

        // Send the state to every client
        // This should not be based on entity list, needs to be based on
        // a list of connected clients
        for (var i = 0; i < entityManager.entities.length; i++) {
          var entity = entityManager.entities[i];

          entity.socket.emit('state', state);
          break;
        }
      }
    }
  }

  module.exports = Server;
})();
