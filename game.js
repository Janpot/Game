var threeD = true;

(function () {
  
  if (!threeD) return;

var world = {
    walls: [
      {
        points : [
          new THREE.Vector2(100, 100),
          new THREE.Vector2(250, 100),
          new THREE.Vector2(300, 270),
          new THREE.Vector2(200, 300),
          new THREE.Vector2(200, 400)
        ]
      },
      {
        points : [
          new THREE.Vector2(400, 150),
          new THREE.Vector2(600, 100),
          new THREE.Vector2(630, 270),
          new THREE.Vector2(500, 450),
          new THREE.Vector2(450, 400)
        ]
      }
    ],
    player: new Player()
  };

var canvas = document.querySelector('#viewport');
var renderer = new THREE.WebGLRenderer({canvas: canvas});
var scene = new THREE.Scene();

// add a temporary aspect ratio of 1, will be reset by initViewport
var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
scene.add(camera);
camera.position.z = camera.far;

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

var init = function () {
  initViewport();
};

init();



scene.add(world.player.mesh);

for (var i = 0; i < world.walls.length; i++) {
  var wall = new Wall(world.walls[i].points);
  scene.add(wall.mesh);
}



// create a point light
var pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 0;
pointLight.position.y = 0;
pointLight.position.z = 60;

// add to the scene
scene.add(pointLight);

var intersectXYPlane = function (ray, z) {
  z = z || 0;
  var t = (z - ray.origin.z) / ray.direction.z;
  var x = ray.origin.x + ray.direction.x * t;
  var y = ray.origin.y + ray.direction.y * t;
  return new THREE.Vector3(x, y, z);
};

var p = new THREE.Projector();
camera.updateMatrixWorld();



var getVisibleFloor = (function () {
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
    for (var j = 0; j < wallPoly.points.length ; j++) {
      var wall = {
        point1: wallPoly.points[j],
        point2: wallPoly.points[(j + 1) % wallPoly.points.length]
      };
      fn(wall);
    }
  }
};

var sqr = function (x) { return x* x; };

var hidden = [];

var updateHidden = function () {
  var mat = new THREE.LineBasicMaterial({
        color: 0x0000ff,
    });
  
  var i = 0;
  var player = world.player.getPosition();
  eachWall(function (wall) {
    if (!hidden[i]) {
      var geom = new THREE.Geometry();
      hidden[i] = new THREE.Line(geom, mat);
      scene.add(hidden[i]);
    }
    var geometry = hidden[i].geometry;    
    var length = 2000;
    var end1 = new THREE.Vector2().sub(wall.point1, player).normalize().multiplyScalar(length).addSelf(wall.point1);
    var end2 = new THREE.Vector2().sub(wall.point2, player).normalize().multiplyScalar(length).addSelf(wall.point2);
    geometry.vertices[0] = new THREE.Vector3(wall.point1.x, wall.point1.y, 0);
    geometry.vertices[1] = new THREE.Vector3(end1.x, end1.y, 0);
    geometry.verticesNeedUpdate = true;
    i++;
  });
};


console.log(getVisibleFloor());

// draw!

var up = false, down = false, left = false, right = false;  

setInterval(function() {
  initViewport();
  var movement = 3;
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
}, 20);
            
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



})();



























(function() {

  if (threeD) return;
  
var width = 500;
var height = 500;

var canvas = document.querySelector('#viewport');
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext('2d');


var world = {
    walls: [
      {
        points : [
          {x: 100, y: 100},
          {x: 250, y: 100},
          {x: 300, y: 270},
          {x: 200, y: 300},
          {x: 200, y: 400}
        ]
      },
      {
        points : [
          {x: 400, y: 150},
          {x: 600, y: 100},
          {x: 630, y: 270},
          {x: 500, y: 450},
          {x: 450, y: 400}
        ]
      }
    ],
    player: {
      position: {x: width / 2, y: height / 2}
    }
  };


var renderWalls = function () {
  for (var i = 0; i < world.walls.length; i++) {
    var wall = world.walls[i];
    ctx.strokeStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(wall.points[0].x, wall.points[0].y);
    for (var j = 1; j < wall.points.length; j++) {
      ctx.lineTo(wall.points[j].x, wall.points[j].y);
    }
    ctx.lineTo(wall.points[0].x, wall.points[0].y);
    ctx.stroke();
  }
};

var renderPlayer = function() {
  ctx.fillStyle = '#0000FF';
  ctx.fillRect(world.player.position.x - 5, world.player.position.y - 5, 10, 10);
};

var eachWallCollect = function(fn) {
  var result = [];
  for (var i = 0; i < world.walls.length; i++) {
    var wallPoly = world.walls[i];
    for (var j = 0; j < wallPoly.points.length ; j++) {
      var wall = {
        point1: wallPoly.points[j],
        point2: wallPoly.points[(j + 1) % wallPoly.points.length]
      };
      result.push(fn(wall));
    }
  }
  return result;
};

var getSideIntersection = function(point) {
  if (world.player.position.x === point.x && world.player.position.y === point.y) {
    return undefined;
  } else if (world.player.position.x === point.x) {
    // vertical
    var side = world.player.position.y < point.y ? 'bottom' : 'top';
    return {
        intersection: {
          x: point.x,
          y: side === 'top' ? 0 : height
        },
        side: side
      };
  } else if (world.player.position.y === point.y) {
    // horizontal
    var side = world.player.position.x < point.x ? 'right' : 'left';
    return {
        intersection: {
          x: side === 'left' ? 0 : width,
          y: point.y
        },
        side: side
      };
  } else {
    // sloped
    var m = (world.player.position.y - point.y)/(world.player.position.x - point.x);
    
    var fx = function(x) {
      return m * (x - point.x) + point.y;
    };    
    var side = world.player.position.x < point.x ? 'right' : 'left';    
    var sideX = side === 'left' ? 0 : width;
    var intersection = {x: sideX, y: fx(sideX)};
    
    if (intersection.y < 0 || intersection.y > height) {  
      var fy = function(y) {
        return (y - point.y) / m + point.x;
      };
      side = world.player.position.y < point.y ? 'bottom' :'top';
      var sideY = side === 'top' ? 0 : height;
      intersection = {x: fy(sideY), y: sideY};
    }
    
    return {
        intersection: intersection,
        side: side
      };
  }
  
};

var dotProd = function(p1, p2, p3) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};


var getHiddenAreas = function() {
  return eachWallCollect(function(wall) {
    var intersect1 = getSideIntersection(wall.point1);
    var intersect2 = getSideIntersection(wall.point2);
    
    var sign = dotProd(world.player.position, intersect1.intersection, intersect2.intersection);
    var intermediate = [];
    
    switch (intersect1.side + ' ' + intersect2.side) {
      case 'top left':
      case 'left top': 
        intermediate = [{x: 0, y: 0}]; 
        break;
      case 'top right':
      case 'right top': 
        intermediate = [{x: width, y: 0}]; 
        break;
      case 'bottom left':
      case 'left bottom': 
        intermediate = [{x: 0, y: height}]; 
        break;
      case 'bottom right':
      case 'right bottom': 
        intermediate = [{x: width, y: height}]; 
        break;
      case 'top bottom':
        if (sign > 0) {
          intermediate = [{x: width, y: 0}, {x: width, y: height}];
        } else if (sign < 0) {
          intermediate = [{x: 0, y: 0}, {x: 0, y: height}];
        }
        break; 
      case 'bottom top':
        if (sign > 0) {
          intermediate = [{x: 0, y: height}, {x: 0, y: 0}];
        } else if (sign < 0) {
          intermediate = [{x: width, y: height}, {x: width, y: 0}];
        }
        break; 
      case 'left right':
        if (sign > 0) {
          intermediate = [{x: 0, y: 0}, {x: width, y: 0}];
        } else if (sign < 0) {
          intermediate = [{x: 0, y: height}, {x: width, y: height}];
        }
        break;
      case 'right left':
        if (sign > 0) {
          intermediate = [{x: width, y: height}, {x: 0, y: height}];
        } else if (sign < 0) {
          intermediate = [{x: width, y: 0}, {x: 0, y: 0}];
        }
        break;
      default:
        intermediate = [];
    }
    
    return [wall.point1, intersect1.intersection].concat(intermediate).concat([intersect2.intersection, wall.point2]);       
  });
};


var renderHidden = function() {
  var areas = getHiddenAreas();
  
  for (var i = 0; i < areas.length; i++) {
    var area = areas[i];
    var color = '#BCB'
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(area[0].x, area[0].y);
    for (var j = 1; j < area.length; j++) {
      ctx.lineTo(area[j].x, area[j].y);
    }
    ctx.lineTo(area[0].x, area[0].y);
    ctx.fill();
    ctx.stroke();
  }
};

var render = function() {
  ctx.clearRect (0, 0, width, height);
  renderHidden();
  renderWalls();
  renderPlayer();
};

var up = false, down = false, left = false, right = false;  

var moveWorld = function(H, V) {
  for (var i = 0; i < world.walls.length; i++) {
    var wall = world.walls[i];
    for (var j = 0; j < wall.points.length; j++) {
      wall.points[j].x += H;
      wall.points[j].y += V;
    }
  }
};

setInterval(function() {
  var movement = 1;
  if (up) {
    moveWorld(0, 1);        
  }
  if (down) {
    moveWorld(0, -1);        
  }
  if (left) {
    moveWorld(1, 0);
  }
  if (right) {
    moveWorld(-1, 0);       
  }
  render();     
}, 10);
            
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
            
render();
})();