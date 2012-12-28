var ClientGame = require('./ClientGame.js');
var ClientPlayerController = require('./ClientPlayerController.js');
var EnemiesController = require('./EnemiesController.js');

// set up canvas
var canvas = document.querySelector('#viewport');
var renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.autoClear = false;

// Stats library to get framerate
container = document.createElement( 'div' );
document.body.appendChild( container );
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );

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
  
  var controller = new ClientPlayerController(game, socket);
  var enemiesController = new EnemiesController(game, socket);
  
  var initViewport = (function() {  
    // variables to store previous state
    var prevWidth, prevHeight;    
    return function() {
      // get the size
      var width = document.body.clientWidth;
      var height = document.body.clientHeight;
      if (width != prevWidth || height != prevHeight) {
        // only resize when size actually changes
        renderer.setSize(width, height);
        game.setSize(width, height);
        controller.setSize(width, height);
        
        prevWidth = width;
        prevHeight = height;
      }    
    };
  })();
  
  // get the time difference between two consecutive calls of this function
  var getDelta = (function () {
    var lastCall = window.performance.now();
    return function () {
      var now = window.performance.now();
      var delta = now - lastCall;
      lastCall = now;
      return delta / 1000; //s
    };
  }) ();
  
  var update = function (delta) {
    initViewport();
    controller.update(delta);
    enemiesController.update(delta);
    game.update(delta);
  };
  
  var animate = function () {
    stats.begin();
    var delta = getDelta();
    update(delta);
    game.render(renderer);
    stats.update();
    
    requestAnimationFrame(animate);
  };
  
  animate();
  
};



