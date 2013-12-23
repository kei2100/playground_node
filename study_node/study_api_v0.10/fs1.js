var fs = require('fs');

var watcher = fs.watch('/tmp', function (event, filename) {
  console.log('event is:' + event);

  if (filename) {
    console.log('filename provided.' + filename);
  } else {
    // OSによってはfilenameはnullの場合がある。
    // サポートされているOSでも常にfilenameが提供されるわけではない。
    console.log('filename not provided.')
  }
});


var path = '/tmp/study_node.txt';

fs.writeFile(path, 'studying.\n', function (err) {
  console.log('file saved.');

  setTimeout(function () {
    fs.appendFile(path, 'studying...\n', function (err) {
      console.log("file saved.");
    });
  }, 1000);
});

setTimeout(function () {
  watcher.close();
}, 3000);
