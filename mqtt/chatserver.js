/**
 * @fileOverview ChatServer using MQTT
 */

/**
 * Requires 3rd party
 */
var mqtt = require('mqtt');

/**
 * Requires
 */
var Const = require('./chat_constant.js'),
    TopicManager = require('./topic_manager');

/**
 * ChatServer
 * @constructor
 */
function ChatServer () {
  this.topicManager_ = new TopicManager();
  this.mqttServer_ = undefined;
}

module.exports = ChatServer;

/**
 * サーバを開始します
 * @param {Object} [opt_config] config includes:
 *  {number} port - Listen port
 */
ChatServer.prototype.start = function (opt_config) {
  var self = this;
  var port = (opt_config && opt_config.port) || 1883;

  self.mqttServer_ = mqtt.createServer(function (client) {
    client.on('connect', function(packet) {
      console.log('on connect!');
      self.onConnect.call(self, client, packet);
    });

    client.on('publish', function(packet) {
      console.log('on publish!');
      self.onPublish.call(self, client, packet);
    });

    client.on('subscribe', function(packet) {
      console.log('on subscribe!');
      self.onSubscribe.call(self, client, packet);
    });

    client.on('unsubscribe', function(packet) {
      console.log('on unsubscribe!');
      self.onUnsubscribe.call(self, client, packet);
    });

    client.on('pingreq', function(packet) {
      self.onPingreq.call(self, client, packet);
    });

    client.on('disconnect', function(packet) {
      console.log('on disconnect!');
      self.onDisconnect.call(self, client, packet);
    });

    client.on('close', function(err) {
      console.log('on close!');
      self.onClose.call(self, client, err);
    });

    client.on('error', function(err) {
      console.log('on error!');
      self.onError.call(self, client, err);
    });
  });

  self.mqttServer_.listen(port);
};

/**
 * CONNECTコマンドメッセージ受信時
 * @param {MqttConnection} client
 * @param packet
 * @protected
 */
ChatServer.prototype.onConnect = function (client, packet) {
  client.id = packet.clientId;
  client.subscriptions = [];

  client.connack({returnCode: 0});
};

/**
 * PUBLISHコマンドメッセージ受信時
 * @param {MqttConnection} client
 * @param packet
 * @protected
 */
ChatServer.prototype.onPublish = function (client, packet) {

  // TODO Persistence
  client.puback({messageId: packet.messageId});

  var subscribers = this.topicManager_.getSubscribers(packet.topic);
  subscribers.forEach(function (subscriber) {
    subscriber.publish(
      {
        topic: packet.topic,
        payload: packet.payload,
        qos: Const.MqttQoS.LV0
      }
    );
  });
};

/**
 * SUBSCRIBEコマンドメッセージ受信時
 * @param {MqttConnection} client
 * @param packet
 * @protected
 */
ChatServer.prototype.onSubscribe = function (client, packet) {
  var granted = [];

  packet.subscriptions.forEach(function (subscription) {
    client.subscriptions.push(subscription.topic);
    this.topicManager_.addSubscriber(client, subscription.topic);
    granted.push(Const.MqttQoS.LV0);
  }, this);

  client.suback({messageId: packet.messageId, granted: granted});
};

/**
 * UNSUBSCRIBEコマンドメッセージ受信時
 * @param {MqttConnection} client
 * @param packet
 * @protected
 */
ChatServer.prototype.onUnsubscribe = function (client, packet) {
  var subscriptions = client.subscriptions;
  var unsubscriptions = packet.unsubscriptions;

  this.topicManager_.removeSubscriber(client, unsubscriptions);

  unsubscriptions.forEach(function (unsubTopic) {
    subscriptions = subscriptions.filter(function (subTopic) {
      return subTopic !== unsubTopic;
    });
  }, this);

  client.unsuback({messageId: packet.messageId});
};

/**
 * PINGREQコマンドメッセージ受信時
 * @param {MqttConnection} client
 * @param packet
 * @protected
 */
ChatServer.prototype.onPingreq = function (client, packet) {
  client.pingresp();
};

/**
 * DISCONNECTコマンドメッセージ受信時
 * @param {MqttConnection} client
 * @param packet
 * @protected
 */
ChatServer.prototype.onDisconnect = function (client, packet) {
  client.stream.end();
};

/**
 * ソケットが閉じた時
 * @param {MqttConnection} client
 * @param err
 * @protected
 */
ChatServer.prototype.onClose = function (client, err) {
  var subscriptions = client.subscriptions;
  this.topicManager_.removeSubscriber(client, subscriptions);
};

/**
 * 通信エラーが発生した場合。closeイベントがこの後呼ばれます。
 * @param {MqttConnection} client
 * @param err
 * @protected
 */
ChatServer.prototype.onError = function (client, err) {
  client.stream.end();
  console.dir(err);
};