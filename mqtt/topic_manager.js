/**
 * @fileOverview トピックに紐づくサブスクライバを管理する
 */

/**
 * トピックに紐づくサブスクライバを管理するコンテナ
 * @constructor
 */
function TopicManager() {
  /**
   * {
   *   key: topic,
   *   value: {key: subscriber's id, value: subscriber }
   * }
   * */
  this.topics_ = {};
}

module.exports = TopicManager;

/**
 * 指定されたトピックをSUBSCRIBEしているクライアントを取得します。
 * @param {string} topic
 * @returns {Array} Array.<MqttConnection>
 */
TopicManager.prototype.getSubscribers = function (topic) {
  var subscribers = [];
  var clientMap = this.topics_[topic];

  for (var clientId in clientMap) {
    subscribers.push(clientMap[clientId]);
  }

  return subscribers;
};

/**
 * サブスクライバをこのコンテナに追加します。
 * @param {MqttConnection} client
 *  SUBSCRIBEするclient。clientごとに一意となるidプロパティを持っていること。
 * @param topic SUBSCRIBE対象のトピック
 */
TopicManager.prototype.addSubscriber = function (client, topic) {
  if (this.topics_[topic] === undefined) {
    this.topics_[topic] = {};
  }
  this.topics_[topic][client.id] = client;
};

/**
 * サブスクライバをこのコンテナから削除します。
 * @param {MqttConnection} client
 *  削除するclient。clientごとに一意となるidプロパティを持っていること。
 * @param topic clientがSUBSCRIBEしていたトピック
 */
TopicManager.prototype.removeSubscriber = function (client, topics) {
  topics.forEach(function (topic) {
    if (this.topics_[topic] !== undefined) {
      delete this.topics_[topic][client.id];

      if (Object.keys(this.topics_[topic]).length === 0) {
        delete this.topics_[topic];
      }
    }
  }, this);
};