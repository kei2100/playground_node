/**
 * @fileOverview ChatServerのリバースプロキシ
 */

/**
 * Requires Node core module
 */
var util = require('util');

/**
 * Requires
 */
var ChatServer = require('./chatserver');
var ChatServerCluster = require('./chatserver_cluster');
var TopicManager = require('./topic_manager');
var ProxyClient = require('./proxyclient');

/**
 * ChatServerのリバースプロキシ
 * @extends {ChatServer}
 * @constructor
 */
function ProxyServer() {
  ChatServer.call(this);

  this.topicManager_ = new TopicManager();
  this.chatServerCluster_ = ChatServerCluster;
}
util.inherits(ProxyServer, ChatServer);

/**
 * 指定されたトピックにSUBSCRIBEしているクライアントを取得します。
 * @param {string} topic
 * @returns {Array} Array.<MqttConnection>
 */
ProxyServer.prototype.getSubscribers = function(topic) {
  return this.topicManager_.getSubscribers(topic);
};

/**
 *
 * @param opt_config
 * @override
 */
ProxyServer.prototype.start = function(opt_config) {
  ProxyServer.super_.prototype.start.call(this, opt_config);
};

/**
 *
 * @param client
 * @param packet
 * @override
 */
ProxyServer.prototype.onConnect = function(client, packet) {
  client.id = packet.clientId;
  client.subscriptions = [];

  client.connack({returnCode: 0});
};

/**
 * PUBLISHコマンドメッセージ受信時。
 * リアルサーバにメッセージを中継します。
 * @override
 * @see ChatServer.onPublish
 */
ProxyServer.prototype.onPublish = function(client, packet) {
  var proxyClient = this.getProxyClient_(packet.topic);

  proxyClient.publish(packet.topic, packet.payload, {qos: 1}, function () {  // TODO const
    client.puback({messageId: packet.messageId});
  });
};

/**
 * SUBSCRIBEコマンドメッセージ受信時。
 * リアルサーバにメッセージを中継します。
 * @override
 * @see ChatServer.onSubscribe
 */
ProxyServer.prototype.onSubscribe = function(client, packet) {
  // TODO 認可
  // 一回のSUBSCRIBEで複数トピックの指定は認めない。
  var subscriptions = packet.subscriptions;
  if (subscriptions.length > 1) {
    // TODO ログ
    client.stream.end();
  }

  var topic = subscriptions[0].topic;
  var messageId = packet.messageId;
  var proxyClient = this.getProxyClient_(topic);

  client.subscriptions.push(topic);
  this.topicManager_.addSubscriber(client, topic);

  proxyClient.subscribe(topic, function(err, granted) {
    client.suback({messageId: messageId, granted: [0]});
  });
};

/**
 * UNSUBSCRIBEコマンドメッセージ受信時。
 * リアルサーバにメッセージを中継します。
 * @override
 * @see ChatServer.onUnsubscribe
 */
ProxyServer.prototype.onUnsubscribe = function (client, packet) {
  var unsubscriptions = packet.unsubscriptions;
  var subscriptions = client.subscriptions;

  this.topicManager_.removeSubscriber(client, unsubscriptions);

  unsubscriptions.forEach(function (unsubTopic) {
    client.subscriptions = subscriptions.filter(function (subTopic) {
      return subTopic !== unsubTopic;
    });

    var proxyClient = this.getProxyClient_(unsubTopic);
    proxyClient.unsubscribe(unsubTopic);
  }, this);

  client.unsuback({messageId: packet.messageId});
};

/**
 * @override
 * @see ChatServer.onPingreq
 */
ProxyServer.prototype.onPingreq = function (client, packet) {
  client.pingresp();
};

/**
 * @override
 * @see ChatServer.onDisconnect
 */
ProxyServer.prototype.onDisconnect = function (client, packet) {
  client.stream.end();
};

/**
 * ソケットが閉じた時。
 * クライアントがSUBSCRIBEしているトピックが残っていた場合、
 * リアルサーバにUNSUBSCRIBEを中継します。
 * @override
 * @see ChatServer.onClose
 */
ProxyServer.prototype.onClose = function (client, err) {
  var subscriptions = client.subscriptions;
  this.topicManager_.removeSubscriber(client, subscriptions);

  subscriptions.forEach(function(topic) {
    var proxyClient = this.getProxyClient_(topic);
    proxyClient.unsubscribe(topic);
  }, this);
};

/**
 * @override
 * @see ChatServer.onError
 */
ProxyServer.prototype.onError = function (client, err) {
  client.stream.end();
  console.dir(err);
};

/**
 * 指定されたトピックに対応するリアルサーバへ
 * メッセージを中継するクライアントを取得します。
 * @param {string} topic
 * @returns {ProxyClient}
 * @private
 */
ProxyServer.prototype.getProxyClient_ = function (topic) {
  var realServer = this.chatServerCluster_.getNode(topic);

  if (realServer.proxyClient === undefined) {
    realServer.proxyClient = new ProxyClient(this, realServer.port, realServer.host);
  }

  return realServer.proxyClient;
};

// TODO ↓ for test
//new ProxyServer().start();
//
//process.on('uncaughtException', function(err){
//  console.log(err);
//  console.log(err.stack);
//  process.exit(1);
//});