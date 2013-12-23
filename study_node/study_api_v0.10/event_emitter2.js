var util = require('util');
var events = require('events');

function AsyncExecutor() {
  events.EventEmitter.call(this);
};
util.inherits(AsyncExecutor, events.EventEmitter);

var ae = new AsyncExecutor();

ae.on('before', function () {
  console.log('before');
}).on('exec', function () {
  console.log('exec');
}).on('after', function () {
  console.log('after');
});

ae.emit('before');
ae.emit('exec');
ae.emit('after');


