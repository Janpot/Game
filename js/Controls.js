// controls for a player
var Controls = function (world, camera) {
  
  this.width = 0;
  this.height = 0;
  
  // affected player
  this.world = world;
  
  // movement
  this.up = false;
  this.down = false;
  this.left = false;
  this.right = false;
  this.worldMousePos = new THREE.Vector2(0, 0);
  
  var keyDown = function (e) {    
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 38) {
      this.up = true;
      this.down = false;
    }
    if (code === 40) {
      this.down = true;
      this.up = false;
    }
    if (code === 37) {
      this.left = true;
      this.right = false;
    }
    if (code === 39) {
      this.right = true;
      this.left = false;
    }
  };
  
  var keyUp = function (e) {    
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 38) {
      this.up = false;
    }
    if (code === 40) {
      this.down = false;
    }
    if (code === 37) {
      this.left = false;
    }
    if (code === 39) {
      this.right = false;
    }
  };
  
  var p = new THREE.Projector();
  var screenCoor = new THREE.Vector2(0, 0);  
  var mouseMove = function (e) {
    screenCoor.set(
      (2 * e.clientX - this.width) / this.width,
      (this.height - 2 * e.clientY) / this.height
    );
    var ray = p.pickingRay(screenCoor, camera);
    this.worldMousePos = Utils.intersectXYPlane(ray);    
  };
  
  var bind = function (scope, fn) {
    return function () {
      fn.apply(scope, arguments)
    }
  }
      
  window.addEventListener('keyup', bind(this, keyUp), false);
  window.addEventListener('keydown', bind(this, keyDown), false);  
  window.addEventListener('mousemove', bind(this, mouseMove), false);
};

// Set the proper size of this object to calculate the mouseposition
Controls.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
};

// update the player state according to the controls
Controls.prototype.update = function (delta) {
  var x = 0;
  var y = 0;
  if (this.up) {
    y += 1;
  }    
  if (this.down) {
    y -= 1;
  }
  if (this.left) {
    x -= 1;
  }
  if (this.right) {  
    x += 1;
  }
  this.world.player.walkDir.set(x, y)
                           .normalize();
  
  this.world.player.lookDir.copy(this.worldMousePos)
                           .subSelf(this.world.player.position)
                           .normalize();
}