var game = game || {};

game.WorldLoader = (function () {
  
  var WorldLoader = function() {
    this.sceneLoader = new THREE.SceneLoader();    
  };
  
  WorldLoader.prototype.parse = function (data, callback) {
    
    var result = new game.World();
    
    for (var i = 0; i < data.walls.length; i++) {
      var wall = new game.Wall({
        corners: data.walls[i].corners.map(function (corner) { 
            return new THREE.Vector2(corner[0], corner[1]);
          })
      });
      
      result.walls.push(wall);
    }
    
    this.sceneLoader.load(data.scene, function(data) {
      result.environment = data.objects;
      result.scene = data.scene;
      result.init();
      callback(result);
    });
    
  }
  
  WorldLoader.prototype.load = function (url, callback) {
    
    var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = game.utils.bind(this, function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          var json = JSON.parse(xhr.responseText);
          this.parse(json, callback);
        } else {
          console.error("game.WorldLoader: Couldn't load [" + url + "] [" + xhr.status + "]");
        }
      }
	});

	xhr.open( "GET", url, true );
	xhr.send( null );
    
  };
  
  return WorldLoader;
  
}) ();