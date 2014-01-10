/**
 * @fileOverview ChatServerのクラスタ管理
 */

/**
 * Requires
 */
var HashRing = require('./hashring');

/**
 * クラスタのノードを表すクラス
 * @param {number} port
 * @param {string} host
 * @constructor
 */
function ServerNode(port, host) {
  this.port = port;
  this.host = host;
}

ServerNode.prototype.toString = function () {
  return this.host + ':' + this.port;
};

/**
 * ChatServerのクラスタ管理を行うシングルトンオブジェクト
 */
// TODO 定期的？ファイル更新フックの？ rehash処理
var ChatServerCluster = (function () {
  var self = this;
  this.vnc_ = 120;  // ハッシュリングの仮想ノード数 TODO 設定ファイル
  this.hashRing_ = undefined;

  /**
   * 現在生きているノードの配列を取得します
   * @returns {Array} Array.<Object> includes:
   *    {number} port - ノードのポート,
   *    {string} host - ノードのホスト
   */
   // TODO mock実装
  var getAliveNodes = function() {
    return [
      new ServerNode(1884, 'localhost'),
      new ServerNode(1885, 'localhost')
    ];
  };

  /**
   * key文字列に対応するノードを取得します。
   * @param key
   * @returns {Object} includes:
   *   {number} port - ノードのポート,
   *   {string} host - ノードのホスト
   */
  var getNode = function(key) {
    return self.hashRing_.getNode(key);
  };

  /**
   * ハッシュリングを再構築します。
   * @private
   */
  var rehash_ = function() {
    self.hashRing_ = new HashRing(getAliveNodes(), self.vnc_);
  };

  rehash_();

  return {
    /** @see getAliveNodes */
    getAliveNodes: getAliveNodes,

    /** @see getNode */
    getNode: getNode
  };
})();

module.exports = ChatServerCluster;