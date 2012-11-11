
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

var init = function() {
  // set its position
  pointLight.position.x = 0;
  pointLight.position.y = 0;
  pointLight.position.z = 10;
  // add to the scene
  scene.add(pointLight);

  hidden = [];
}

initViewport();
init();
animate();

var intersectXYPlane = function (ray, z) {
  z = z || 0;
  var t = (z - ray.origin.z) / ray.direction.z;
  var x = ray.origin.x + ray.direction.x * t;
  var y = ray.origin.y + ray.direction.y * t;
  return new THREE.Vector3(x, y, z);
};


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
      topLeft: intersectXYPlane(topLeftRay),
      topRight: intersectXYPlane(topRightRay),
      bottomLeft: intersectXYPlane(bottomLeftRay),
      bottomRight: intersectXYPlane(bottomRightRay)
    };
  };
}) ();

var eachWall = function(fn) {
  var result = [];
  for (var i = 0; i < world.walls.length; i++) {
    var wallPoly = world.walls[i];
    for (var j = 0; j < wallPoly.corners.length ; j++) {
      var wall = {
        point1: wallPoly.corners[j],
        point2: wallPoly.corners[(j + 1) % wallPoly.corners.length]
      };
      fn(wall);
    }
  }
};

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
  //stats.update();
}

function render() {
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

