var game = game || {};

game.dynamics = {
  
  // collide a point moving along a vector (track) with a line (L1, L2)
  // returns a fraction of track between [0, 1] or undefined when no collision
  collidePointLine: function (P, track, L1, L2) {
    // As per http://www.softsurfer.com/Archive/algorithm_0104/algorithm_0104B.htm
    
    var u = new THREE.Vector2().sub(L2, L1);
    var v = track;
    var w = new THREE.Vector2().sub(L1, P);
    
    var perpV = game.utils.perpendicular(v);
    var perpU = game.utils.perpendicular(u);
    var s = -perpV.dot(w) / perpV.dot(u);
    var t = perpU.dot(w) / perpU.dot(v)
    
    if (0 <= s && s <= 1 && 0 <= t && t <= 1) {
      return t;
    }
    
    return undefined;
  },
  
  // collide a circle (C1, r1) moving along a vector (track) with another circle (C2, r2)
  // returns a fraction of track between [0, 1] or undefined when no collision
  collideCircleCircle: function (C1, r1, track, C2, r2) {
    
    var distance = r1 + r2;
    var u = new THREE.Vector2().sub(C1, C2);
    
    // solve for s: ||C1 + s*track - C2|| = distance
    // solve for s: ||u + s*track|| = distance
    
    // A = u + s*track
    // A.x^2 + A.y^2 = distance^2
    // A.x = u.x + s*track.x
    // A.y = u.y + s*track.y
    // u.x^2 + 2*u.x*s*track.x + s^2*track.x^2 + u.y^2 + 2*u.y*s*track.y + s^2*track.y^2 = distance^2
    // (u.x^2 + u.y^2) + 2*(u.x*track.x + u.y*track.y)*s + (track.x^2 + track.y^2)*s^2 = distance^2
    // 
    // a = track.x^2 + track.y^2
    // b = 2*(u.x*track.x + u.y*track.y)
    // c = u.x^2 + u.y^2 - distance^2
    // for a*s*s + b*s + c = 0
    
    var a = track.x * track.x + track.y * track.y;
    var b = 2 * (u.x * track.x + u.y * track.y);
    var c = u.x * u.x + u.y * u.y - distance * distance;
    
    var d = Math.sqrt(b * b - 4 * a * c);
    
    var s1 = (-b + d) / (2 * a);
    var s2 = (-b - d) / (2 * a);    
    
    return undefined;
  }
  
};