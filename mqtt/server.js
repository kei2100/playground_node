var mqtt = require('mqtt');

mqtt.createServer(function (client) {
  var self = this;
  self.topicsSubscribersMap = new TopicsSubscribersMap;

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

      self.topicsSubscribersMap.addSubscriber(topic, client);
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

}).listen(process.argv[2] || 1883);

function TopicsSubscribersMap() {
  this.map_ = [];
}
TopicsSubscribersMap.prototype.addSubscriber = function(topic, client) {
  if (!this.map_[topic]) this.map_[topic] = [];
  this.map_[topic].push([client.id, client]);

  console.log('====' + client.id);

  for (var t in this.map_) {
    var s = this.map_[t];

    for (var id in s) {
      console.log(t + ':' + s[t]);
    }
  }
  console.log('===============');
};





