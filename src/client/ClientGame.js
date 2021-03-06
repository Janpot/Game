var Q = require('q');
var twoD = require('../shared/twoD');
var Game = require('../shared/Game');
var utils = require('../shared/utils');
var ClientWall = require('./ClientWall');
var ClientPlayerController = require('./ClientPlayerController');
var EnemiesController = require('./EnemiesController');
var GameStats = require('./GameStats');
var factory = require('./clientFactory');
var HUD = require('./HUD');


var ClientGame;
module.exports = ClientGame = function (cfg) {
  Game.call(this, cfg);
  
  this.factory = factory;
  
  this.domElement;
  this.stats;
  
  this.scene;
  this.renderer;
  
  this.playerController;
  this.enemiesController;
  
  this.environment = {};
  
  this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  this.camera.position.z = 50;
  
  this.lastRenderTime;
};

ClientGame.prototype = Object.create(Game.prototype);

// start the game in the provided dom element
ClientGame.prototype.start = function(domElement, socket) {
  this.domElement = domElement;
  
  // make focusable
  this.domElement.tabIndex = 0;
  this.domElement.focus();
  
  // add a cursor
  this.domElement.style.cursor = 'crosshair';
  this.domElement.style.webkitUserSelect = 'none';
      
  this.socket = socket;  
  
  // initialize the renderer
  var canvas = document.createElement('canvas');
  this.domElement.appendChild(canvas);
  canvas.style.cssText = [
    'position: absolute', 
    'top: 0px',
    'left: 0px'
  ].join('; '); 
  this.renderer = new THREE.WebGLRenderer({canvas: canvas});
  this.renderer.autoClear = false;
  
  // initialize stats
  this.stats = new GameStats();
  this.domElement.appendChild(this.stats.domElement);
  this.stats.setVisibility(true);
  
  // initialize controllers
  this.playerController = new ClientPlayerController(this.factory, this.socket);
  this.addObject(this.playerController);
  
  this.HUD = new HUD(this.factory, this.playerController.player);
  this.domElement.appendChild(this.HUD.domElement);
  this.addObject(this.HUD);
  
  this.enemiesController = new EnemiesController(this.factory, this.socket);  
  this.addObject(this.enemiesController);
  
  Game.prototype.start.call(this);
  
  // start renderloop  
  this.render();
};

ClientGame.prototype.initViewport = (function() {  
  // variables to store previous state
  var prevWidth, prevHeight;    
  return function() {
    // get the size
    var width = this.domElement.clientWidth;
    var height = this.domElement.clientHeight;
    if (width != prevWidth || height != prevHeight) {
      // only resize when size actually changes
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.playerController.setSize(width, height);
      
      prevWidth = width;
      prevHeight = height;
    }    
  };
})();

// initialize the world
ClientGame.prototype.init = function () {
  // init scene      
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
ClientGame.prototype.update = function (delta, now) {
  this.stats.measureGameloop(utils.bind(this, function() {
    Game.prototype.update.call(this, delta, now);
  }));
};

// Renders the world with the given renderer
ClientGame.prototype.render = function () {
  var now = Date.now();
  this.lastRenderTime = this.lastRenderTime || now;
  var delta = now - this.lastRenderTime;
  this.stats.measureRenderloop(utils.bind(this, function() {
    this.initViewport();
    
    Game.prototype.render.call(this, delta, now);
    
    var ctx = this.renderer.context;
    this.renderer.clear();
    
    // prepare stencilbuffer for writing a mask
    ctx.enable(ctx.STENCIL_TEST);
    ctx.stencilFunc(ctx.ALWAYS, 0x1, 0x1);
    ctx.stencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
    
    // render the mask
    this.setMode(this.OBSCURING_MASK);
    this.renderer.render(this.scene, this.camera);
    
    // clear the depth buffer after masking
    ctx.clearDepth(0xffffff);
    ctx.clear(ctx.DEPTH_BUFFER_BIT);
    
    // prepare stencilbuffer for using mask
    ctx.stencilFunc(ctx.EQUAL, 0x0, 0x1 );
    ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
    
    // render the visible parts
    this.setMode(this.VISIBLE_PARTS);
    this.renderer.render(this.scene, this.camera);
    
    // invert mask
    ctx.stencilFunc(ctx.EQUAL, 0x1, 0x1);
    
    // render the obscured parts
    this.setMode(this.OBSCURED_PARTS);
    this.renderer.render(this.scene, this.camera);
  
    window.requestAnimationFrame(utils.bind(this, this.render));
  }));
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

// set the visibility of the objects
// REMARK(Jan): a bit hacky but removed when rendering is done properly
ClientGame.prototype.setObjectsVisible = function (visible) {
  for (var i = 0; i < this.objects.length; i++) {
    var object = this.objects[i];
    if (object.setVisible) {
      object.setVisible(visible);
    }
  }
};

// set the visibility of the environment
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
      this.setObjectsVisible(true);
      break;
    case this.OBSCURED_PARTS:
      this.setEnvironmentVisible(true);
      this.setHidingblocksVisible(false);
      this.setObjectsVisible(false);
      this.hidingLight.visible = true;
      this.playerLight.visible = false;
      break;
    case this.OBSCURING_MASK:
      this.setEnvironmentVisible(false);
      this.setHidingblocksVisible(true);
      this.setObjectsVisible(false);
      this.hidingLight.visible = false;
      this.playerLight.visible = true;
      break;
    default:;
  }
};








// Loading of games
// --------------------------------------


// Loads a game from the server
ClientGame.load = function (level) {
 return getJson(level).then(function (cfg) {
   return parse(cfg);
 });
};


// gets json from this server and parses it. returns a promise.
// TODO(Jan): Move this to a dedicated library?
var getJson = function (path) {
  var deferred = Q.defer();
  
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = utils.bind(this, function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        try {
          var json = JSON.parse(xhr.responseText);
          deferred.resolve(json);
        } catch (err) {
          deferred.reject(err);
        }
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