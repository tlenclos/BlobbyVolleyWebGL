// Variables
var camera, scene, renderer, stats, container, oldTime, dt,
    party,
    screens = {
        "mainMenu": document.getElementById("mainMenu"),
        "pauseMenu": document.getElementById("pauseMenu"),
        "gameOverMenu": document.getElementById("gameOverMenu"),
        "optionsMenu": document.getElementById("optionsMenu")
    },
    screenManager = new ScreenManager(
        screens,
        document.getElementById("flashMessage"),
        document.getElementById("flashText")
    ),
    request,
    initialized = false,
    scoreLeftDisplay = document.getElementById("scoreLeftDisplay"),
    scoreRightDisplay = document.getElementById("scoreRightDisplay"),
    serviceDisplay = document.getElementById("serviceDisplay"),
    scoreNeededToWinDisplay = document.getElementById("scoreNeededToWinDisplay")
    maximumContactsAllowedDisplay = document.getElementById("maximumContactsAllowedDisplay")
;

// Bootstrap
init();

// Init game
function init() {
    if (initialized) {
        return;
    }

    initialized = true;

    // Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.clear();
    container = document.body;
    container.appendChild(renderer.domElement);

    // Camera default position
    camera.position.set(0, 0, 12);

    // Window resizing
    THREEx.WindowResize(renderer, camera);

    // Stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    // Pause party (space bar)
    document.addEventListener('keyup', function (event) {
        if (event.keyCode === 32) {
            pauseGame();
        }
    });

    // End game event listener
    window.addEventListener("endGame", function(e) {
        screenManager.displayFlashMessage(e.detail.message);
        pauseGame();

        screenManager.goTo("gameOverMenu");
    });

    // Score event listener
    window.addEventListener("score", updateScoreUI);

    // Display main menu
    screenManager.goTo("mainMenu");
}

function newParty() {
    screenManager.hide();
    screenManager.displayFlashMessage("Game starts !");
    resetScoreUI();

    // Rules
    var rules = new Rules();
    updateRulesUI(rules);

    // Party
    party = new Party(
        scene,
        rules,
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

function updateRulesUI(rules) {
    scoreNeededToWinDisplay.textContent = rules.config.scoreToWin;
    maximumContactsAllowedDisplay.textContent = rules.config.maximumContactsAllowed;
}

function updateScoreUI(event) {
    var
        winSide = event.detail.side,
        scored = event.detail.scored,
        scoreDisplay
    ;

    if (winSide == "left") {
        scoreDisplay = scoreLeftDisplay;
    } else {
        scoreDisplay = scoreRightDisplay;
    }

    if (scored) {
        scoreDisplay.textContent = parseInt(scoreDisplay.textContent)+1;
    } else {
        serviceDisplay.className = winSide;
        serviceDisplay.textContent = winSide.charAt(0).toUpperCase() + winSide.slice(1);
    }
}

function resetScoreUI() {
    scoreLeftDisplay.textContent = 0;
    scoreRightDisplay.textContent = 0;
    serviceDisplay.textContent = "Left";
}

// Animation loop
function renderLoop(time) {
    // Sync physics with time
    dt = ((time - oldTime) / 1000) || dt;
    oldTime = time;

    party.update();

    request = requestAnimationFrame(renderLoop);

    // update the stats
    stats.update();

    renderer.render(scene, camera);
}

// Launch animation
function render() {
    if (!_.isUndefined(request)) {
        cancelAnimationFrame(request);
    }

    dt = 1 / 60;

    renderLoop();
}