var cp = require('child_process');

var ls = cp.spawn('ls', ['-l', '/usr/bin']);
ls.stdout.on('data', function (data) {
  // 標準出力のバッファが利用可能になるたびに呼び出される。
  console.log('==== on data ====');
  console.log(data.toString());
});

console.log('==== spawned ====');
