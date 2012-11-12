// Describes the world
var World = function () {
  
  this.walls = [];
  this.walls.push(
    new Wall({
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
    new Wall({
      corners: [
        new THREE.Vector2(40, 15),
        new THREE.Vector2(60, 10),
        new THREE.Vector2(63, 27),
        new THREE.Vector2(50, 45),
        new THREE.Vector2(45, 40)
      ]
    })
  );
                  
  this.player = new Player({
    position: {x: 10, y: 7}
  });        
  
  for (var i = 0; i < this.walls.length; i++) {
    this.player.pushCollidable(this.walls[i].mesh);
  }
  
  this.enemies = [];
  this.enemies.push(new Player({ 
    position: {x: 0, y: 10},
    color: 0x0000FF
  }));
  this.enemies.push(new Player({
    position: {x: 35, y: 15},
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
  
};


World.prototype.load = function (cfg) {
  // to do
};

World.prototype.init = function (scene) {
  scene.add(this.floor);
  
  for (var i = 0; i < world.walls.length; i++) {
    scene.add(this.walls[i].mesh);
    
    // debug
    var rays = this.walls[i].hidingRays;
    for (var j = 0; j < rays.length; j++) {
      scene.add(rays[j]);
    }
  }
  
  scene.add(this.player.mesh);
  
  for (var i = 0; i < this.enemies.length; i++) {
    scene.add(this.enemies[i].mesh);
  }
};

World.prototype.initHidingMask = function (scene) {
  var hiddenMat = new THREE.MeshBasicMaterial({color: 0x000000});
  var visibleMat = new THREE.MeshBasicMaterial({color: 0xffffff});
  
  var floor = this.floor.clone();
  floor.material = visibleMat;
  scene.add(floor);
  
  for (var i = 0; i < world.walls.length; i++) {
    var hidingBlocks = this.walls[i].hidingBlocks;
    for (var j = 0; j < hidingBlocks.length; j++) {
      hidingBlocks[j].material = hiddenMat;
      scene.add(hidingBlocks[j]);
    }
  }
  
  var player = this.player.mesh.clone();
  player.material = visibleMat;
  scene.add(player);
  
  for (var i = 0; i < world.enemies.length; i++) {
    var enemy = this.enemies[i].mesh.clone();
    enemy.material = visibleMat;
    scene.add(enemy);
  }
};

World.prototype.isVisible = function (position) {
  for (var i = 0; i < this.walls.length; i++) {
    if (this.walls[i].hides(position)) {
      return false;
    }
  }
  return true;
};

World.prototype.updateHidden = function () {
  var playerPos = this.player.getPosition();
  for (var i = 0; i < this.walls.length; i++) {
    this.walls[i].setHidden(playerPos);
  }
  
  for (var i = 0; i < world.enemies.length; i++) {
    var enemy = this.enemies[i];
    enemy.mesh.visible = this.isVisible(enemy.getPosition());
  }
};