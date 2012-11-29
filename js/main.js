// Variables
var camera, scene, renderer, stats, container;
var physics, field, players = [], ball;

// Bootstrap
init();
render();

// Init game
function init() {
    // Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    container = document.body;
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    // Physics
    physics = new Physics(10);

    // Field
    field = new Field(physics.getWorld(), 0, 0, 22, 10);

    // Blobs
    var blob1 = new Blob(physics.getWorld(), 0x00ff00, [-5, 0]);
    var blob2 = new Blob(physics.getWorld(), 0xff0000, [5, 0]);

    // Players
    var p1 = new Player('P1', ['z', 'd', 'q']);
    p1.attachBlob(blob1);

    var p2 = new Player('P2', ['up', 'right', 'left']);
    p2.attachBlob(blob2);

    players.push(p1, p2);

    // Ball
    ball = new Ball(physics.getWorld(), 0xff000, [-3, 5]);

    // Add all meshes to the scene
    var fieldParts = field.getWalls();

    for (var fieldItem in fieldParts) {
        scene.add(fieldParts[fieldItem]);
    }

    scene.add(blob1.threeObject);
    scene.add(blob2.threeObject);
    scene.add(ball.threeObject);

    // Camera default position
    camera.position.y = 0;
    camera.position.z = 12;
}

// Animate and Render the 3D Scene
function render() {
    for (var p in players) {
        players[p].listenInput();
        players[p].blob.physics();
    }

    ball.physics();
    physics.step();

    requestAnimationFrame(render);

    // update the stats
    stats.update();

    renderer.render(scene, camera);
}