var utils = require('../shared/utils.js');

// A buffer to store the state for a player so it can be played back
// with an offset to keep the animation smooth
var PlayerStateBuffer = module.exports = function () {
  this.buffer = []; // keep at least 1 element
  this.maxOffset = 1000; // maximum offset to keep in the buffer
};

// add a state to the buffer
PlayerStateBuffer.prototype.add = function (time, state) {
  this.buffer.push({
    time: time,
    state: state
  });
  // clean the end of the buffer
  while (this.buffer.length > 1 && this.buffer[0].time < time - this.maxOffset) {
    this.buffer.splice(0, 1);
  }
};

// interpolate 2 playerstates by a factor s
PlayerStateBuffer.prototype.interpolateStates = function (state1, state2, s) {
  return {
    position: {
      x: utils.interpolate(state1.position.x, state2.position.x, s),
      y: utils.interpolate(state1.position.y, state2.position.y, s)
    },
    lookDir: {
      x: utils.interpolate(state1.lookDir.x, state2.lookDir.x, s),
      y: utils.interpolate(state1.lookDir.y, state2.lookDir.y, s)
    }
  }
};

// interpolate a state from the buffer with the desired time
PlayerStateBuffer.prototype.interpolate = function (time) {    
  var length = this.buffer.length;
  if (time <= this.buffer[0].time) {
    return this.buffer[0].state;
  } else if (time >= this.buffer[length - 1].time) {
    return this.buffer[length - 1].state;
  } else {
    var idx = 0;
    while (this.buffer[idx + 1].time < time) {
      idx += 1;
    }
    var s = (time - this.buffer[idx].time) / (this.buffer[idx + 1].time - this.buffer[idx].time);
    return this.interpolateStates(this.buffer[idx].state, this.buffer[idx + 1].state, s);
  }
};