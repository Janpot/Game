var express = require('express');
var config = require('./src/server/config.js');
var app = express();

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
  app.use(express.static(__dirname + '/src/server/public'));
  app.use(bundle);
});

console.log('Static file server running at http://localhost:' + config.port);


var server = app.listen(config.port);
var io = require('socket.io').listen(server);
io.set('log level', 0);

var gameServer = require('./src/server/gameServer.js');
var ServerGame = require('./src/server/ServerGame.js');
gameServer.start(io);

// add a testgame
ServerGame.load('/worlds/testworld.json').then(function (game) {
  gameServer.addGame('test', game);
});