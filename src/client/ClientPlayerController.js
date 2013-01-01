var GameObject = require('../shared/GameObject');
var utils = require('../shared/utils');
var twoD = require('../shared/twoD');
var ClientPlayer = require('./ClientPlayer');
var Controls = require('./Controls');

var UPDATE_INTERVAL = 50; // ms, interval at which to update the server
var ENEMY_OFFSET = 100; // ms behind actual state
var MAX_BUFFERSIZE = 5 * ENEMY_OFFSET; // ms, size of playerstate buffers
var CORRECTION_DELTA = 0.1; // minimum deviationto make a correction

// controls for a player
var ClientPlayerController;
module.exports = ClientPlayerController = function (factory, clientSocket) {
  GameObject.call(this, factory);
  
  this.width = 0;
  this.height = 0;
  this.socket = clientSocket;
  this.player = new ClientPlayer(this.socket.socket.sessionid, this.factory, {
    position: new THREE.Vector2(0, 0)
  });
  this.player.autoUpdate = true;
  /*
  this.game.addPlayer(this.player);
  
  this.controls = new Controls(this.game);
  */
  this.inputBuffer = [];
  this.pendingUpdates = [];
  this.lastCorrectionTime = 0;
  
  this.autoUpdate = true;
};

ClientPlayerController.prototype = Object.create(GameObject.prototype);

ClientPlayerController.prototype.initialize = function (game) {
  GameObject.prototype.initialize.apply(this, arguments);
  
  this.controls = new Controls(this.game);
  this.game.addPlayer(this.player);
  
  this.socket.on('gamestate', utils.bind(this, this.handleCorrections)); 
  setInterval(utils.bind(this, this.sendInputBuffer), UPDATE_INTERVAL);
};


// update the game state according to the controls
ClientPlayerController.prototype.update = function (delta, now) {  
  GameObject.prototype.update.apply(this, arguments);
  
  var input = this.controls.getInput();  
  this.player.applyInput(input, delta);
    
  this.game.setViewPosition(this.player.position);
  
  this.inputBuffer.push({
    input: input,
    delta: delta
  });  
};
   

// set up the loop for sending the player's state to the server
ClientPlayerController.prototype.startSendingInput = function () {
  setInterval(utils.bind(this, this.sendInputBuffer), UPDATE_INTERVAL);
};

// Send the player's state to the server
ClientPlayerController.prototype.sendInputBuffer = function () {
  var updateTime = Date.now()
  this.socket.emit('playerinput', {
    buffer: this.inputBuffer.map(function (item) { 
      return item.input; 
    }),
    clientTime: updateTime
  });
  
  this.pendingUpdates.push({
    updateTime: updateTime,
    sentInput: this.inputBuffer,
    position: this.player.position
  })
  
  this.inputBuffer = [];
};


// set size of the viewport
ClientPlayerController.prototype.setSize = function(width, height) {
  this.controls.setSize(width, height);
};
  
  

// handle corrections sent from the server
ClientPlayerController.prototype.handleCorrections = function(serverGame) {
  if (serverGame.player.updateTime === undefined || serverGame.player.updateTime <= this.lastCorrectionTime) {
    // already corrected
    return;
  };

  // clean up out of date pending updates
  this.pendingUpdates = this.pendingUpdates.filter(function (update) {
    return update.updateTime > serverGame.player.updateTime;
  });
  
  // apply pending server updates
  this.player.unserializeState(serverGame.player.state);
  
  for (var i = 0; i < this.pendingUpdates.length; i++) {
    var update = this.pendingUpdates[i];
    for (var j = 0; j < update.sentInput.length; j++) {
      var inputData = update.sentInput[j];
      this.player.applyInput(inputData.input, inputData.delta);
    }
  }
  
  // apply current inputbuffer
  for (var i = 0; i < this.inputBuffer.length; i++) {
    var inputData = this.inputBuffer[i];
    this.player.applyInput(inputData.input, inputData.delta);
  }
  
  this.lastCorrectionTime = serverGame.player.updateTime;
};


