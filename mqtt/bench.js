

this.a = 'hoge';

var b = Date.now();
for (var i = 0; i < 1000000; i++) {
  test_call1(this);
}
console.log(Date.now() - b);

var b = Date.now();
for (var i = 0; i < 1000000; i++) {
  test_call2.call(this);
}
console.log(Date.now() - b);

var b = Date.now();
for (var i = 0; i < 1000000; i++) {
  test_call2.call(this);
}
console.log(Date.now() - b);

var b = Date.now();
for (var i = 0; i < 1000000; i++) {
  test_call1(this);
}
console.log(Date.now() - b);




function test_call1(self) {
  var ab = self.a;
}

function test_call2() {
  var ab = this.a;
}