var io = require('socket.io')(9191);
var fs = require('fs');

var entity;
var socket;

var processed = 0;

var inputs = [];

function signalHandler() {
  process.exit(1);
}

function exitHandler(code) {
  Log('Stopped (' + code + ')', true);
}

process.on('exit', exitHandler);
process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);
process.on('SIGHUP', signalHandler);
process.on('uncaughtException', exitHandler);


function Log(message, sync) {
  function pad(number, width) {
    var padding = "0".repeat(width);
    number = (padding + number).slice(-width);
    return number;
  }

  var dateObj = new Date();
  var day = dateObj.getDate();
  var month = dateObj.getMonth() + 1;
  var year = dateObj.getFullYear();
  var hr = dateObj.getHours() + 1;
  var min = dateObj.getMinutes();
  var sec = dateObj.getSeconds();
  var ms = dateObj.getMilliseconds();
  var date = [pad(day, 2), pad(month, 2), pad(year, 2)].join('/');
  var time = [[pad(hr, 2), pad(min, 2), pad(sec, 2)].join(':'),
              pad(ms, 3)].join('.');
  var msg = message;

  if (typeof message !== 'string') {
    msg = JSON.stringify(message);
  }

  if (sync) {
    fs.appendFileSync('/home/charles/Project-Reborn/Server/server.log',
                  date + " " + time + "\t" + msg + '\n');
  } else {
    fs.appendFile('/home/charles/Project-Reborn/Server/server.log',
                  date + " " + time + "\t" + msg + '\n', (err) => {
      if (err) {
        return console.log(err);
      }
    });
  }
}

io.on('connection', (sock) => {
  'use strict';

  runTime = 0;

  socket = sock;
  entity = {
    position: {x: 10, y: 10},
    velocity: {x: 100, y: 0}
  };

  socket.on('keys', (data) => {
  //  var len = data.length;
  //  for (let i = 0; i < len; ++i) {
  //    if (inputs.length === 0 && data[i].id > processed) {
  //      inputs.push(data[i]);
  //    } else if (inputs.length > 0 && data[i].id > inputs[inputs.length-1].id) {
  //      inputs.push(data[i]);
  //    }
  //  }
  })
  .on('disconnect', (data) => {
    processed = 0;
    entity = undefined;
  });
});

var delta = 0;
var previous = Date.now() / 1000;
var runTime = 0;
var updateDelta = 0;
var sendDelta = 0;
var tick = 0;

var localProcessed = 0;

Log("Started");

setInterval(() => {
  'use strict';

  var current = Date.now() / 1000;
  delta = current - previous;
  previous = current;

  runTime += delta;
  updateDelta += delta;
  sendDelta += delta;

  if (!entity) {
    return;
  }

  while (updateDelta >= 0.03125) {
    updateDelta -= 0.03125;

    var input = inputs.shift();
    var keyboard = {};

    if (input) {
      for (let key in input) {
        keyboard[key] = true;
      }

      processed = input.id;
      localProcessed = processed;
    } else {
      localProcessed++;
    }

    //gravity system
    entity.velocity.y += 20;

    //input system
    //entity.velocity.x = 0;
    //if (keyboard[65]) {
    //  entity.velocity.x = -200;
    //} else if (keyboard[68]) {
    //  entity.velocity.x = 200;
    //}
    //if (keyboard[32]) {
    //  entity.velocity.y = -300;
    //}

    if (Math.random() < 0.05 && entity.position.y === 200) {
      entity.velocity.y = -300;
    }

    //movement system
    entity.position.x += entity.velocity.x * 0.03125;
    entity.position.y += entity.velocity.y * 0.03125;

    //Log(entity.position);

    //collision system
    if (entity.position.y > 200) {
      entity.position.y = 200;
      entity.velocity.y =  0;
    }
    if (entity.position.x > 400) {
      entity.position.x = 400;
      entity.velocity.x *= -1;
    } else if (entity.position.x < 0) {
      entity.position.x = 0;
      entity.velocity.x *= -1;
    }

    //entity.velocity.x = 0;

    //console.log(entity.position);
    tick++;
  }
  if (sendDelta >= 1/10) {
    sendDelta -= 1/10;
    socket.emit('state', {
      tick: tick,
      position: entity.position,
      velocity: entity.velocity
    });
  }
}, 1000/128);
