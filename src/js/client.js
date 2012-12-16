var Player = require('./Player.js');
var PlayerController = require('./PlayerController.js');
var NetworkController = require('./NetworkController.js');
var WorldLoader = require('./WorldLoader.js');

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
  // error
}

socket.on('initialize', function (config) {
  var worldLoader = new WorldLoader();
  console.log(config);
  worldLoader.load(config.level, onWorldLoaded);
});
                 
var onWorldLoaded = function (world) {    
  
  // for debugging purposes
  window.world = world;
  
  var player = new Player({
    position: new THREE.Vector2(0, 0)
  });
  
  var playerController = new PlayerController(world, player, socket);
  var networkController = new NetworkController(world, player, socket);
  
  var initViewport = (function() {  
    // variables to store previous state
    var prevWidth, prevHeight;    
    return function() {
      // get the size
      var width = document.body.clientWidth;
      var height = document.body.clientHeight;
      if (width != prevWidth || height != prevHeight) {
        // only resize when size actually changes
        var aspect = viewport.width / viewport.height;
        renderer.setSize(width, height);
        playerController.setSize(width, height);
        world.camera.aspect = width / height;
        world.camera.updateProjectionMatrix();
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
    networkController.update(delta);
    playerController.update(delta);
    world.update(delta);
  };
  
  var animate = function () {
    stats.begin();
    var delta = getDelta();
    update(delta);
    world.render(renderer);
    stats.update();
    
    requestAnimationFrame(animate);
  };
  
  animate();

};



