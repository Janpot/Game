var game = game || {};

// describes a player in the field
game.Player = (function() {
  var Player = function (cfg) {
    // List of object where player can collide with
    this.collidableObjs = [];
    this.collidableObjs2 = [];
    
    // Player speed
    this.speed = 10; // m/s
    
    // Current position
    this.position = cfg.position || new THREE.Vector2(0, 0);
    
    // Direction the player is moving to (normalized)
    this.walkDir = new THREE.Vector2(0, 0);
    
    // Direction the player is looking at (normalized)
    this.lookDir = new THREE.Vector2(0, 0);
    
    // Point the player is looking at
    this.target = new THREE.Vector2(0, 0);
    
    // radius for a bounding circle for collision detection
    this.boundingRadius = 1;
    
    // bounding box for the player
    this.bounds = new THREE.Rectangle();
    
    
    if (cfg.color === undefined) {
      cfg.color = 0xCC0000;
    }
    var material = new THREE.MeshPhongMaterial({ color: cfg.color });
    var shape = new THREE.Shape();
    shape.fromPoints([
      new THREE.Vector3(1, 0, 0), 
      new THREE.Vector3(-0.5, -0.5, 0),
      new THREE.Vector3(-0.5, 0.5, 0)
    ]);  
    this.mesh = new THREE.Mesh(shape.extrude({amount: 1, bevelEnabled: false}), material);
    
    this.mesh.position.set(this.position.x, this.position.y, 0.5);
    
  };
  
  // Update player state with a timeframe of delta
  Player.prototype.update = function(delta) {
    this.updatePosition(delta);
    this.mesh.position.set(this.position.x, this.position.y, 0.5); 
    
    this.lookDir.copy(this.target)
                .subSelf(this.position)
                .normalize();
    
    var angle = game.utils.angleBetweenVector2(new THREE.Vector2(1, 0), this.lookDir);  
    
    this.mesh.position.set(this.position.x, this.position.y, 0.5);
    this.mesh.rotation.set(0, 0, angle);  
  };
  
  // Update player position with a timeframe of delta
  Player.prototype.updatePosition = function (delta) {
    distance = this.speed * delta;
    var track = this.walkDir.clone().multiplyScalar(distance);
    var altTrack = this.moveAndCollide(track);
    this.moveAndCollide(altTrack);    
  };
  
  // try to move the player along track
  // returns an alternative
  Player.prototype.moveAndCollide = function (track) {
    // TODO(Jan): take bounding circle into account
    
    // threshold for movement to avoid getting stuck in the wall (between [0, 1])
    var threshold = 0.01;
    
    var altTrack = new THREE.Vector2(0, 0);
    
    // fraction of distance to travel
    var s = 1;
    
    // calculate bounding box for the moving player
    var movementBounds = new THREE.Rectangle();
    movementBounds.addPoint(this.position.x, this.position.y);
    movementBounds.addPoint(this.position.x + track.x, this.position.y + track.y);
    movementBounds.inflate(this.boundingRadius);
    
    for (var i = 0; i < this.collidableObjs.length; i++) {      
      var wall = this.collidableObjs[i];    
      
      // quickly test bounding boxes to avoid extra calculations
      if (!wall.bounds.intersects(movementBounds)) {
        // early out
        continue;
      }
      
      var wallPieceBounds = new THREE.Rectangle();    
           
      var objCount = wall.corners.length;
      for (var j = 0; j < objCount; j++) {
        // current wall: (p1, p2)
        var p1 = wall.corners[j];
        var p2 = wall.corners[(j + 1) % objCount];
        
        // quickly test bounding boxes to avoid extra calculations
        wallPieceBounds.empty();
        wallPieceBounds.addPoint(p1.x, p1.y);
        wallPieceBounds.addPoint(p2.x, p2.y);        
        if (!wallPieceBounds.intersects(movementBounds)) {
          // early out
          continue;
        }
        
        // calculate the collision
        var sWall = game.dynamics.collidePointLine(this.position, track, p1, p2);        
        
        if (sWall !== undefined) {
          // We have a collision
          
          // apply threshold
          sWall = Math.min(sWall - threshold, 0);
          
          if (sWall < s) {
            // Collision is closer on the track than previous collisions
          
            s = sWall;
            
            // calculate the alternative track
            altTrack.sub(p2, p1);
            var altSlope = Math.abs(altTrack.y / altTrack.x);
            if (altSlope > 1) {
              // vertical
              altTrack.multiplyScalar(track.y * altTrack.y);
            } else if (altSlope < 1) {
              // horizontal
              altTrack.multiplyScalar(track.x * altTrack.x);
            } else if (altSlope === 1) {
              // 45 degrees
              altTrack.multiplyScalar(altTrack.dot(track));
            }
            altTrack.normalize().multiplyScalar(track.length() * (1 - s));
          }
        }
      }
    }
    
    // move the player
    this.position.addSelf(track.multiplyScalar(s));
    
    return altTrack;
  };
  
  Player.prototype.pushCollidable = function(wall) {
    this.collidableObjs.push(wall);
  };
  
  Player.prototype.updateBounds = function () {
    this.bounds.empty();
    this.bounds.addPoint(this.position.x - this.boundingRadius, this.position.y - this.boundingRadius);  
    this.bounds.addPoint(this.position.x + this.boundingRadius, this.position.y + this.boundingRadius);
  };
  
  return Player;
  
})();