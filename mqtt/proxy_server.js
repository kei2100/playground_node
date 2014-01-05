var mqtt = require('mqtt');

var HashRing = require('./hashring').HashRing;

function ProxyServer(options) {
  this.aliveRealServers_ = this.getAliveRealServers_();
  this.vnc_ = (options !== undefined && options.virtualNodeCount) || 100;
  this.hashRing_ = undefined;
  this.rehash();
}

ProxyServer.prototype.rehash = function () {
  this.hashRing_ = new HashRing(this.aliveRealServers_, this.vnc_);
}

ProxyServer.prototype.getAliveRealServers_ = function () {
  // FIXME this is mock
  return ['localhost:1883', 'localhost:1884', 'localhost:1885'];
}

var ps = new ProxyServer({virtualNodeCount: 1});

console.log(
  ps.hashRing_.getState()
)


mqtt.createServer(function (client) {
  var self = this;
  self.clients = {};

  client.on('connect', function (packet) {
    client.id = packet.clientId;
    client.connack({returnCode: 0});

    console.log('connect:' + client.id);
  });

  client.on('publish', function (packet) {

  });

  client.on('subscribe', function (packet) {
    console.log('subscribe:' + client.id);
    var granted = [];

    for (var i = 0; i < packet.subscriptions.length; i++) {
      var topic = packet.subscriptions[i].topic;
      var qos = packet.subscriptions[i].qos;

      granted.push(qos);
    }

    client.suback({granted: granted, messageId: packet.messageId});
  });

  client.on('pingreq', function (packet) {
    client.pingresp();
  });

  client.on('disconnect', function (packet) {
    client.stream.end();
  });

  client.on('close', function (err) {
//    delete self.clients[client.id];
  });

  client.on('error', function (err) {
    client.stream.end();
    console.dir(err);
  });

})
//  .listen(process.argv[2] || 1883)
;





