var game = game || {};

game.dynamics = (function () {
  // IMPORTANT: All dynamics functions assume colliding objects are not intersecting or touching at the
  //            start of their tracks. They may have unexpected behaviour when violating this contract.
  
  
  
  // threshold for calculating alternative tracks. The cosine of the perpendicular of the alternative track 
  // must deviate by more than this threshold to accept the alternative track.
  var angleThreshold = Math.cos(3 * Math.PI / 8);
  
  return {
    
    // collide a point moving along a vector (track) with a line (L, u)
    // returns a fraction of track between [0, 1] or undefined when no collision
    // sets altTrack to an alternative track if it is provided
    collidePointLine: function (P, track, L, u, altTrack) {
      // As per http://www.softsurfer.com/Archive/algorithm_0104/algorithm_0104B.htm
      
      var v = track;
      var w = new THREE.Vector2().sub(L, P);
      
      var perpV = game.utils.perpendicular(v);
      var perpU = game.utils.perpendicular(u);
      var s = -perpV.dot(w) / perpV.dot(u);
      var t = perpU.dot(w) / perpU.dot(v)
      
      if (0 <= s && s <= 1 && 0 <= t && t <= 1) {      
        if (altTrack instanceof THREE.Vector2) {
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
    },
    
    // collide a circle (C1, r1) moving along a vector (track) with another circle (C2, r2)
    // returns a fraction of track between [0, 1] or undefined when no collision
    // sets altTrack to an alternative track if it is provided
    collidePointCircle: function (P, track, C, r, altTrack) {
      
      var u = new THREE.Vector2().sub(P, C);
      
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
          if (altTrack instanceof THREE.Vector2) {
            // calculate the vector between the center of the circle and the collision
            var collisionVector = C.clone().subSelf(P).addSelf(track.clone().multiplyScalar(s));
            // new direction is perpendicular to that
            altTrack.copy(game.utils.perpendicular(collisionVector)).normalize();
            var distance = track.length();
            // calculate direction
            var cosAlpha = altTrack.dot(track) / distance;
            altTrack.multiplyScalar((cosAlpha > 0 ? 1 : -1) * distance * (1 - s));
          }
          return s;
        }
      }
      
      return undefined;
    },
    
    // collide a circle (C1, r1) moving along a vector (track) with another circle (C2, r2)
    // returns a fraction of track between [0, 1] or undefined when no collision
    // sets altTrack to an alternative track if it is provided
    collideCircleCircle: function (C1, r1, track, C2, r2, altTrack) {
      return game.dynamics.collidePointCircle(C1, track, C2, r1 + r2, altTrack);
    },
    
    // collide a circle (C1, r1) moving along a vector (track) with a Segment of a polygon (L, u)
    // this function is used in detecting collisions with a side of a polygon so only one 
    // endpoint off the line is collided
    // returns a fraction of track between [0, 1] or undefined when no collision
    // sets altTrack to an alternative track if it is provided
    collideCirclePolySegment: function (C, r, track, L, u, altTrack) {      
      // Offset the line with the radius
      var w = new THREE.Vector2().sub(C, L);
      var sign = game.utils.angleBetweenVector2(u, w) < 0 ? 1 : -1;
      var offsetVector = game.utils.perpendicular(u).normalize().multiplyScalar(sign * r);
      var offsetL = new THREE.Vector2().sub(L, offsetVector);
      
      // collide with the line      
      var s = game.dynamics.collidePointLine(C, track, offsetL, u, altTrack);
      if (s !== undefined) {
        return s;
      }
      // collide with the endpoint
      return game.dynamics.collidePointCircle(C, track, L, r, altTrack);
    }
    
  };

})();
