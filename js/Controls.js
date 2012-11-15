// controls for a player
var Controls = function (world, camera) {
  
  this.width = 0;
  this.height = 0;
  
  // affected player
  this.world = world;
  
  // movement
  this.upPressed = false;
  this.downPressed = false;
  this.leftPressed = false;
  this.rightPressed = false;
  this.up = false;
  this.down = false;
  this.left = false;
  this.right = false;
  this.mousePos = new THREE.Vector2(0, 0);
  this.leftMouseBtn = false;
  this.rightMouseBtn = false;
  
  this._projector = new THREE.Projector();
  this.camera = camera;
  
  var keyDown = function (e) {    
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 38) {
      this.upPressed = true;
      this.up = true;
      this.down = false;
    }
    if (code === 40) {
      this.downPressed = true;
      this.down = true;
      this.up = false;
    }
    if (code === 37) {
      this.leftPressed = true;
      this.left = true;
      this.right = false;
    }
    if (code === 39) {
      this.rightPressed = true;
      this.right = true;
      this.left = false;
    }
  };
  
  var keyUp = function (e) {    
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 38) {
      this.upPressed = false;
      this.up = false;
      this.down = this.downPressed;
    }
    if (code === 40) {
      this.downPressed = false;
      this.down = false;
      this.up = this.upPressed;
    }
    if (code === 37) {
      this.leftPressed = false;
      this.left = false;
      this.right = this.rightPressed
    }
    if (code === 39) {
      this.rightPressed = false;
      this.right = false;
      this.left = this.leftPressed;
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
  
  // suppress the contextmenu
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
  
  // find the world coordinates
  // pickingray mutates vector so clone()
  var ray = this._projector.pickingRay(this.mousePos.clone(), this.camera);
  this.world.player.target = Utils.intersectXYPlane(ray); 
  
}