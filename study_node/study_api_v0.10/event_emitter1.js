var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter;


ev.on('one', function (data) {
  console.log('1:' + data);
});

ev.on('two', function (data) {
  console.log('2:' + data);
});

ev.on('three', function (data) {
  console.log('3:' + data);
});
ev.on('three', function (data) {
  console.log('3:' + data + '\tsecond');
});


ev.emit('one', 'ichi');
ev.emit('two', 'ni');
ev.emit('three', 'san');

ev.emit('three', 'san');
ev.emit('one', 'ichi');
ev.emit('two', 'ni');



