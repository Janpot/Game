// TODO(Jan) decide where to put shims like these:
// Shim for performance.now()
// Date.now() may only have a resolution of 15ms on some browsers
// 60 FPS = intervals of 16.6 ms, window.performance.webkitNow provides 
// submillisecond precision
window.performance = window.performance || {};
performance.now = (function() {
  var pageStart = new Date().getTime();
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime() - pageStart; };
})();




var canvas = document.querySelector('#viewport');
var renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.autoClear = false;


var world = new game.World();
world.load();
var controls = new game.Controls(world);

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
      controls.setSize(width, height);
      world.camera.aspect = width / height;
      world.camera.updateProjectionMatrix();
      prevWidth = width;
      prevHeight = height;
    }    
  };
})();

var stats;

var init = function() {
  // Stats library to get framerate
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );
}

init();

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

  controls.update(delta);
  world.update(delta);
};

var animate = function () {
  var delta = getDelta();
  requestAnimationFrame(animate);
  update(delta);
  world.render(renderer);
  stats.update();
};

animate();

