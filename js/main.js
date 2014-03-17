// Variables
var camera, scene, renderer, stats, container, oldTime, dt = 1 / 60;
var party;
var screens = {
    "mainMenu": document.getElementById("mainMenu"),
    "pauseMenu": document.getElementById("pauseMenu"),
    "gameOverMenu": document.getElementById("gameOverMenu"),
    "optionsMenu": document.getElementById("optionsMenu")
};
var screenManager = new ScreenManager(screens);

// Bootstrap
init();
screenManager.goTo("mainMenu");

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
}

function newParty() {
    screenManager.hide();

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

    // Pause party (space bar)
    document.addEventListener('keyup', function (event) {
        if (event.keyCode === 32) {
            pauseGame();
        }
    });

    render();
}

function pauseGame() {
    var pauseState = party.pause();

    if (pauseState) {
        screenManager.goTo("pauseMenu");
    } else {
        screenManager.hide();
    }
}

// Animate and Render the 3D Scene
function render(time) {
    // Sync physics with time
    dt = ((time - oldTime) / 1000) || dt;
    oldTime = time;

    party.update();

    requestAnimationFrame(render);

    // update the stats
    stats.update();

    renderer.render(scene, camera);
}
