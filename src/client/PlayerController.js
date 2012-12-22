var utils = require('../shared/utils.js');
var twoD = require('../shared/twoD');

// controls for a player
var PlayerController = module.exports = function (world, player, socket) {
  
  this.width = 0;
  this.height = 0;
  
  this.player = player;
  this.socket = socket;
  this.world = world;
  this.world.addPlayer(player);
  
  // movement
  this.upPressed = false;
  this.downPressed = false;
  this.leftPressed = false;
  this.rightPressed = false;
  this.arrowDirection = new twoD.Vector(0, 0);
  this.mousePos = new twoD.Vector(1, 0);
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
  
  // Reset when the window loses focus
  var blur = function (e) {
    this.upPressed = false;
    this.downPressed = false;        
    this.leftPressed = false;
    this.rightPressed = false;
    this.arrowDirection.set(0, 0);
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
  
  window.addEventListener('keyup', utils.bind(this, keyUp), false);
  window.addEventListener('keydown', utils.bind(this, keyDown), false);
  window.addEventListener('blur', utils.bind(this, blur), false);
  window.addEventListener('mousemove', utils.bind(this, mouseMove), false);
  window.addEventListener('mousedown', utils.bind(this, mouseDown), false);
  window.addEventListener('mouseup', utils.bind(this, mouseUp), false);
  window.addEventListener('contextmenu', utils.bind(this, onContextMenu), false);
  
  console.log('this is ' + this.player.id);
  this.startSendingState();
};

// Set the proper size of this object to calculate the mouseposition
PlayerController.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
};

// update the world state according to the controls
PlayerController.prototype.update = function (delta) {
  // update position
  this.player.walkDir.copy(this.arrowDirection);
  this.player.updatePosition(delta);    
  
  // find the world coordinates
  // pickingray mutates vector so clone()
  var ray = this._projector.pickingRay(this.mousePos.clone(), this.world.camera);    
  var target = utils.intersectXYPlane(ray);
  this.player.lookDir.copy(target)
                     .subSelf(this.player.position)
                     .normalize(); 
  
  this.world.setViewPosition(this.player.position);
};

// let the player shoot
PlayerController.prototype.shoot = function () {
  this.world.addBullet(this.player.position.clone(), this.player.lookDir.clone());
};
   

// set up the loop for sending the player's state to the server
PlayerController.prototype.startSendingState = function () {
  setInterval(utils.bind(this, this.sendState), 50);
};

// Send the player's state to the server
PlayerController.prototype.sendState = function () {
  this.socket.emit('playerstate', this.player.serializeState());
};