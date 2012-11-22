var game = game || {};

// Describes the world
game.World = (function () {
  
  var World = function () {
    
    this.walls = [];
    this.walls.push(
      new game.Wall({
        corners: [
          new THREE.Vector2(10, 10),
          new THREE.Vector2(25, 10),
          new THREE.Vector2(30, 27),
          new THREE.Vector2(20, 30),
          new THREE.Vector2(20, 40)
        ]
      })
    );
    
    this.walls.push(
      new game.Wall({
        corners: [
          new THREE.Vector2(-10, 10),
          new THREE.Vector2(-10, 30),
          new THREE.Vector2(-20, 30),
          new THREE.Vector2(-20, 10)
        ]
      })
    );
    
    this.walls.push(
      new game.Wall({
        corners: [
          new THREE.Vector2(40, 15),
          new THREE.Vector2(60, 10),
          new THREE.Vector2(63, 27),
          new THREE.Vector2(50, 45),
          new THREE.Vector2(45, 40)
        ]
      })
    );
                    
    this.player = new game.Player({
      position: new THREE.Vector2(10, 7)
    });        
    
    for (var i = 0; i < this.walls.length; i++) {
      this.player.pushCollidable(this.walls[i]);
    }
    
    this.enemies = [];
    this.enemies.push(new game.Player({ 
      position: new THREE.Vector2(0, 10),
      color: 0x0000FF
    }));
    this.enemies.push(new game.Player({
      position: new THREE.Vector2(35, 15),
      color: 0x0000FF
    }));
    
    
    var shape = new THREE.Shape();
    shape.fromPoints([
      new THREE.Vector3(-2000, -2000, 0), 
      new THREE.Vector3(2000, -2000, 0),
      new THREE.Vector3(2000, 2000, 0),
      new THREE.Vector3(-2000, 2000, 0)
    ]);
    this.floor = new THREE.Mesh(shape.extrude({amount: 0, bevelEnabled: false}), new THREE.MeshPhongMaterial({color: 0xA3E3D3}));
    
    // light for rendering the hidden parts
    this.hidingLight = new THREE.PointLight(0xFFFFFF, 0.1);
    // light for render above the player
    this.playerLight = new THREE.PointLight(0xFFFFFF);  
  };
  
  
  World.prototype.load = function (cfg) {
    // to do
  };
  
  World.prototype.init = function (scene) {
    scene.add(this.floor);
    
    for (var i = 0; i < world.walls.length; i++) {
      scene.add(this.walls[i].mesh);
      
      var hidingBlocks = this.walls[i].hidingBlocks;
      for (var j = 0; j < hidingBlocks.length; j++) {
        scene.add(hidingBlocks[j]);
      }
      
      scene.add(this.hidingLight);
      scene.add(this.playerLight);
    }
    
    scene.add(this.player.mesh);
    
    for (var i = 0; i < this.enemies.length; i++) {
      scene.add(this.enemies[i].mesh);
    }
  };
  
  // Modes for setMode()
  World.visibleParts = 0;
  World.obscuredParts = 1;
  World.obscuringMask = 2;
  
  World.prototype.setMode = function (mode) {  
    switch (mode) {
      case World.visibleParts:
        this.floor.visible = true;      
        this.setWallsVisible(true, false);
        this.setEnemiesVisible(true);
        this.player.mesh.visible = true;
        break;
      case World.obscuredParts:
        this.floor.visible = true;
        this.setWallsVisible(true, false);
        this.setEnemiesVisible(false);
        this.player.mesh.visible = true;
        this.hidingLight.visible = true;
        this.playerLight.visible = false;
        break;
      case World.obscuringMask:
        this.floor.visible = false;
        this.setWallsVisible(false, true);
        this.setEnemiesVisible(false);
        this.player.mesh.visible = false;
        this.hidingLight.visible = false;
        this.playerLight.visible = true;
        break;
    }
  };
  
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
    this.player.update(delta);
    this.hidingLight.position.set(this.player.position.x, this.player.position.y, 100);
    this.playerLight.position.set(this.player.position.x, this.player.position.y, 10);
    this.updateHidden()
  };
  
  // update the hidden parts of the world
  World.prototype.updateHidden = function () {
    for (var i = 0; i < this.walls.length; i++) {
      this.walls[i].setHidden(this.player.position);
    }
  };
  
  return World;
        
})();