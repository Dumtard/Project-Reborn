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

module.exports = new Network();
