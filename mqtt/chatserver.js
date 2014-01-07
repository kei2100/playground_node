var mqtt = require('mqtt');

function ChatServer () {
  this.topicManager_ = new TopicManager();
  this.clients = {};
  this.mqttServer_ = undefined;
}

module.exports.ChatServer = ChatServer;

ChatServer.prototype.start = function (opt_config) {
  var self = this;
  var port = (opt_config && opt_config.port) || 1883;

  self.mqttServer_ = mqtt.createServer(function (client) {
    client.on('connect', function (packet) {
      self.onConnect.call(self, client, packet);
    });

    client.on('publish', function (packet) {
      self.onPublish.call(self, client, packet);
    });

    client.on('subscribe', function (packet) {
      self.onSubscribe.call(self, client, packet);
    });

    client.on('pingreq', function (packet) {
      self.onPingreq.call(self, client, packet);
    });

    client.on('disconnect', function (packet) {
      self.onDisconnect.call(self, client, packet);
    });

    client.on('close', function (err) {
      self.onClose.call(self, client, err);
    });

    client.on('error', function (err) {
      self.onError.call(self, client, err);
    });
  });

  self.mqttServer_.listen(port);
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onConnect = function (client, packet) {
  client.id = packet.clientId;
  client.subscriptions = [];

  this.clients[client.id] = client;
  client.connack({returnCode: 0});
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onPublish = function (client, packet) {
  var subscribers = this.topicManager_.getSubscribers(packet.topic);

  subscribers.forEach(function (subscriber) {
    subscriber.publish(
      {
        topic: packet.topic,
        payload: packet.payload,
        qos: 0
      }
    )
  }, this);
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onPuback = function (client, packet) {
  ;
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onSubscribe = function (client, packet) {
  var granted = [];

  packet.subscriptions.forEach(function (subscription) {
    client.subscriptions.push(subscription.topic);
    this.topicManager_.addSubscriber(client, subscription.topic);
    granted.push(1); // TODO const
  }, this);

  client.suback({messageId: packet.messageId, granted: granted});
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onSuback = function (client, packet) {
  ; // 基本的に受け取ることはないコマンドメッセージ
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onUnsubscribe = function (client, packet) {
  this.topicManager_.removeSubscriber(client, packet.unsubscriptions);
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onUnsuback = function (client, packet) {
  ; // 基本的に受け取ることはないコマンドメッセージ
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onPingreq = function (client, packet) {
  client.pingresp();
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onPingresp = function (client, packet) {
  ; // 基本的に受け取ることはないメッセージ
};

/**
 *
 * @param client
 * @param packet
 * @protected
 */
ChatServer.prototype.onDisconnect = function (client, packet) {
  client.stream.end();
};

/**
 *
 * @param client
 * @param err
 * @protected
 */
ChatServer.prototype.onClose = function (client, err) {
  var subscriptions = this.clients[client.id].subscriptions;
  this.topicManager_.removeSubscriber(client, subscriptions);

  delete this.clients[client.id];
};

/**
 *
 * @param client
 * @param err
 * @protected
 */
ChatServer.prototype.onError = function (client, err) {
  client.stream.end();
  console.dir(err);
};


function TopicManager() {
  this.topics_ = {};
};

TopicManager.prototype.getSubscribers = function (topic) {
  var subscribers = [];
  var clientMap = this.topics_[topic];

  for (var clientId in clientMap) {
    subscribers.push(clientMap[clientId]);
  }

  return subscribers;
};

TopicManager.prototype.addSubscriber = function (client, topic) { // TODO reverse
  if (this.topics_[topic] === undefined) {
    this.topics_[topic] = {};
  }
  this.topics_[topic][client.id] = client;
};

TopicManager.prototype.removeSubscriber = function (client, topics) {  // TODO reverse
  topics.forEach(function (topic) {
    if (this.topics_[topic] !== undefined) {
      delete this.topics_[topic][client.id];
    }

    if (Object.keys(this.topics_[topic]).length === 0) {
      delete this.topics_[topic];
    }
  }, this);
};