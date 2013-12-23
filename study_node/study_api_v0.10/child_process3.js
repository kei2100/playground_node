var exec = require('child_process').exec;

exec('ls -l /usr/bin', function (err, stdout, stderr) {
  // コマンド実行が正常終了であればerrはnullになる。
  if (!err) {
    console.log('==== no error =====');
    console.log(stdout.toString());
  } else {
    console.log('==== error occurred ====');
    console.log('exitCode:' + err.code);
    console.log('stdout:' + stdout.toString());
    console.log('stderr:' + stderr.toString());
  }
});
console.log('==== exec called ====');

/*
 execとspawnの使いドコロ
 http://memo.yomukaku.net/entries/GFfPTKQ
 */