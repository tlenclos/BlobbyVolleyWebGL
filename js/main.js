/* Main Script */

// Variables
var camera, scene, renderer, stats, container;
var cube, cube2, net, ball;

// Bootstrap
init();
render();

// ## Init game
function init() {
	// Scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer();
	container = document.body;
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	// Geometry and materials
	var geometryPlayers = new THREE.CubeGeometry(1,1,1); 
	var geometryNet = new THREE.CubeGeometry(1, 3, 5);
	var geometryBall = new THREE.SphereGeometry(0.5);

	var materialPlayer1 = new THREE.MeshBasicMaterial({color: 0x00ff00});
	var materialPlayer2 = new THREE.MeshBasicMaterial({color: 0xE01B56});
	var materialNet = new THREE.MeshBasicMaterial({color: 0xA8A9AD});
	var materialBall = new THREE.MeshBasicMaterial({color: 0xB2BEED});

	// Players
	cube = new THREE.Mesh(geometryPlayers, materialPlayer1);
	cube.position.x = -3;
	cube2 = new THREE.Mesh(geometryPlayers, materialPlayer2);
	cube2.position.x = 3;

	// Field
	net = new THREE.Mesh(geometryNet, materialNet);

	// Ball
	ball = new THREE.Mesh(geometryBall);
	ball.position.y = 3;

	// Add objects
	scene.add(cube);  
	scene.add(cube2);
	scene.add(net);
	scene.add(ball);

	// Camera default position
	camera.position.y = 2;
	camera.position.z = 7;

	// Events
	document.addEventListener('mousemove', onMouseMove, false);

	function onMouseMove(event) {
		var mouseX = event.clientX - window.innerWidth/2;
		var mouseY = event.clientY - window.innerHeight/2;
		camera.position.x += (mouseX - camera.position.x) * 0.00005;
		camera.position.y += (-mouseY - camera.position.y) * 0.00005;
		camera.lookAt(scene.position);
		renderer.render(scene, camera);
	}

}

// ## Animate and Render the 3D Scene
function render() {
	requestAnimationFrame(render);

	// update the stats
	stats.update();
	cube.rotation.x = cube2.rotation.x += 0.01;
	cube.rotation.y = cube2.rotation.y += 0.01;

	renderer.render(scene, camera);
}