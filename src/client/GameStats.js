var GameStats;

// stats for the game
module.exports = GameStats = function () {
  this.domElement = document.createElement('div');
  this.domElement.style.cssText = [
    'position: absolute', 
    'top: 0px',
    'left: 0px',
    'padding: 0px 3px 3px 3px',
    'background-color: white',
    'font-family: Helvetica, Arial, sans-serif',
    'font-size: 9px',
    'font-weight: bold', 
    'line-height: 15px'
  ].join('; ');
  
  this.domElement.appendChild(document.createTextNode('renderloop'));
  this.renderStats = new Stats();
  this.domElement.appendChild(this.renderStats.domElement);
  
  this.domElement.appendChild(document.createTextNode('gameloop'));
  this.gameStats = new Stats();
  this.gameStats.setMode(1);
  this.domElement.appendChild(this.gameStats.domElement);
  
  this.setVisibility(false);
};

GameStats.prototype.setVisibility = function (visible) {
  this.domElement.style.display = visible ? 'block' : 'none';
};

GameStats.prototype.measureRenderloop = function (renderloop) {
  this.renderStats.begin();
  renderloop();
  this.renderStats.update();
};


GameStats.prototype.measureGameloop = function (gameloop) {
  this.gameStats.begin();
  gameloop();
  this.gameStats.update();
};