var http = require('http');
var Q = require('q');
var twoD = require('../shared/twoD');
var Game = require('../shared/Game.js');
var Wall = require('../shared/Wall.js');
var utils = require('../shared/utils.js');
var Player = require('../shared/Player.js');
var config = require('./config.js');


// gets json from this server and parses it. returns a promise.
// TODO(Jan): Move this to a dedicated library?
var getJson = function (path) {
  var deferred = Q.defer();
  
  var options = {
    port: config.port,
    path: path
  };
  
  http.get(options, function (res) {
    var data = '';
    
    res.on('data', function (chunk) {
      data += chunk;
    });
    
    res.on('end', function () {
      try {
        deferred.resolve(JSON.parse(data));
      } catch (err) {
        deferred.reject(err);
      }
    });
  });
  
  return deferred.promise;
};


var ServerGame;
module.exports = ServerGame = function (level, cfg) {  
  Game.call(this, cfg);
  // store level so it can be sent to clients
  this.level = level;
  
  for (var i = 0; i < cfg.walls.length; i++) {
    var wall = new Wall({
      corners: cfg.walls[i].corners.map(function (corner) { 
          return new twoD.Vector(corner[0], corner[1]);
        })
    });
  
    this.walls.push(wall);
  }
};

ServerGame.prototype = Object.create(Game.prototype);

// Loads a game from the server
ServerGame.load = function (level) {
 
 return getJson(level).then(function (cfg) {
   
   return new ServerGame(level, cfg);
 });
};


// Example gamestate:
// ------------------
//
// game = {
//   players: {
//     id_of_player_1: {
//       id: 'id_of_player_1', // the id
//       lastUpdate: 1234567,  // last update on the server
//       delta: -20,           // delta from the time this object was sent to the client
//       state: {              // the state
//         position: {x: 1, y: 2},
//         lookDir: {x: 3, y: 4}
//       }
//     },
//     id_of_player_2: {
//       id: 'id_of_player_2',
//       lastUpdate: 1234567,
//       delta: -20,
//       state: {
//         position: {x: 1, y: 2},
//         lookDir: {x: 3, y: 4}
//       }
//     }
//   }
// }