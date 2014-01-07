var ChatServerManager = (function () {

  return {
    getAliveServers: function () {
      return ['localhost:1883', 'localhost:1884', 'localhost:1885'];
    }
  };
})();

module.exports.ChatServerManager = ChatServerManager;