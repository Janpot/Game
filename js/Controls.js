// controls for a player
var Controls = function (player, domElement) {
  
  // affected player
  this.player = player;
  
  // movement
  this.up = false;
  this.down = false;
  this.left = false;
  this.right = false;
  
  var keyDown = function (e) {    
    var code = e.keyCode ? e.keyCode : e.which;
    if (code === 38) {
      this.up = true;
    }
    if (code === 40) {
      this.down = true;
    }
    if (code === 37) {
      this.left = true;
    }
    if (code === 39) {
      this.right = true;
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
  
  var bind = function (scope, fn) {
    return function () {
      fn.apply(scope, arguments)
    }
  }
      
  domElement.addEventListener('keyup', bind(this, keyUp), false);
  domElement.addEventListener('keydown', bind(this, keyDown), false);
    
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
  this.player.walkDir.set(x, y).normalize();
}