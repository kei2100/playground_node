/**
 * @fileOverview リバースプロキシからリアルサーバへMQTT通信を行うクライアント
 */

/**
 * Requires 3rd party module
 */
var mqtt = require('mqtt');

/**
 * リバースプロキシからリアルサーバへMQTT通信を行うクライアント
 *
 * @param {ProxyServer} proxyServer
 * @param {number} realServerPort
 * @param {string} realServerHost
 * @constructor
 */
function ProxyClient(proxyServer, realSeverPort, realServerHost) {
  var self = this;
  this.proxyServer_ = proxyServer;
  this.mqttClient_ = mqtt.createClient(realSeverPort, realServerHost);

  this.mqttClient_.on('message', function(topic, message, packet) {
    self.onMessage_.call(self, topic, message, packet);
  });

}

module.exports = ProxyClient;

var noop = function() {};

/**
 * リアルサーバからPUBLISHコマンドメッセージを受信した時
 * @private
 * @see MqttClient._handlePublish
 */
ProxyClient.prototype.onMessage_ = function (topic, message, packet) {
  console.log('proxyClient onMessage!');

  // プロキシサーバの対象トピックにサブスクライブしているクライアントにPUBLISHする
  var subscribers = this.proxyServer_.getSubscribers(topic);
  subscribers.forEach(function (subscriber) {
    subscriber.publish(
      {
        topic: topic,
        payload: message,
        qos: 0   // TODO const
      }
    );
  });

};

/**
 * リアルサーバへPUBLISHコマンドメッセージを送信する
 * @see MqttClient.publish
 */
ProxyClient.prototype.publish = function(topic, message, opts, callback) {
  this.mqttClient_.publish(topic, message, opts, callback);
};

/**
 * リアルサーバへSUBSCRIBEコマンドメッセージを送信する。
 * すでに対象トピックでリアルサーバにSUBSCLIBEしていた場合は、
 * 新たにメッセージは送らない。
 *
 * @see MqttClient.subscribe
 */
ProxyClient.prototype.subscribe = function(topic, opts, callback) {
  // .subscribe('topic', callback)
  if ('function' === typeof opts) {
    callback = opts;
    opts = null;
  }
  callback = callback || noop;

  var subscribers = this.proxyServer_.getSubscribers(topic);
  var isFirstSubscriber = subscribers.length === 1;

  if (isFirstSubscriber) {
    this.mqttClient_.subscribe(topic, opts, callback);
    console.log('proxyClient subscribe!');
  } else {
    callback();
  }
};

/**
 * リアルサーバへUNSUBSCRIBEコマンドメッセージを送信する。
 * プロキシサーバの該当トピックにSUBSCRIBEしている他のクライアントがいる場合は、
 * メッセージは送らない。
 *
 * @see MqttClient.unsubscribe
 */
ProxyClient.prototype.unsubscribe = function (topic, callback) {
  callback = callback || noop;
  var subscribers = this.proxyServer_.getSubscribers(topic);
  var existsSubscriber = subscribers.length > 0;

  if (existsSubscriber) {
    callback();
  } else {
    this.mqttClient_.unsubscribe(topic, callback);
    console.log('proxyClient unsubscribe!');
  }
};