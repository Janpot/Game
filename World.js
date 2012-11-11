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
  
  this.enemies = [];
  this.enemies.push(new Player({ 
    position: {x: 0, y: 10},
    color: 0x0000FF
  }));
  this.enemies.push(new Player({
    position: {x: 35, y: 15},
    color: 0x0000FF
  }));
  
  var floorGeom = new THREE.Geometry();
  
  floorGeom.vertices.push(new THREE.Vector3(-2000, -2000, -0.01));  
  floorGeom.vertices.push(new THREE.Vector3(2000, -2000, -0.01));
  floorGeom.vertices.push(new THREE.Vector3(2000, 2000, -0.01));
  floorGeom.vertices.push(new THREE.Vector3(-2000, 2000, -0.01));

  floorGeom.faces.push(new THREE.Face4(0, 1, 2, 3));
  this.floor = new THREE.Mesh(floorGeom, new THREE.MeshBasicMaterial({color: 0xA3E3D3}));
  
};


World.prototype.load = function (cfg) {
  // to do
};

World.prototype.init = function (scene) {
  scene.add(this.floor);
  
  for (var i = 0; i < world.walls.length; i++) {
    scene.add(this.walls[i].mesh);
  }
  
  scene.add(this.player.mesh);
  
  for (var i = 0; i < world.enemies.length; i++) {
    scene.add(this.enemies[i].mesh);
  }
};