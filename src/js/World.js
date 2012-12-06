var game = game || {};

// game.World Describes the playingfield
// This class is responsible for rendering the world and its objects
// TODO(jan): Ultimately all game logic should be taken out of this class and
// put in separate controllers. We will combine as much objects as possible in a 
// global world.objects list and call update(delta) on each element. Each object 
// wil extend a GameObject interface which exposes an update(delta) method.
// We will combine: walls, players, floor, bullets,...
//   depends on: - shader for the hidden parts so we don't need setMode(), etc
//               - level creation mechanism (Cinema4D plugin)
game.World = (function () {
  
  var World = function () {
    
    this.scene;
    
    this.environment = {};
    
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.z = 50;
    
    this.walls = [];
    
    this.players = [];
    
    this.bullets = [];
    
  };
  
  // add a player to the world
  World.prototype.addPlayer = function(player) {
    this.players.push(player);
    this.scene.add(player.mesh);
  };
  
  // remove a player from the world
  World.prototype.removePlayer = function(player) {
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i] === player) {
        this.players.splice(i, 1);
        this.scene.remove(player.mesh);
      }
    }
  };
  
  // update the players in this world
  World.prototype.updatePlayers = function (delta) {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].update(delta);
    }
  };
  
  // set the visibility of the players
  World.prototype.setPlayersVisible = function (visible) {
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      player.mesh.visible = visible;
    }
  };

  // initialize the world
  World.prototype.init = function () {
    // init scene
    //this.scene = new THREE.Scene();      
    this.scene.add(this.camera);
    
    // light for rendering the hidden parts
    this.hidingLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);  
    
    // light for render above the player
    this.playerLight = new THREE.DirectionalLight(0xFFFFFF);
    
    // init floor
    this.scene.add(this.floor);
    
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
  
  World.prototype.setViewPosition = function (position) {
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
  World.prototype.isVisible = function (position) {
    for (var i = 0; i < this.walls.length; i++) {
      if (this.walls[i].hides(position)) {
        return false;
      }
    }
    return true;
  };
  
  // update the world with a timeframe of delta
  World.prototype.update = function (delta) {
    this.updatePlayers(delta);
    this.updateBullets(delta);
  };
  
  World.prototype.updateBullets = function (delta) {
    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].update(delta);
    }
  };
  
  // Renders the world with the given renderer
  World.prototype.render = function (renderer) {
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
  
  
  World.prototype.addBullet = function (position, direction) {
    var bullet = new game.Bullet(position, direction);
    this.bullets.push(bullet);
    this.scene.add(bullet.mesh);
  };
  
  // Modes for setMode()
  World.prototype.VISIBLE_PARTS = 0;
  World.prototype.OBSCURED_PARTS = 1;
  World.prototype.OBSCURING_MASK = 2;
  
  // sets the visibility of the parts of the wall
  World.prototype.setHidingblocksVisible = function (visible) {
    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].setHidingblocksVisible(visible);
    }
  };
  
  // set the visibility of the bullets
  World.prototype.setBulletsVisible = function (visible) {
    for (var i = 0; i < this.bullets.length; i++) {
      var bullet = this.bullets[i];
      bullet.mesh.visible = visible;
    }
  };
  
  // set the visibility of the bullets
  World.prototype.setEnvironmentVisible = function (visible) {
    for (var objectid in this.environment) {
      this.environment[objectid].visible = visible;
    }
  };
  
  World.prototype.setMode = function (mode) {  
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
    }
  };
  
  return World;
        
})();