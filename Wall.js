var Wall = function(corners) {
  var height = 30;  
  var lowerVertices = [];
  for (var i = 0; i < corners.length; i++) {
    lowerVertices.push(new THREE.Vector3(corners[i].x, corners[i].y, 0));
  }
  var shape = new THREE.Shape();
  shape.fromPoints(lowerVertices);  
  var material = new THREE.MeshPhongMaterial({ color: 0x00CC00 });
  this.mesh = new THREE.Mesh(shape.extrude({amount: height, bevelEnabled: false}), material);
  
};