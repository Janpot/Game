var utils = require('./utils');
var twoD = require('./twoD');

// IMPORTANT: All dynamics functions assume colliding objects are not intersecting or touching at the
//            start of their tracks. They may have unexpected behaviour when violating this contract.


// threshold for calculating alternative tracks. The cosine of the perpendicular of the alternative track 
// must deviate by more than this threshold to accept the alternative track.
var angleThreshold = Math.cos(3 * Math.PI / 8);

var dynamics = module.exports = {};
  
// collide a point moving along a vector (track) with a line (L, u)
// returns a fraction of track between [0, 1] or undefined when no collision
// sets altTrack to an alternative track if it is provided
dynamics.collidePointLine = function (P, track, L, u, altTrack) {
  // As per http://www.softsurfer.com/Archive/algorithm_0104/algorithm_0104B.htm
  
  var v = track;
  var w = new twoD.Vector().sub(L, P);
  
  var perpV = utils.perpendicular(v);
  var perpU = utils.perpendicular(u);
  var s = -perpV.dot(w) / perpV.dot(u);
  var t = perpU.dot(w) / perpU.dot(v)
  
  if (0 <= s && s <= 1 && 0 <= t && t <= 1) {      
    if (altTrack instanceof twoD.Vector) {
      // calculate alternative track
      altTrack.copy(u).normalize();
      var distance = track.length();
      var cosAlpha = altTrack.dot(track) / distance;
      if (Math.abs(cosAlpha) > angleThreshold) {
        altTrack.multiplyScalar((cosAlpha > 0 ? 1 : -1) * distance * (1 - t));
      } else {
        altTrack.set(0, 0);
      }
    }
    
    return t;
  }
  
  return undefined;
};

// collide a point moving along a vector (track) with the walls of a world
// returns a fraction of track between [0, 1] or undefined when no collision
dynamics.collidePointWalls = function (P, track, world) {
  
  var s = undefined;
  
  // calculate bounding box for the moving player
  var movementBounds = new twoD.Rectangle();
  movementBounds.addPoint(P.x, P.y);
  movementBounds.addPoint(P.x + track.x, P.y + track.y);
  
  // bounding box for objects to collide with
  var objectBounds = new twoD.Rectangle();
  
  // collide with walls
  for (var i = 0; i < world.walls.length; i++) {      
    var wall = world.walls[i];    
    
    // quickly test bounding boxes to avoid extra calculations
    if (!wall.bounds.intersects(movementBounds)) {
      // early out
      continue;
    }
      
         
    var objCount = wall.corners.length;
    for (var j = 0; j < objCount; j++) {
      // current wall: (p1, p2)
      var p1 = wall.corners[j];
      var p2 = wall.corners[(j + 1) % objCount];
      
      // quickly test bounding boxes to avoid extra calculations
      objectBounds.empty();
      objectBounds.addPoint(p1.x, p1.y);
      objectBounds.addPoint(p2.x, p2.y);        
      if (!objectBounds.intersects(movementBounds)) {
        // early out
        continue;
      }
      
      // calculate the collision
      var wallVector = new twoD.Vector().sub(p2, p1);
      var sWall = dynamics.collidePointLine(P, track, p1, wallVector);
      
      if (sWall !== undefined) {
        // We have a collision
        
        if (s === undefined || sWall < s) {
          // Collision is closer on the track than previous collisions          
          s = sWall;
        }
      }
    }
  }
  
  return s;
};

// collide a circle (C1, r1) moving along a vector (track) with another circle (C2, r2)
// returns a fraction of track between [0, 1] or undefined when no collision
// sets altTrack to an alternative track if it is provided
dynamics.collidePointCircle = function (P, track, C, r, altTrack) {
  
  var u = new twoD.Vector().sub(P, C);
  
  // solve for s: ||P + s*track - C|| = r
  // solve for s: ||u + s*track|| = r
  
  // A = u + s*track
  // A.x^2 + A.y^2 = r^2
  // A.x = u.x + s*track.x
  // A.y = u.y + s*track.y
  // u.x^2 + 2*u.x*s*track.x + s^2*track.x^2 + u.y^2 + 2*u.y*s*track.y + s^2*track.y^2 = r^2
  // (u.x^2 + u.y^2) + 2*(u.x*track.x + u.y*track.y)*s + (track.x^2 + track.y^2)*s^2 = r^2
  // 
  // a = track.x^2 + track.y^2
  // b = 2*(u.x*track.x + u.y*track.y)
  // c = u.x^2 + u.y^2 - r^2
  // for a*s*s + b*s + c = 0
  
  var a = track.x * track.x + track.y * track.y;
  var b = 2 * (u.x * track.x + u.y * track.y);
  var c = u.x * u.x + u.y * u.y - r * r;
  
  var d = Math.sqrt(b * b - 4 * a * c);
  if (d >= 0) {
    var s1 = (-b + d) / (2 * a);
    var s2 = (-b - d) / (2 * a);
    
    var s = Math.min(s1, s2);
    if (0 <= s && s <= 1) {
      if (altTrack instanceof twoD.Vector) {
        // calculate the vector between the center of the circle and the collision
        var collisionVector = C.clone().subSelf(P).addSelf(track.clone().multiplyScalar(s));
        // new direction is perpendicular to that
        altTrack.copy(utils.perpendicular(collisionVector)).normalize();
        var distance = track.length();
        // calculate direction
        var cosAlpha = altTrack.dot(track) / distance;
        altTrack.multiplyScalar((cosAlpha > 0 ? 1 : -1) * distance * (1 - s));
      }
      return s;
    }
  }
  
  return undefined;
};

// collide a circle (C1, r1) moving along a vector (track) with another circle (C2, r2)
// returns a fraction of track between [0, 1] or undefined when no collision
// sets altTrack to an alternative track if it is provided
dynamics.collideCircleCircle = function (C1, r1, track, C2, r2, altTrack) {
  return dynamics.collidePointCircle(C1, track, C2, r1 + r2, altTrack);
};

// collide a circle (C, r) moving along a vector (track) with a Segment of a polygon (L, u)
// this function is used in detecting collisions with a side of a polygon so only one 
// endpoint off the line is collided
// returns a fraction of track between [0, 1] or undefined when no collision
// sets altTrack to an alternative track if it is provided
dynamics.collideCirclePolySegment = function (C, r, track, L, u, altTrack) {      
  // Offset the line with the radius
  var w = new twoD.Vector().sub(C, L);
  var sign = utils.angleSignBetween(u, w);
  var offsetVector = utils.perpendicular(u).normalize().multiplyScalar(sign * r);
  var offsetL = new twoD.Vector().add(L, offsetVector);
  
  // collide with the line      
  var s = dynamics.collidePointLine(C, track, offsetL, u, altTrack);
  if (s !== undefined) {
    return s;
  }
  // collide with the endpoint
  return dynamics.collidePointCircle(C, track, L, r, altTrack);
};

// collide a circle (C, r) moving along a vector (track) with a World
// returns a fraction of track between [0, 1] or undefined when no collision
// sets altTrack to an alternative track if it is provided
dynamics.collideCircleWorld = function (C, r, track, world, altTrack) {      
  
  // threshold for movement to avoid getting stuck in the wall (between [0, 1])
  var threshold = 0.01;
  
  // temporary alternative track for intermediate calculations
  // don't use it if altTrack is not defined
  var tmpAltTrack = undefined;
  if (altTrack !== undefined) {
    tmpAltTrack = new twoD.Vector();
  }
  
  // fraction of distance to travel
  var s = undefined;
  
  // calculate bounding box for the moving player
  var movementBounds = new twoD.Rectangle();
  movementBounds.addPoint(C.x, C.y);
  movementBounds.addPoint(C.x + track.x, C.y + track.y);
  movementBounds.inflate(r);
  
  // bounding box for objects to collide with
  var objectBounds = new twoD.Rectangle();
  
  // collide with walls
  for (var i = 0; i < world.walls.length; i++) {      
    var wall = world.walls[i];    
    
    // quickly test bounding boxes to avoid extra calculations
    if (!wall.bounds.intersects(movementBounds)) {
      // early out
      continue;
    }
      
         
    var objCount = wall.corners.length;
    for (var j = 0; j < objCount; j++) {
      // current wall: (p1, p2)
      var p1 = wall.corners[j];
      var p2 = wall.corners[(j + 1) % objCount];
      
      // quickly test bounding boxes to avoid extra calculations
      objectBounds.empty();
      objectBounds.addPoint(p1.x, p1.y);
      objectBounds.addPoint(p2.x, p2.y);        
      if (!objectBounds.intersects(movementBounds)) {
        // early out
        continue;
      }
      
      // calculate the collision
      var wallVector = new twoD.Vector().sub(p2, p1);
      var sWall = dynamics.collideCirclePolySegment(
        C, 
        r, 
        track, p1, wallVector, tmpAltTrack);
      
      if (sWall !== undefined) {
        // We have a collision
        
        // apply threshold
        sWall = Math.max(sWall - threshold, 0);
        
        if (s === undefined || sWall < s) {
          // Collision is closer on the track than previous collisions          
          s = sWall;
          if (altTrack !== undefined) {
            altTrack.copy(tmpAltTrack);
          }
        }
      }
    }
  }
  
  // collide with other players
  for (var i = 0; i < world.players.length; i++) {
    var enemy = world.players[i];
    
    if (enemy === this.player) {
      // don't collide with self
      continue;
    }
    
    objectBounds.empty();
    objectBounds.addPoint(enemy.position.x - enemy.boundingRadius, enemy.position.y - enemy.boundingRadius);
    objectBounds.addPoint(enemy.position.x + enemy.boundingRadius, enemy.position.y + enemy.boundingRadius);
    
    // quickly test bounding boxes to avoid extra calculations
    if (!objectBounds.intersects(movementBounds)) {
      // early out
      continue;
    }
    
    var sEnemy = dynamics.collideCircleCircle(
      C, r, 
      track, 
      enemy.position, enemy.boundingRadius, 
      tmpAltTrack);
    
    if (sEnemy !== undefined) {
      // We have a collision
      
      // apply threshold
      sEnemy = Math.max(sEnemy - threshold, 0);
      
      if (s === undefined || sEnemy < s) {
        // Collision is closer on the track than previous collisions          
        s = sEnemy;
        if (altTrack !== undefined) {
          altTrack.copy(tmpAltTrack);
        }
      }
    }
  }
  
  return s;
}
  
