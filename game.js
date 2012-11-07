/*jslint vars: true, browser: true, devel: true, indent: 2 */


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