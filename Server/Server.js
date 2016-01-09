(function() {
  'use strict';

  var io = require('socket.io')(9191);
  var Log = require('../Server/Log');

  var EntityManager = require('../Shared/EntityManager');

  var delta = 0;
  var previous = Date.now() / 1000;
  var runTime = 0;
  var updateDelta = 0;
  var sendDelta = 0;
  var tick = 0;

  var entityManager = new EntityManager();

  var sockets = [];

  io.on('connection', (socket) => {
    let entity = entityManager.createEntity();

    entityManager.addComponent(entity, 'position', {
      x: 10,
      y: 10
    }).addComponent(entity, 'velocity', {
      x: 100,
      y: 0
    }).addComponent(entity, 'inputBuffer', {
      history: [],
      tick: tick
    });

    for (let i = 0, len = sockets.length; i < len; ++i) {
      sockets[i].emit('createEntity', entity);
    }

    entityManager.addComponent(entity, 'input', {
      history: []
    });

    socket.emit('createEntity', entity);

    entityManager.removeComponent(entity, 'input');

    sockets.push(socket);

    for (let i = 0, len = entityManager.entities.length; i < len; ++i) {
      if (entity.id !== entityManager.entities[i].id) {
        socket.emit('createEntity', entityManager.entities[i]);
      }
    }

    socket.on('keys', (data) => {
      var entity = entityManager.getEntity(data.id);

      entity.velocity.x = 0;
      if (data.keys[65] && data.keys[68]) {
      } else if (data.keys[65]) {
        entity.velocity.x = -100;
      } else if (data.keys[68]) {
        entity.velocity.x = 100;
      }
      if (data.keys[32]) {
        entity.velocity.y = -300;
      }
    })
    .on('disconnect', (data) => {
      entityManager.removeEntity(entity);

      let index = 0;
      for (let i = 0, len = sockets.length; i < len; ++i) {
        if (socket.id === sockets[i].id) {
          index = i;
        } else {
          sockets[i].emit('removeEntity', entity);
        }
      }
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
            //entity.velocity.y = -300;
          }

          //movement system
          entity.position.x += entity.velocity.x * 0.03125;
          entity.position.y += entity.velocity.y * 0.03125;

          //if (entity.id === 1) {
          //  Log(entity.position);
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
        for (var i = 0, len = sockets.length; i < len; ++i) {
          sockets[i].emit('state', state);
        }
      }
    }
  }

  module.exports = Server;
})();
