var ServerPlayerController = require('./ServerPlayerController.js');
var factory = require('./serverFactory');

var games = {};

var connectPlayer = function (socket) {
  socket.on('connectgame', function (id) {
    // player connects to a game
    var game = games[id];
    if (game !== undefined) {
      var controller = new ServerPlayerController(factory, socket);
      game.addObject(controller);
    }
  });
};

exports.start = function (io) {
  io.sockets.on('connection', connectPlayer);  
};

exports.addGame = function (id, game) {
  games[id] = game;
  game.start();
}