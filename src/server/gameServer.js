var games = {};

var connectPlayer = function (socket) {  
  socket.on('connectgame', function (id) {
    // player connects to a game
    var game = games[id];
    if (game !== undefined) {     
      game.connectClient(socket);
    }
  });
};

exports.start = function (io) {
  io.sockets.on('connection', connectPlayer);  
};

exports.addGame = function (id, game) {
  games[id] = game;
}