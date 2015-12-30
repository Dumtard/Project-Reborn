var fs = require('fs');

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

module.exports = Log;
