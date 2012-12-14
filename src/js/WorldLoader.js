var utils = require('./utils.js');
var Wall = require('./wall.js');
var World = require('./World.js');

var WorldLoader = module.exports = function() {
  this.sceneLoader = new THREE.SceneLoader();    
};

WorldLoader.prototype.parse = function (data, callback) {
  
  var result = new World();
  
  for (var i = 0; i < data.walls.length; i++) {
    var wall = new Wall({
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
  
};

WorldLoader.prototype.load = function (url, callback) {
  
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = utils.bind(this, function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 0) {
        var json = JSON.parse(xhr.responseText);
        this.parse(json, callback);
      } else {
        console.error("WorldLoader: Couldn't load [" + url + "] [" + xhr.status + "]");
      }
    }
  });

  xhr.open( "GET", url, true );
  xhr.send( null );
  
};
  