// controls for a player
var Controls = function (player, domElement) {
  
  this.up = false;
  this.down = false;
  this.left = false;
  this.right = false;
  this.player = player;
  
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
    
Controls.prototype.update = function (delta) {
  var movement = this.player.getSpeed();
  if (this.up) {
    this.player.move(0, movement);
  }    
  if (this.down) {
    this.player.move(0, -movement);        
  }
  if (this.left) {
    this.player.move(-movement, 0);
  }
  if (this.right) {
    this.player.move(movement, 0);       
  }
  
}