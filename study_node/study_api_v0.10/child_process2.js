var EC_NO_ERR = 0;
var spawn = require('child_process').spawn;

/*
 /usr/biｎ配下をlsして、grep系ぽいコマンドを出力する。
 */
var ls = spawn('ls', ['-l', '/usr/bin']);
var grep = spawn('grep', ['grep']);

ls.stdout.on('data', function (data) {
  grep.stdin.write(data);
});
ls.on('close', function (exitCode) {
  if (exitCode !== EC_NO_ERR) {
    console.log("ls process exited with code:" + exitCode);
  }
  grep.stdin.end();
});

grep.stdout.on('data', function (data) {
  console.log(data.toString());
});
grep.on('close', function (exitCode) {
  if (exitCode !== EC_NO_ERR) {
    console.log("grep process exited with code:" + exitCode);
  }
});

