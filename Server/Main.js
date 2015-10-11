var io = require('socket.io')(9191);

var entity;
var socket;

var processed = 0;

var inputs = [];

io.on('connection', (sock) => {
    'use strict';

    runTime = 0;

    socket = sock;
    entity = {
        position: {x: 10, y: 10},
        velocity: {x: 0, y: 0}
    };
    socket.on('keys', (data) => {
        var len = data.length;
        for (let i = 0; i < len; ++i) {
            if (inputs.length === 0 && data[i].id > processed) {
                inputs.push(data[i]);
            } else if (inputs.length > 0 && data[i].id > inputs[inputs.length-1].id) {
                inputs.push(data[i]);
            }
        }
    });
});

var delta = 0;
var previous = Date.now() / 1000;
var runTime = 0;
var updateDelta = 0;
var sendDelta = 0;

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
        }

        //gravity system
        entity.velocity.y += 20;

        //input system
        entity.velocity.x = 0;
        if (keyboard[65]) {
            entity.velocity.x = -100;
        } else if (keyboard[68]) {
            entity.velocity.x = 100;
        }
        if (keyboard[32]) {
            entity.velocity.y = -300;
        }

        //movement system
        entity.position.x += entity.velocity.x * 0.03125;
        entity.position.y += entity.velocity.y * 0.03125;

        //collision system
        if (entity.position.y > 100) {
            entity.position.y = 100;
            entity.velocity.y =  0;
        }

        entity.velocity.x = 0;

        //console.log(entity.position);
    }
    if (sendDelta >= 0.1) {
        sendDelta -= 0.1;
        socket.emit('state', {id: processed, position: entity.position});
    }
}, 1000/30);
