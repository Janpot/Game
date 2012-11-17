
var world = new World();

var canvas = document.querySelector('#viewport');
var renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.autoClear = false;
var scene = new THREE.Scene();
var maskScene = new THREE.Scene();
world.init(scene);



// add a temporary aspect ratio of 1, will be reset by initViewport
var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
scene.add(camera);
camera.position.z = 60;

var controls = new Controls(world, camera);

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
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
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

initViewport();
init();

// get the time difference between two consecutive calls of this function
var getDelta = (function () {
  var lastCall = Date.now();
  return function () {
    var now = Date.now();
    var delta = now - lastCall;
    lastCall = now;
    return delta / 1000; //s
  };
}) ();

var update = function (delta) {
  initViewport();

  controls.update(delta);
  world.update(delta);
  
  var pos = world.player.position;
  camera.position.x = pos.x;
  camera.position.y = pos.y;
};

var render = function () {
  var ctx = renderer.context;
  renderer.clear();
  
  // prepare stencilbuffer for writing a mask
  ctx.enable(ctx.STENCIL_TEST);
  ctx.stencilFunc(ctx.ALWAYS, 0x1, 0x1);
  ctx.stencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
  
  // render the mask
  world.setMode(World.obscuringMask);
  renderer.render(scene, camera);
  
  // clear the depth buffer after masking
  ctx.clearDepth(0xffffff);
  ctx.clear(ctx.DEPTH_BUFFER_BIT);
  
  // prepare stencilbuffer for using mask
  ctx.stencilFunc(ctx.EQUAL, 0x0, 0x1 );
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
  
  // render the visible parts
  world.setMode(World.visibleParts);
  renderer.render(scene, camera);
  
  // invert mask
  ctx.stencilFunc(ctx.EQUAL, 0x1, 0x1);
  
  // render the obscured parts
  world.setMode(World.obscuredParts);
  renderer.render(scene, camera);
};

var animate = function () {
  var delta = getDelta();
  requestAnimationFrame(animate);
  update(delta);
  render();
  stats.update();
};

animate();

