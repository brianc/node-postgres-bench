var async = require('async')
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

var old = require('pg@3.4.5')
var current = require('pg')

var benches = [
  ['3.4.5 - native   ', old.native.Client],
  ['3.4.5 - pure js  ', old.Client],
  ['current - native ', current.native.Client],
  ['current - pure js', current.Client],
  ['pg-native (raw)  ', require('pg-native')]
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
