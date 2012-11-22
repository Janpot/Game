var game = game || {};

// controls for a player
game.Controls = (function () {
  
  var Controls = function (world, camera) {
    
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
    this.camera = camera;
    
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
  Controls.prototype.setSize = function (width, height) {
    this.width = width;
    this.height = height;
  };
  
  // update the world state according to the controls
  Controls.prototype.update = function (delta) {
    // Update movement
    this.world.player.walkDir.copy(this.arrowDirection)
                             .normalize();
    
    // find the world coordinates
    // pickingray mutates vector so clone()
    var ray = this._projector.pickingRay(this.mousePos.clone(), this.camera);
    this.world.player.target = game.utils.intersectXYPlane(ray);   
  };
  
  return Controls;

})();