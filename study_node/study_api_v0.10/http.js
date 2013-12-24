var http = require('http');
var server = http.createServer();

server.on('request', function (req, res) {
  res.write('request url is ' + req.url);
  res.end();

  if (req.url === '/kill') {
    server.close();
    process.exit(0);
  }
}).listen(8080);