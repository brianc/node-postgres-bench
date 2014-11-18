var async = require('async')
var old = require('pg-old')
var current = require('pg')


var loops = 100

var setup = function(client, cb) {
  client.query('CREATE TEMP TABLE person(name text, age int)', function(err) {
    if(err) return cb(err);
    var insert = function(i, cb) {
      client.query('INSERT INTO person(name, age) VALUES($1, $2)', ['brian' + i, i], cb)
    }
    async.timesSeries(loops, insert, cb)
  })
}

var run = function(client, cb) {
  var query = function(n, cb) {
    client.query('SELECT * FROM person WHERE age > $1', [n], cb)
  }
  async.timesSeries(loops, query, cb)
}

var bench = function(name, client, cb) {
  client.connect(function(err) {
    if(err) throw err;
    setup(client, function() {
      var start = Date.now()
      run(client, function(err) {
        if(err) throw err;
        console.log(name, Date.now() - start)
        client.end()
        cb()
      })
    })
  })
}

var benches = [
  ['old-native', old.native.Client],
  ['new-native', current.native.Client],
  ['old-pure  ', old.Client],
  ['new-pure  ', current.Client],
  ['pg-native ', require('pg-native')]
]

var go = function(_, cb) {
  console.log()
  async.eachSeries(benches, function(data, cb) {
    bench(data[0], new (data[1])(), cb)
  }, function() {
    console.log()
    setTimeout(cb, 500)
  })
}

async.timesSeries(10, go, function() {
  
})
