var Q = require('q');
var twoD = require('../shared/twoD');
var Game = require('../shared/Game.js');
var utils = require('../shared/utils.js');
var Player = require('../shared/Player.js');
var ClientWall = require('./ClientWall.js');
var Bullet = require('./Bullet.js');
var Controls = require('./Controls.js');

// gets json from this server and parses it. returns a promise.
// TODO(Jan): Move this to a dedicated library?
var getJson = function (path) {
  var deferred = Q.defer();
  
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = utils.bind(this, function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        var json = JSON.parse(xhr.responseText);
        deferred.resolve(json);
      } else {
        deferred.reject("ClientGame: Couldn't load [" + url + "] [" + xhr.status + "]");
      }
    }
  });

  xhr.open( "GET", path, true );
  xhr.send( null );
  
  return deferred.promise;
};

var parse = function (cfg) {
  var deferred = Q.defer();
  
  var result = new ClientGame(cfg);
  
  for (var i = 0; i < cfg.walls.length; i++) {
    var wall = new ClientWall({
      corners: cfg.walls[i].corners.map(function (corner) { 
          return new twoD.Vector(corner[0], corner[1]);
        })
    });
    
    result.walls.push(wall);
  }
  var sceneLoader = new THREE.SceneLoader();
  sceneLoader.load(cfg.scene, function(data) {
    result.environment = data.objects;
    result.scene = data.scene;
    result.init();
    deferred.resolve(result);
  });
  
  return deferred.promise;
};

var ClientGame;
module.exports = ClientGame = function (cfg) {
  Game.call(this, cfg);
  
  this.scene;
  
  this.environment = {};
  
  this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  this.camera.position.z = 50;
  
  this.bullets = [];
  
  this.controls = new Controls(this.camera);
};

ClientGame.prototype = Object.create(Game.prototype);

// Loads a game from the server
ClientGame.load = function (level) {
 return getJson(level).then(function (cfg) {
   return parse(cfg);
 });
};



// add a player to the world
ClientGame.prototype.setSize = function(width, height) {
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
  this.controls.setSize(width, height);
};


// add a player to the world
ClientGame.prototype.addPlayer = function(player) {
  Game.prototype.addPlayer.call(this, player);
  this.scene.add(player.mesh);
};

// remove a player from the world
ClientGame.prototype.removePlayer = function(id) {
  var removedPlayer = Game.prototype.removePlayer.call(this, id);
  if (removedPlayer !== undefined) {
    this.scene.remove(removedPlayer.mesh);
  }
};

// update the players in this world
ClientGame.prototype.updatePlayers = function (delta) {
  for (var i = 0; i < this.players.length; i++) {
    this.players[i].update(delta);
  }
};

// set the visibility of the players
ClientGame.prototype.setPlayersVisible = function (visible) {
  for (var i = 0; i < this.players.length; i++) {
    var player = this.players[i];
    player.mesh.visible = visible;
  }
};

// initialize the world
ClientGame.prototype.init = function () {
  // init scene
  //this.scene = new THREE.Scene();      
  this.scene.add(this.camera);
  
  // light for rendering the hidden parts
  this.hidingLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);  
  
  // light for render above the player
  this.playerLight = new THREE.DirectionalLight(0xFFFFFF);
  
  // init walls
  for (var i = 0; i < this.walls.length; i++) {
    var hidingBlocks = this.walls[i].hidingBlocks;
    for (var j = 0; j < hidingBlocks.length; j++) {
      this.scene.add(hidingBlocks[j]);
    }      
  }
  
  // init lights
  this.scene.add(this.hidingLight);
  this.scene.add(this.playerLight);
};

ClientGame.prototype.setViewPosition = function (position) {
  for (var i = 0; i < this.walls.length; i++) {
    this.walls[i].setHidden(position);
  }
  this.hidingLight.position.set(position.x, position.y, 100);
  this.playerLight.position.set(position.x, position.y, 10);
  this.hidingLight.target.position.set(position.x, position.y, 0);    
  this.playerLight.target.position.set(position.x, position.y, 0);
  this.camera.position.x = position.x;
  this.camera.position.y = position.y;
};


// determines whether a point in 2D space is obscured by a wall in the world
ClientGame.prototype.isVisible = function (position) {
  for (var i = 0; i < this.walls.length; i++) {
    if (this.walls[i].hides(position)) {
      return false;
    }
  }
  return true;
};

// update the world with a timeframe of delta
ClientGame.prototype.update = function (delta) {
  this.updatePlayers(delta);
  this.updateBullets(delta);
  
  // test controls
  var input = this.controls.getInput();
  //console.log(input.mouse);
};

ClientGame.prototype.updateBullets = function (delta) {
  for (var i = 0; i < this.bullets.length; i++) {
    this.bullets[i].update(delta);
  }
};

// Renders the world with the given renderer
ClientGame.prototype.render = function (renderer) {
  var ctx = renderer.context;
  renderer.clear();
  
  // prepare stencilbuffer for writing a mask
  ctx.enable(ctx.STENCIL_TEST);
  ctx.stencilFunc(ctx.ALWAYS, 0x1, 0x1);
  ctx.stencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
  
  // render the mask
  this.setMode(this.OBSCURING_MASK);
  renderer.render(this.scene, this.camera);
  
  // clear the depth buffer after masking
  ctx.clearDepth(0xffffff);
  ctx.clear(ctx.DEPTH_BUFFER_BIT);
  
  // prepare stencilbuffer for using mask
  ctx.stencilFunc(ctx.EQUAL, 0x0, 0x1 );
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
  
  // render the visible parts
  this.setMode(this.VISIBLE_PARTS);
  renderer.render(this.scene, this.camera);
  
  // invert mask
  ctx.stencilFunc(ctx.EQUAL, 0x1, 0x1);
  
  // render the obscured parts
  this.setMode(this.OBSCURED_PARTS);
  renderer.render(this.scene, this.camera);
};


ClientGame.prototype.addBullet = function (position, direction) {
  var bullet = new Bullet(position, direction);
  this.bullets.push(bullet);
  this.scene.add(bullet.mesh);
};

// Modes for setMode()
ClientGame.prototype.VISIBLE_PARTS = 0;
ClientGame.prototype.OBSCURED_PARTS = 1;
ClientGame.prototype.OBSCURING_MASK = 2;

// sets the visibility of the parts of the wall
ClientGame.prototype.setHidingblocksVisible = function (visible) {
  for (var i = 0; i < this.walls.length; i++) {
    this.walls[i].setHidingblocksVisible(visible);
  }
};

// set the visibility of the bullets
ClientGame.prototype.setBulletsVisible = function (visible) {
  for (var i = 0; i < this.bullets.length; i++) {
    var bullet = this.bullets[i];
    bullet.mesh.visible = visible;
  }
};

// set the visibility of the bullets
ClientGame.prototype.setEnvironmentVisible = function (visible) {
  for (var objectid in this.environment) {
    this.environment[objectid].visible = visible;
  }
};

ClientGame.prototype.setMode = function (mode) {  
  switch (mode) {
    case this.VISIBLE_PARTS:
      this.setEnvironmentVisible(true);
      this.setHidingblocksVisible(false);
      this.setPlayersVisible(true);
      this.setBulletsVisible(true);
      break;
    case this.OBSCURED_PARTS:
      this.setEnvironmentVisible(true);
      this.setHidingblocksVisible(false);
      this.setPlayersVisible(false);
      this.setBulletsVisible(false);
      this.hidingLight.visible = true;
      this.playerLight.visible = false;
      break;
    case this.OBSCURING_MASK:
      this.setEnvironmentVisible(false);
      this.setHidingblocksVisible(true);
      this.setPlayersVisible(false);
      this.setBulletsVisible(false);
      this.hidingLight.visible = false;
      this.playerLight.visible = true;
      break;
    default:;
  }
};