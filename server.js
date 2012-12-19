var express = require('express');
var app = express();
var port = 8080;

var browserify = require('browserify');
var bundle = browserify({
  entry: './src/client/client.js',
  mount: '/client.js',
  watch: true,
  debug: true
});

bundle.on('syntaxError', function(err) {
  console.log(err);
});

app.configure(function(){
  app.get('/game/:id', function(request, response) { 
    response.sendfile('./src/game.html');
  });
  app.get('/', function(request, response) { 
    response.sendfile('./src/room.html');
  });
  app.use(express.static(__dirname + '/src/public'));
  app.use(bundle);
});

console.log('Static file server running at http://localhost');


var server = app.listen(port);
var io = require('socket.io').listen(server);
io.set('log level', 0);
var gameServer = require('./src/server/gameServer.js');
gameServer.start(io);

// add a testgame
gameServer.addGame('test', new gameServer.Game({
  level: '/worlds/testworld.json'
}));
