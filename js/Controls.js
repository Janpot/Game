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
  this.leftMouseBtn = false;
  this.rightMouseBtn = false;
  
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
  
  var projector = new THREE.Projector();
  var screenCoor = new THREE.Vector2(0, 0);  
  var mouseMove = function (e) {
    // convert mouse coordinates to [-1, 1] range
    screenCoor.set(
      (2 * e.clientX - this.width) / this.width,
      (this.height - 2 * e.clientY) / this.height
    );
    // find the world coordinates
    var ray = projector.pickingRay(screenCoor, camera);
    this.worldMousePos = Utils.intersectXYPlane(ray);    
  };
  
  var mouseDown = function (e) {
    if (e.button === 0) {
      //left
      this.leftMouseBtn = true;
    }
    if (e.button === 2) {
      //right
      this.rightMouseBtn = true;
    }
  };
  
  var mouseUp = function (e) {
    if (e.button === 0) {
      //left
      this.leftMouseBtn = false;
    }
    if (e.button === 2) {
      //right
      this.rightMouseBtn = false;
    }
  };
  
  var onContextMenu = function (e) {
    e.preventDefault();
  };
  
  var bind = function (scope, fn) {
    return function () {
      fn.apply(scope, arguments)
    }
  }
      
  window.addEventListener('keyup', bind(this, keyUp), false);
  window.addEventListener('keydown', bind(this, keyDown), false);  
  window.addEventListener('mousemove', bind(this, mouseMove), false);
  window.addEventListener('mousedown', bind(this, mouseDown), false);
  window.addEventListener('mouseup', bind(this, mouseUp), false);
  window.addEventListener('contextmenu', bind(this, onContextMenu), false);
};

// Set the proper size of this object to calculate the mouseposition
Controls.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
};

// update the world state according to the controls
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
  
  this.world.player.target.copy(this.worldMousePos);
  
}