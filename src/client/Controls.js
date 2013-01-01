var utils = require('../shared/utils');
var twoD = require('../shared/twoD');


// controls for a player
var Controls;
module.exports = Controls = function (game) {
  
  this.width = 0;
  this.height = 0;
  
  // movement
  this.upPressed = false;
  this.downPressed = false;
  this.leftPressed = false;
  this.rightPressed = false;
  this.arrowDirection = new twoD.Vector(0, 0);
  this.mousePos = new THREE.Vector3(1, 0, 0);
  this.leftMouseBtn = false;
  this.rightMouseBtn = false;
  
  this.camera = game.camera;
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
      (this.height - 2 * e.clientY) / this.height, 
      0
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
  
  game.domElement.addEventListener('keyup', utils.bind(this, keyUp), false);
  game.domElement.addEventListener('keydown', utils.bind(this, keyDown), false);
  game.domElement.addEventListener('blur', utils.bind(this, blur), false);
  game.domElement.addEventListener('mousemove', utils.bind(this, mouseMove), false);
  game.domElement.addEventListener('mousedown', utils.bind(this, mouseDown), false);
  game.domElement.addEventListener('mouseup', utils.bind(this, mouseUp), false);
  game.domElement.addEventListener('contextmenu', utils.bind(this, onContextMenu), false);
};

// Set the proper size of this object to calculate the mouseposition
Controls.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
};

// return the current input
Controls.prototype.getInput = function () {
  var raycaster = this._projector.pickingRay(this.mousePos.clone(), this.camera);
  var target = utils.intersectXYPlane(raycaster.ray);
  
  return {
    arrows: {
      x: this.arrowDirection.x,
      y: this.arrowDirection.y
    },
    mouse: {
      x: target.x,
      y: target.y
    },
    leftMouse: this.leftMouseBtn
  };
};