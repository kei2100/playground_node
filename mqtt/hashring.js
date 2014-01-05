var crypto = require('crypto');

/**
 * コンシステント・ハッシングのためのハッシュリングを構築します。
 *
 * @param {Array} nodes ノードの配列
 * @param {number} vnc Virtual Node Count (仮想ノードの数)。１以上の値を指定すること。
 * @constructor
 */
function HashRing(nodes, vnc) {
  // TODO validation

  this.nodes_ = nodes;
  this.vnc_ = vnc;

  this.nodeMap_ = this.createNodeMap_(nodes, vnc);
  this.nodeMapKeys_ = Object.keys(this.nodeMap_).sort();
}

module.exports.HashRing = HashRing;

/**
 * ハッシュリングの状態を取得します。
 *
 * @returns {
 *  {nodes: Array,
 *  vnc: number,
 *  nodeMap: object,
 *  nodeMapKeys: Array}}
 *  ノードの配列, 仮想ノードの数,
 *    ノードとハッシュキーのマッピング, ハッシュキーの配列、を含むオブジェクト
 */
HashRing.prototype.getState = function () {
  return {
    nodes: this.nodes_,
    vnc: this.vnc_,
    nodeMap: this.nodeMap_,
    nodeMapKeys: this.nodeMapKeys_
  };
}

/**
 * 与えられたキーに対応するノードを取得します。
 *
 * @param key キー
 * @returns {*} 対応するノード
 */
HashRing.prototype.getNode = function (key) {
  // TODO validation, write jsdoc when nodes empty.

  var hash = this.getHash_(key);
  var lastIndex = this.nodeMapKeys_.length - 1;
  var head = 0;
  var tail = lastIndex;

  while (head <= tail) {
    var pos = head + Math.floor((tail - head) / 2);
    var posHash = this.nodeMapKeys_[pos];

    if (hash === posHash) {
      return this.nodeMap_[posHash];
    } else if (hash < posHash) {
      tail = pos - 1;
    } else {
      head = pos + 1;
    }
  }

  if (head > lastIndex) {
    // key が nodeMapKeys_の最大値を超えていた場合
    return this.nodeMap_[this.nodeMapKeys_[0]];
  } else {
    return this.nodeMap_[this.nodeMapKeys_[head]];
  }
}

/**
 * ノードとハッシュキーのマッピングを生成します。
 *
 * @param nodes
 * @param vnc
 * @returns {{}}
 * @private
 */
HashRing.prototype.createNodeMap_ = function (nodes, vnc) {
  var nodeMap = {};

  for (var i = 0; i < nodes.length; i++) {
    for (var j = 0; j < vnc; j++) {
      var node = nodes[i];
      var hash = this.getHash_(node + '-' + j);
      nodeMap[hash] = node;
    }
  }

  return nodeMap;
}

/**
 * キーからハッシュ値を取得します。
 * @param hashKey
 * @returns {*}
 * @private
 */
HashRing.prototype.getHash_ = function (hashKey) {
  return crypto.createHash('md5')
    .update(String(hashKey))
    .digest('hex');
}

