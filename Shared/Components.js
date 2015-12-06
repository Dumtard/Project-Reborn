class Component {
    constructor(name, keys, data) {
        this.name = name;

        var len = keys.length;
        for (let i = 0; i < len; ++i) {
            this[keys[i]] = undefined;
        }

        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}

class PositionComponent extends Component {
    constructor(data) {
        super('position', ['x', 'y'], data);
    }
}

class PreviousPositionComponent extends Component {
    constructor(data) {
        super('previousPosition', ['x', 'y'], data);
    }
}

class VelocityComponent extends Component {
    constructor(data) {
        super('velocity', ['x', 'y'], data);
    }
}

class RenderComponent extends Component {
    constructor(data) {
        super('render', ['sprite'], data);
    }
}

module.exports = {
    position: PositionComponent,
    previousPosition: PreviousPositionComponent,
    velocity: VelocityComponent,
    render: RenderComponent
};
