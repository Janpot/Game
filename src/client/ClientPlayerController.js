var utils = require('../shared/utils.js');
var twoD = require('../shared/twoD');
var ClientPlayer = require('./ClientPlayer.js');
var Controls = require('./Controls.js');
var GameController = require('../shared/GameController.js');

var UPDATE_INTERVAL = 50; // ms, interval at which to update the server
var ENEMY_OFFSET = 100; // ms behind actual state
var MAX_BUFFERSIZE = 5 * ENEMY_OFFSET; // ms, size of playerstate buffers
var CORRECTION_DELTA = 0.1; // minimum deviationto make a correction

// controls for a player
var ClientPlayerController;
module.exports = ClientPlayerController = function (clientGame, clientSocket) {
  GameController.call(this, clientGame);
  
  this.width = 0;
  this.height = 0;
  this.socket = clientSocket;
  this.player = new ClientPlayer(this.socket.socket.sessionid, this.game, {
    position: new THREE.Vector2(0, 0)
  });
  this.game.addPlayer(this.player);
  this.controls = new Controls(this.game.camera);
  
  this.inputBuffer = [];
  this.pendingUpdates = [];
  this.lastCorrectionTime = 0;
  
  this.socket.on('gamestate', utils.bind(this, this.handleCorrections)); 
  
  setInterval(utils.bind(this, this.sendInputBuffer), UPDATE_INTERVAL);
  
  console.log('this is ' + this.player.id);
  
  // TODO(Jan): Remove this when shooting is properly implemented
  var mouseDown = function (e) {
    switch (e.button) {
      case 0: // left
        this.shoot();
        break;
    }
  };
  window.addEventListener('mousedown', utils.bind(this, mouseDown), false);
  // END TODO  
};

ClientPlayerController.prototype = Object.create(GameController.prototype);

// update the game state according to the controls
ClientPlayerController.prototype.update = function (delta) {
  
  var input = this.controls.getInput();  
  this.player.applyInput(input);
  
  // update position
  this.player.updatePosition(delta); 
  
  this.game.setViewPosition(this.player.position);
  
  this.inputBuffer.push({
    input: input,
    delta: delta
  });
  
};

// let the player shoot
ClientPlayerController.prototype.shoot = function () {
  this.game.addBullet(this.player.position.clone(), this.player.lookDir.clone());
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

// returns the serverupdate sent on [time]
ClientPlayerController.prototype.getServerUpdate = function(time) {
  for (var i = 0; i < this.pendingUpdates.length; i++) {
    var update = this.pendingUpdates[i];
    if (update.updateTime === time) {
      return update;
    }
  };
  //console.log(this.lastCorrectionTime, time, this.pendingUpdates);
};
  
  

// handle corrections sent from the server
ClientPlayerController.prototype.handleCorrections = function(serverGame) {
  if (serverGame.player.updateTime === undefined || serverGame.player.updateTime <= this.lastCorrectionTime) {
    // already corrected
    return;
  };
  this.lastCorrectionTime = serverGame.player.updateTime;
  
  var storedUpdate = this.getServerUpdate(serverGame.player.updateTime);

  // clean up out of date pending updates
  this.pendingUpdates = this.pendingUpdates.filter(function (update) {
    return update.updateTime > serverGame.player.updateTime;
  });
  
  var serverPlayerPosition = serverGame.player.state.position;  
  var xDifference = Math.abs(serverPlayerPosition.x - storedUpdate.position.x);
  var yDifference = Math.abs(serverPlayerPosition.y - storedUpdate.position.y);
  if (xDifference < CORRECTION_DELTA  && yDifference < CORRECTION_DELTA) {
    // no correction required
    console.log('no correction required');
  } else {
    // apply al input since last update
    console.log('correcting...');
    
    // apply pending server updates
    this.player.position.copy(serverPlayerPosition);
    for (var i = 0; i < this.pendingUpdates.length; i++) {
      var update = this.pendingUpdates[i];
      for (var j = 0; j < update.sentInput.length; j++) {
        var inputData = update.sentInput[j];
        this.player.applyInput(inputData.input);
        this.player.updatePosition(inputData.delta);
      }
    }
    
    // apply current inputbuffer
    for (var i = 0; i < this.inputBuffer.length; i++) {
      var inputData = this.inputBuffer[i];
      this.player.applyInput(inputData.input);
      this.player.updatePosition(inputData.delta);
    }
    
  }
  
};


