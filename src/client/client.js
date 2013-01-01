var ClientGame = require('./ClientGame');

var viewport = document.getElementById('viewport');
var loadingIndicator = document.getElementById('loadingIndicator');
var loadingMessage = document.getElementById('loading-message');

var beginLoading = function () {
  viewport.style.display = 'none';
  loadingIndicator.style.display = 'block';
};

var endLoading = function () {
  viewport.style.display = 'block';
  loadingIndicator.style.display = 'none';
};

var setLoadingMessage = function (msg) {
  loadingMessage.innerText = msg;
};

setLoadingMessage('Contacting server...');
beginLoading();

var socket = io.connect(location.origin);

var getId = function () {
  var match = /^\/game\/([^\/]*)/.exec(location.pathname);
  if (match) {
    return match[1];
  }
};

var id = getId();
if (id !== undefined) {
  setLoadingMessage('Connecting to game...');
  socket.emit('connectgame', id);
} else {
  setLoadingMessage('ERROR: Invalid game id');
}

socket.on('initialize', function (config) {
  setLoadingMessage('Loading level...');

  ClientGame.load(config.level)
    .then(onGameLoaded)
    .fail(function (err) {
      setLoadingMessage('ERROR: Error while loading the game');
      console.error(err.stack);
    });
});
            
var onGameLoaded = function (game) {    
  
  // for debugging purposes
   window.world = game;
  
  endLoading();
  game.start(viewport, socket);
  
};



