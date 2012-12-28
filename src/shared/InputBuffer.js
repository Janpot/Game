var utils = require('./utils.js');

// A buffer to store items with a timestamp
// the [maximum] time that is kept in the buffer, ignored when there is only one item
var InputBuffer;
module.exports = InputBuffer = function (maximum) {
  this.buffer = []; // keep at least 1 element
};

// add an item to the buffer
InputBuffer.prototype.add = function (input, time) {
  if (time === undefined) {
    time = Date.now();
  } 
  this.buffer.push({
    time: time,
    item: input
  });
  // clean the end of the buffer, keep at least one item
  while (this.buffer.length > 1 && this.buffer[0].time < time - this.maxTime) {
    this.buffer.splice(0, 1);
  }
};

// interpolate a state from the buffer with the desired time
InputBuffer.prototype.get = function (time) {    
  var length = this.buffer.length;
  if (time <= this.buffer[0].time) {
    return this.buffer[0].item;
  } else if (time >= this.buffer[length - 1].time) {
    return this.buffer[length - 1].item;
  } else {
    var idx = 0;
    while (this.buffer[idx + 1].time < time) {
      idx += 1;
    }
    var s = (time - this.buffer[idx].time) / (this.buffer[idx + 1].time - this.buffer[idx].time);
    return this.interpolate(this.buffer[idx].item, this.buffer[idx + 1].item, s);
  }
};

InputBuffer.prototype.serialize = function (state1, state2, s) {
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