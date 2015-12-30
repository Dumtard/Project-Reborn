var Log = require('../Server/Log');
var Server = require('../Server/Server');

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

var server = new Server();
