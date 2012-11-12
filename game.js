
var world = new World();

var canvas = document.querySelector('#viewport');
var renderer = new THREE.WebGLRenderer({canvas: canvas});
var scene = new THREE.Scene();
world.init(scene);

// add a temporary aspect ratio of 1, will be reset by initViewport
var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 61);
scene.add(camera);
camera.position.z = camera.far - 1;

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


function updateHidden() {
  
  var playerPos = world.player.getPosition();
  for (var i = 0; i < world.walls.length; i++) {
    world.walls[i].setHidden(playerPos);
  }
  
  for (var i = 0; i < world.enemies.length; i++) {
    var enemy = world.enemies[i];
    enemy.mesh.visible = world.isVisible(enemy.getPosition());
  }
  
};

// draw!
var up = false, down = false, left = false, right = false;

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
  stats.update();
}

function update() {
  initViewport();

  var movement = world.player.getSpeed();

  if (up) {
    world.player.move(0, movement);
  }
  if (down) {
    world.player.move(0, -movement);        
  }
  if (left) {
    world.player.move(-movement, 0);
  }
  if (right) {
    world.player.move(movement, 0);       
  }
  
  var pos = world.player.getPosition();
  camera.position.x = pos.x;
  camera.position.y = pos.y;
  
  pointLight.position.x = pos.x;
  pointLight.position.y = pos.y;

  updateHidden();
}

function render() {
  renderer.render(scene, camera);
}



// console.log(getVisibleFloor());
            
function keyDown(e)
{  
  var code = e.keyCode ? e.keyCode : e.which;
  if (code == 38)
    up = true;
  if (code == 40)
    down = true;
  if (code == 37)
    left = true;
  if (code == 39)
    right = true;
}

function keyUp(e)
{
  var code = e.keyCode ? e.keyCode : e.which;
  if (code == 38)
    up = false;
  if (code == 40)
    down = false;
  if (code == 37)
    left = false;
  if (code == 39)
    right = false;
}
    
document.body.addEventListener('keyup', keyUp, false);
document.body.addEventListener('keydown', keyDown, false);

