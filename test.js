var width = document.body.clientWidth;
var height = document.body.clientHeight;

var canvas = document.querySelector('#viewport');
var renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(width, height);

var scene = new THREE.Scene();
var cube = new THREE.Mesh(new THREE.CubeGeometry(30, 30, 30), new THREE.MeshPhongMaterial({color: 0xFF0000}));
scene.add(cube);

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
scene.add(camera);
camera.position = new THREE.Vector3(60, 60, 60);
camera.lookAt(new THREE.Vector3(0,0,0));
camera.updateMatrix();

var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position = new THREE.Vector3(100, 80, 20);
scene.add(pointLight);

var renderPass = new THREE.RenderPass(scene, camera);
renderPass.renderToScreen = true;

var composer = new THREE.EffectComposer(renderer);
composer.addPass(renderPass);
renderer.render(scene, camera);
//renderer.clear();
//composer.render();

