var Player = require('./Player.js');
var dynamics = require('./shared/dynamics.js');
var utils = require('./shared/utils.js');

// controls for a player
var PlayerController = module.exports = function (world, player, socket) {
  
  this.width = 0;
  this.height = 0;
  
  this.player = player;
  this.socket = socket;
  this.world = world;
  world.addPlayer(player);
  
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
  
  window.addEventListener('keyup', utils.bind(this, keyUp), false);
  window.addEventListener('keydown', utils.bind(this, keyDown), false);  
  window.addEventListener('mousemove', utils.bind(this, mouseMove), false);
  window.addEventListener('mousedown', utils.bind(this, mouseDown), false);
  window.addEventListener('mouseup', utils.bind(this, mouseUp), false);
  window.addEventListener('contextmenu', utils.bind(this, onContextMenu), false);
  this.socket.on('connect', utils.bind(this, this.onConnect));
  
};

// Set the proper size of this object to calculate the mouseposition
PlayerController.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
};

// update the world state according to the controls
PlayerController.prototype.update = function (delta) {
  // update position
  distance = this.player.speed * delta;
  var track = new THREE.Vector2().copy(this.arrowDirection)
                                 .normalize()
                                 .multiplyScalar(distance);
  
  this.moveAndCollide(track);    
  
  // find the world coordinates
  // pickingray mutates vector so clone()
  var ray = this._projector.pickingRay(this.mousePos.clone(), this.world.camera);    
  var target = utils.intersectXYPlane(ray);
  this.player.lookDir.copy(target)
                     .subSelf(this.player.position)
                     .normalize(); 
  
  this.world.setViewPosition(this.player.position);
};

// Move the player along track, colide if necessary
PlayerController.prototype.moveAndCollide = function (track) {
  var altTrack = new THREE.Vector2();
  // test primary track
  var s = dynamics.collideCircleWorld(
    this.player.position, this.player.boundingRadius, 
    track, 
    this.world,
    altTrack
  );
  
  // move player
  if (s === undefined) {
    this.player.position.addSelf(track);
  } else {
    // cut player path
    this.player.position.addSelf(track.multiplyScalar(s))
      
    // player collided, test alternative track
    s = dynamics.collideCircleWorld(
      this.player.position, this.player.boundingRadius, 
      altTrack, 
      this.world
    );
    
    // move player over alternative track
    if (s === undefined) {
      this.player.position.addSelf(altTrack);
    } else {
      this.player.position.addSelf(altTrack.multiplyScalar(s))
    }
  } 
};

// let the player shoot
PlayerController.prototype.shoot = function () {
  this.world.addBullet(this.player.position.clone(), this.player.lookDir.clone());
};

PlayerController.prototype.onConnect = function() {
  // set the id of the player (in the futer this would be the username or something, it will be defined up front)
  this.player.id = this.socket.socket.sessionid;
  console.log('this is ' + this.player.id);
  this.startSendingState();
};    

// set up the loop for sending the player's state to the server
PlayerController.prototype.startSendingState = function () {
  setInterval(utils.bind(this, this.sendState), 50);
};

// Send the player's state to the server
PlayerController.prototype.sendState = function () {
  this.socket.emit('playerstate', this.player.getState());
};