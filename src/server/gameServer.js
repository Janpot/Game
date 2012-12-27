var ServerGameController = require('./ServerGameController.js');

var games = {};
var controllers = {};

var connectPlayer = function (socket) {
  socket.on('connectgame', function (id) {
    // player connects to a game
    var game = games[id];
    if (game !== undefined) {
      controllers[socket.id] = new ServerGameController(game, socket);
    }
  });
  
  socket.on('disconnect', function () {
    var controller = controllers[socket.id];
    if (controller !== undefined) {
      controller.destroy();
    }
    delete controllers[socket.id];
  });
};

exports.start = function (io) {
  io.sockets.on('connection', connectPlayer);  
};

exports.addGame = function (id, game) {
  games[id] = game;
}