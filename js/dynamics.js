var game = game || {};

game.dynamics = {
  
  // collide a point moving along a vector (track) with a line (L1, L2)
  // returns a fraction of track between [0, 1] or undefined when no collision
  collidePointLine: function (P, track, L1, L2) {
    var u = new THREE.Vector2().sub(L2, L1);
    var v = track;
    var w = new THREE.Vector2().sub(L1, P);
        
    var s = (u.x * w.y - u.y * w.x) / (u.x * v.y - u.y * v.x);
    var t = (v.y * w.x - v.x * w.y) / (v.x * u.y - v.y * u.x);
    if (0 <= s && s <= 1 && 0 <= t && t <= 1) {
      return s;
    }
    
    return undefined;
  }  
  
};