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
    }

    update() {
        var len = entities.length;
        for (let i = 0; i < len; ++i) {
            if (entities[i].render && entities[i].position) {
                entities[i].render.sprite.position.x = entities[i].position.x;
                entities[i].render.sprite.position.y = entities[i].position.y;
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

var PositionComponent = require('../Shared/Components').position;
var VelocityComponent = require('../Shared/Components').velocity;
var RenderComponent = require('../Shared/Components').render;

var entities = [];
var stage;

var keyboard = {};
var inputs = [];
var inputID = 1;

var delta = 0;
var previous = Date.now() / 1000;
var updateDelta = 0;
var sendDelta = 0;
var runTime = 0;

window.addEventListener('keydown', (event) => {
    keyboard[event.keyCode] = true;
});

window.addEventListener('keyup', (event) => {
    keyboard[event.keyCode] = false;
});

class Game {
    constructor() {
        this.loadPIXI('3.0.7').then(() => {
            this.renderSystem = new RenderSystem();

            this.initialize();
        });
    }

    initialize() {
        var entity = new Entity()
            .addComponent(new PositionComponent({x: 10, y: 10}))
            .addComponent(new VelocityComponent({x: 0, y: 0}))
            .addComponent(new RenderComponent({sprite: new PIXI.Container()}));

        var square = new PIXI.Graphics();
        square.lineStyle(2, 0x0000FF, 1);
        square.drawRect(0, 0, 100, 100);
        entity.render.sprite.addChild(square);

        stage.addChild(entity.render.sprite);

        window.entity = entity;

        entities.push(entity);

        network.on('state', (data) => {
            var len = inputs.length;
            for (let i = 0; i < len;) {
                if (inputs[i].id <= data.id) {
                    inputs.splice(i, 1);
                }
                i++;
                len--;
            }
            entity.position.x = data.position.x;
            entity.position.y = data.position.y;
        });

        requestAnimationFrame(this.update.bind(this));
    }

    update() {
        var current = Date.now() / 1000;
        delta = current - previous;
        previous = current;

        runTime += delta;
        updateDelta += delta;
        sendDelta += delta;

        if (updateDelta >= 0.03125) {
            updateDelta -= 0.03125;

            var input = {};
            if (keyboard[65]) {
                input[65] = true;
            } else if (keyboard[68]) {
                input[68] = true;
            }
            if (keyboard[32]) {
                input[32] = true;
            }

            if (Object.keys(input).length > 0) {
                input.id = inputID++;
                inputs.push(input);
            }
        }

        if (sendDelta >= 0.1 && inputs.length > 0) {
            sendDelta -= 0.1;
            network.send('keys', inputs);
        }

        this.renderSystem.update();
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
