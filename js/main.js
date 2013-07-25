// Variables
var camera, scene, renderer, stats, container;
var party;

// Bootstrap
init();
render();

// Init game
function init() {
    // Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container = document.body;
    container.appendChild(renderer.domElement);

    // Window resizing
    THREEx.WindowResize(renderer, camera);

    // Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    // Party
    party = new Party(
        scene,
        new Rules(),
        [
            {
                name: 'P1',
                controls: ['z', 'd', 'q'],
                position: 'left'
            },
            {
                name: 'P2',
                controls: ['up', 'right', 'left'],
                position: 'right'
            }
        ]
    );
    party.newGame();

    // Camera default position
    camera.position.y = 0;
    camera.position.z = 12;
}

// Animate and Render the 3D Scene
function render() {
    party.update();

    requestAnimationFrame(render);

    // update the stats
    stats.update();

    renderer.render(scene, camera);
}