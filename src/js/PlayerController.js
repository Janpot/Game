var game = game || {};

// controls for a player
game.PlayerController = (function () {
  
  var PlayerController = function (world) {
    
    this.width = 0;
    this.height = 0;
    
    this.world = world;
    
    // movement
    this.upPressed = false;
    this.downPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;
    this.arrowDirection = new THREE.Vector2(0, 0);
    this.mousePos = new THREE.Vector2(1, 0);
    this.leftMouseBtn = false;
    this.rightMouseBtn = false;
    
    this._projector = new THREE.Projector();
    
    var keyDown = function (e) {
      var code = e.keyCode !== undefined ? e.keyCode : e.which;
      switch (code) {
        case 38: // up
        case 87: // W
          this.upPressed = true;
          this.arrowDirection.y = 1;
          break;
        case 40: // down
        case 83: // S
          this.downPressed = true;
          this.arrowDirection.y = -1;
          break;
        case 37: // left
        case 65: // A
          this.leftPressed = true;
          this.arrowDirection.x = -1;
          break;
        case 39: // right
        case 68: // D
          this.rightPressed = true;        
          this.arrowDirection.x = 1;
          break;        
      }
    };
    
    var keyUp = function (e) {    
      var code = e.keyCode ? e.keyCode : e.which;
      switch (code) {
        case 38: // up
        case 87: // W
          this.upPressed = false;
          this.arrowDirection.y = this.downPressed ? -1 : 0;
          break;
        case 40: // down
        case 83: // S
          this.downPressed = false;        
          this.arrowDirection.y = this.upPressed ? 1 : 0;
          break;
        case 37: // left
        case 65: // A
          this.leftPressed = false;
          this.arrowDirection.x = this.rightPressed ? 1 : 0;
          break;
        case 39: // right
        case 68: // D
          this.rightPressed = false;
          this.arrowDirection.x = this.leftPressed ? -1 : 0;
          break;        
      }
    };
    
    
    var mouseMove = function (e) {
      // convert mouse coordinates to [-1, 1] range
      this.mousePos.set(
        (2 * e.clientX - this.width) / this.width,
        (this.height - 2 * e.clientY) / this.height
      );    
    };
    
    var mouseDown = function (e) {
      switch (e.button) {
        case 0: // left
          this.leftMouseBtn = true;
          this.shoot();
          break;
        case 2: // right
          this.rightMouseBtn = true;
          break;
      }
    };
    
    var mouseUp = function (e) {
      switch (e.button) {
        case 0: // left
          this.leftMouseBtn = false;
          break;
        case 2: // right
          this.rightMouseBtn = false;
          break;
      }
    };
    
    // suppress the contextmenu
    var onContextMenu = function (e) {
      e.preventDefault();
    };
    
    var bind = function (scope, fn) {
      return function () {
        fn.apply(scope, arguments)
      };
    };
        
    window.addEventListener('keyup', bind(this, keyUp), false);
    window.addEventListener('keydown', bind(this, keyDown), false);  
    window.addEventListener('mousemove', bind(this, mouseMove), false);
    window.addEventListener('mousedown', bind(this, mouseDown), false);
    window.addEventListener('mouseup', bind(this, mouseUp), false);
    window.addEventListener('contextmenu', bind(this, onContextMenu), false);
  };
  
  // Set the proper size of this object to calculate the mouseposition
  PlayerController.prototype.setSize = function (width, height) {
    this.width = width;
    this.height = height;
  };
  
  // update the world state according to the controls
  PlayerController.prototype.update = function (delta) {
    var player = this.world.player;  
    
    // update position
    distance = player.speed * delta;
    var track = new THREE.Vector2().copy(this.arrowDirection)
                                   .normalize()
                                   .multiplyScalar(distance);
    var altTrack = this.moveAndCollide(track);
    this.moveAndCollide(altTrack); 
    
    
    // find the world coordinates
    // pickingray mutates vector so clone()
    var ray = this._projector.pickingRay(this.mousePos.clone(), this.world.camera);    
    var target = game.utils.intersectXYPlane(ray);
    player.lookDir.copy(target)
                  .subSelf(this.world.player.position)
                  .normalize(); 
  };
  
  // try to move the player along track
  // returns an alternative track
  PlayerController.prototype.moveAndCollide = function (track) {
    
    var player = this.world.player;
    
    // threshold for movement to avoid getting stuck in the wall (between [0, 1])
    var threshold = 0.01;
    
    // alternative track for the player
    var altTrack = new THREE.Vector2(0, 0);
    
    // temporary alternative track for intermediate calculations
    var tmpAltTrack = new THREE.Vector2(0, 0);
    
    // fraction of distance to travel
    var s = 1;
    
    // calculate bounding box for the moving player
    var movementBounds = new THREE.Rectangle();
    movementBounds.addPoint(player.position.x, player.position.y);
    movementBounds.addPoint(player.position.x + track.x, player.position.y + track.y);
    movementBounds.inflate(player.boundingRadius);
    
    // bounding box for objects to collide with
    var objectBounds = new THREE.Rectangle();
    
    // collide with walls
    for (var i = 0; i < this.world.walls.length; i++) {      
      var wall = this.world.walls[i];    
      
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
        var wallVector = new THREE.Vector2().sub(p2, p1);
        var sWall = game.dynamics.collideCirclePolySegment(
          player.position, 
          player.boundingRadius, 
          track, p1, wallVector, tmpAltTrack);
        
        if (sWall !== undefined) {
          // We have a collision
          
          // apply threshold
          sWall = Math.max(sWall - threshold, 0);
          
          if (sWall < s) {
            // Collision is closer on the track than previous collisions          
            s = sWall;
            altTrack.copy(tmpAltTrack);
          }
        }
      }
    }
    
    // collide with enemies
    for (var i = 0; i < this.world.enemies.length; i++) {
      var enemy = this.world.enemies[i];
      
      objectBounds.empty();
      objectBounds.addPoint(enemy.position.x - enemy.boundingRadius, enemy.position.y - enemy.boundingRadius);
      objectBounds.addPoint(enemy.position.x + enemy.boundingRadius, enemy.position.y + enemy.boundingRadius);
      
      // quickly test bounding boxes to avoid extra calculations
      if (!objectBounds.intersects(movementBounds)) {
        // early out
        continue;
      }
      
      var sEnemy = game.dynamics.collideCircleCircle(player.position, player.boundingRadius, track, enemy.position, enemy.boundingRadius, tmpAltTrack);
      if (sEnemy !== undefined) {
        // We have a collision
        
        // apply threshold
        sEnemy = Math.max(sEnemy - threshold, 0);
        
        if (sEnemy < s) {
          // Collision is closer on the track than previous collisions          
          s = sEnemy;
          altTrack.copy(tmpAltTrack);
        }
      }
    }
    
    // move the player
    player.position.addSelf(track.multiplyScalar(s));
    
    return altTrack;
  };
  
  
  // let the player shoot
  PlayerController.prototype.shoot = function () {
    var player = world.player;
    this.world.addBullet(player.position.clone(), player.lookDir.clone());
  }
  
  return PlayerController;

})();