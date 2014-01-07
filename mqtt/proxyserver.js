var util = require('util');

var mqtt = require('mqtt');

var ChatServer = require('./chatserver').ChatServer;
var ChatServerManager = require('./chatserver_manager').ChatServerManager;
var HashRing = require('./hashring').HashRing;

function ProxyServer() {
  ChatServer.call(this);

  this.hashRing_ = undefined;
  this.vnc_ = undefined;
  this.chatServerManager = ChatServerManager;
}
util.inherits(ProxyServer, ChatServer);


/**
 *
 * @param opt_config
 * @override
 */
ProxyServer.prototype.start = function (opt_config) {
  this.vnc_ = (opt_config && opt_config.virtualNodeCount) || 100;
  this.rehash();

  ProxyServer.super_.prototype.start(opt_config);
}

ProxyServer.prototype.rehash = function () {
  var servers = this.chatServerManager.getAliveServers();
  this.hashRing_ = new HashRing(servers, this.vnc_);
}




new ProxyServer().start();


