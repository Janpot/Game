
var world = new World();

var canvas = document.querySelector('#viewport');
var renderer = new THREE.WebGLRenderer({canvas: canvas});
var scene = new THREE.Scene();
var maskScene = new THREE.Scene();
world.init(scene);
world.initHidingMask(maskScene);



// add a temporary aspect ratio of 1, will be reset by initViewport
var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
scene.add(camera);
camera.position.z = 60;


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
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      prevWidth = width;
      prevHeight = height;
    }    
  };
})();

var pointLight = new THREE.PointLight(0xFFFFFF);
var hidden;
var stats;

var init = function() {
  // set its position
  pointLight.position.x = 0;
  pointLight.position.y = 0;
  pointLight.position.z = 10;
  // add to the scene
  scene.add(pointLight);

  hidden = [];

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

/*
var renderPass = new THREE.RenderPass(scene, camera);
//var maskPass = new THREE.MaskPass(maskScene, camera);
renderPass.renderToScreen = true;

var composer = new THREE.EffectComposer(renderer);
composer.addPass(renderPass);
//composer.addPass(maskPass);
//renderer.render(scene, camera);
renderer.clear();
composer.render();*/

var controls = new Controls(world.player, document);

animate();


var getVisibleFloor = (function () {
  var p = new THREE.Projector();
  camera.updateMatrixWorld();
  var topLeft = new THREE.Vector3(-1, 1, -1);
  var topRight = new THREE.Vector3(1, 1, -1);
  var bottomLeft = new THREE.Vector3(-1, -1, -1);
  var bottomRight = new THREE.Vector3(1, -1, -1);
  return function () {
    var topLeftRay = p.pickingRay(topLeft, camera);
    var topRightRay = p.pickingRay(topRight, camera);
    var bottomLeftRay = p.pickingRay(bottomLeft, camera);
    var bottomRightRay = p.pickingRay(bottomRight, camera);
    return {
      topLeft: Utils.intersectXYPlane(topLeftRay),
      topRight: Utils.intersectXYPlane(topRightRay),
      bottomLeft: Utils.intersectXYPlane(bottomLeftRay),
      bottomRight: Utils.intersectXYPlane(bottomRightRay)
    };
  };
}) ();

// console.log(getVisibleFloor());


function animate() {
  // TODO(Jan): requestAnimationFrame heeft geen vaste intervallen
  // bereken tijdsverschil tussen twee frames om correcte updates te 
  // kunnen doen
  var delta;
  requestAnimationFrame(animate);
  render();
  update(delta);
  stats.update();
}

function update(delta) {
  initViewport();

  var movement = world.player.getSpeed();

  controls.update();
  
  var pos = world.player.getPosition();
  camera.position.x = pos.x;
  camera.position.y = pos.y;
  
  pointLight.position.x = pos.x;
  pointLight.position.y = pos.y;

  world.updateHidden();
}

function render() {
  renderer.render(scene, camera);
  //renderer.clear();
  //composer.render();
}
