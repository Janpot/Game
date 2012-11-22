var game = game || {};

game.WorldLoader = (function () {
  
  var WorldLoader = function() {
    
  };
  
  WorldLoader.prototype.load = function () {
    
    var world = new game.World();
    
    world.walls.push(
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
    
    world.walls.push(
      new game.Wall({
        corners: [
          new THREE.Vector2(-10, 10),
          new THREE.Vector2(-10, 30),
          new THREE.Vector2(-20, 30),
          new THREE.Vector2(-20, 10)
        ]
      })
    );
    
    world.walls.push(
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
                    
    world.player = new game.Player({
      position: new THREE.Vector2(10, 7)
    });        
    
    world.enemies.push(new game.Player({ 
      position: new THREE.Vector2(0, 10),
      color: 0x0000FF
    }));
    world.enemies.push(new game.Player({
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
    world.floor = new THREE.Mesh(shape.extrude({amount: 0, bevelEnabled: false}), new THREE.MeshPhongMaterial({color: 0xA3E3D3}));    
        
    world.init();    
    
    return world;
    
  };
  
  return WorldLoader;
  
}) ();