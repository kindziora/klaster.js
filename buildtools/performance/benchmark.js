
var Nightmare = require('nightmare');

const nightmare = Nightmare({ show: true });

nightmare
  .goto('http://localhost:3000/4.%20validator/')
  .type('#inputEmail', 'github@test.de')
  //.evaluate(() => document.querySelector('[data-view="email"]').innerHTML)
  //.end()
  .then(console.log)
  .catch((error) => {
    console.error('Search failed:', error);
  });

/*
var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

// add tests
suite.add('RegExp#test', function() {
  /o/.test('Hello World!');
})
.add('String#indexOf', function() {
  'Hello World!'.indexOf('o') > -1;
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });

*/
