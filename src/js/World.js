var game = game || {};

// Describes the world
game.World = (function () {
  
  var World = function () {
    
    this.scene;
    
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.z = 60;
    
    this.walls = [];
                    
    this.player = new game.Player({
      position: new THREE.Vector2(0, 0)
    });
    
    this.enemies = [];
    
    this.floor;
    
    this.bullets = [];
    
    this.init();
    
  };
  
  World.prototype.addEnemy = function(id) {
    var enemy = new game.Player({ 
      position: new THREE.Vector2(0, 0),
      color: 0x0000FF
    });
    enemy.id = id;
    this.enemies.push(enemy);
    this.scene.add(enemy.mesh);
    return enemy;
  };
  
  World.prototype.removeEnemy = function(id) {
    for (var i = 0; i < this.enemies.length; i++) {
      var enemy = this.enemies[i];
      if (enemy.id = id) {
        this.enemies.splice(i, 1);
        this.scene.remove(enemy.mesh);
      }
    }
  };

  // initialize the world
  World.prototype.init = function () {
    
    // init scene
    this.scene = new THREE.Scene();      
    this.scene.add(this.camera);
    
    // light for rendering the hidden parts
    this.hidingLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);    
    this.hidingLight.target = this.player.mesh;
    // light for render above the player
    this.playerLight = new THREE.DirectionalLight(0xFFFFFF);
    this.playerLight.target = this.player.mesh;
    
    // init floor
    this.scene.add(this.floor);
    
    // init walls
    for (var i = 0; i < this.walls.length; i++) {
      this.scene.add(this.walls[i].mesh);
      
      var hidingBlocks = this.walls[i].hidingBlocks;
      for (var j = 0; j < hidingBlocks.length; j++) {
        this.scene.add(hidingBlocks[j]);
      }
      
      this.scene.add(this.hidingLight);
      this.scene.add(this.playerLight);
    }
    
    // init player
    this.scene.add(this.player.mesh);
    
    // init enemies
    for (var i = 0; i < this.enemies.length; i++) {
      this.scene.add(this.enemies[i].mesh);
    }
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
    this.player.update(delta, this);
    this.updateEnemies(delta);
    this.updateBullets(delta);
    this.hidingLight.position.set(this.player.position.x, this.player.position.y, 100);
    this.playerLight.position.set(this.player.position.x, this.player.position.y, 10);
    this.updateHidden();
    this.updateCamera();
  };
  
  // update the camera to follow the player
  World.prototype.updateEnemies = function (delta) {
    for (var i = 0; i < this.enemies.length; i++) {
      this.enemies[i].update(delta, this);
    }
  };
  
  // update the camera to follow the player
  World.prototype.updateCamera = function () {
    this.camera.position.x = this.player.position.x;
    this.camera.position.y = this.player.position.y;
  };
  
  // update the hidden parts of the world
  World.prototype.updateHidden = function () {
    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].setHidden(this.player.position);
    }
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
    this.setMode(game.World.obscuringMask);
    renderer.render(this.scene, this.camera);
    
    // clear the depth buffer after masking
    ctx.clearDepth(0xffffff);
    ctx.clear(ctx.DEPTH_BUFFER_BIT);
    
    // prepare stencilbuffer for using mask
    ctx.stencilFunc(ctx.EQUAL, 0x0, 0x1 );
    ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
    
    // render the visible parts
    this.setMode(game.World.visibleParts);
    renderer.render(this.scene, this.camera);
    
    // invert mask
    ctx.stencilFunc(ctx.EQUAL, 0x1, 0x1);
    
    // render the obscured parts
    this.setMode(game.World.obscuredParts);
    renderer.render(this.scene, this.camera);
  };
  
  
  World.prototype.addBullet = function (position, direction) {
    var bullet = new game.Bullet(position, direction);
    this.bullets.push(bullet);
    this.scene.add(bullet.mesh);
  };
  
  
  
  
  
  // Modes for setMode()
  World.visibleParts = 0;
  World.obscuredParts = 1;
  World.obscuringMask = 2;
  
  // sets the visibility of the parts of the wall
  World.prototype.setWallsVisible = function (wallVisible, hidingblockVisible) {
    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].setVisible(wallVisible, hidingblockVisible);
    }
  };
  
  // set the visibility of the enemies
  World.prototype.setEnemiesVisible = function (visible) {
    for (var i = 0; i < this.enemies.length; i++) {
      var enemy = this.enemies[i];
      enemy.mesh.visible = visible;
    }
  };
  
  // set the visibility of the bullets
  World.prototype.setBulletsVisible = function (visible) {
    for (var i = 0; i < this.bullets.length; i++) {
      var bullet = this.bullets[i];
      bullet.mesh.visible = visible;
    }
  };
  
  World.prototype.setMode = function (mode) {  
    switch (mode) {
      case World.visibleParts:
        this.floor.visible = true;      
        this.setWallsVisible(true, false);
        this.setEnemiesVisible(true);
        this.setBulletsVisible(true);
        this.player.mesh.visible = true;
        break;
      case World.obscuredParts:
        this.floor.visible = true;
        this.setWallsVisible(true, false);
        this.setEnemiesVisible(false);
        this.player.mesh.visible = true;
        this.setBulletsVisible(false);
        this.hidingLight.visible = true;
        this.playerLight.visible = false;
        break;
      case World.obscuringMask:
        this.floor.visible = false;
        this.setWallsVisible(false, true);
        this.setEnemiesVisible(false);
        this.setBulletsVisible(false);
        this.player.mesh.visible = false;
        this.hidingLight.visible = false;
        this.playerLight.visible = true;
        break;
    }
  };
  
  return World;
        
})();