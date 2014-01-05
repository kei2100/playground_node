var mqtt = require('mqtt');

var self = this;

mqtt.createServer(function (client) {
  client.on('connect', function (packet) {
    client.id = packet.clientId;
    client.connack({returnCode: 0});
  });

  client.on('publish', function (packet) {

  });

  client.on('subscribe', function (packet) {
  });

  client.on('pingreq', function (packet) {
    client.pingresp();
  });

  client.on('disconnect', function (packet) {
    client.stream.end();
  });

  client.on('close', function (err) {
  });

  client.on('error', function (err) {
    client.stream.end();
    console.dir(err);
  });
}).listen(process.argv[2] || 1883);