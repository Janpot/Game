var ClientGame = require('./ClientGame.js');

var viewport = document.getElementById('viewport');
viewport.style.display = 'none';

var socket = io.connect(location.origin);

var getId = function () {
  var match = /^\/game\/([^\/]*)/.exec(location.pathname);
  if (match) {
    return match[1];
  }
};

var id = getId();
if (id !== undefined) {
  socket.emit('connectgame', id);
} else {
  console.log('Error connecting');
}

socket.on('initialize', function (config) {
  ClientGame.load(config.level)
      .then(onGameLoaded)
      .fail(function (err) {
        console.error(err.stack);
      });
});
                 
var onGameLoaded = function (game) {    
  
  // for debugging purposes
  // window.world = game;
  viewport.style.display = 'block';
  game.start(viewport, socket);
  
};



