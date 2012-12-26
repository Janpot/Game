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
  
  var mouseDown = function (e) {
    switch (e.button) {
      case 0: // left
        this.shoot();
        break;
    }
  };
  window.addEventListener('mousedown', utils.bind(this, mouseDown), false);
  
  console.log('this is ' + this.player.id);
  this.startSendingState();
};

// update the world state according to the controls
PlayerController.prototype.update = function (delta) {
  
  var input = this.world.controls.getInput();
  
  
  // update position
  this.player.walkDir.copy(input.arrows);
  this.player.updatePosition(delta); 
  
  this.player.lookDir.copy(input.mouse)
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