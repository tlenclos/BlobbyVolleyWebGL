import _ from 'lodash';
import Stats from 'stats.js';
import THREE from 'three';
import THREExWindowResize from 'three-window-resize';
import screenfull from 'screenfull';
import ScreenManager from './screensManager';
import Party from './party';
import Rules from './rules';
import AssetManager from './assetManager';

const OrbitControls = require('./libs/ThreeOrbitControls')(THREE);

// Variables
const fixedTimeStep = 1 / 60;
const maxSubSteps = 10;
let lastTime;

let camera, scene, renderer, stats, container,
    party,
    request,
    initialized = false;

const screens = {
        "loadingMenu": document.getElementById("loadingMenu"),
        "mainMenu": document.getElementById("mainMenu"),
        "pauseMenu": document.getElementById("pauseMenu"),
        "gameOverMenu": document.getElementById("gameOverMenu"),
        "optionsMenu": document.getElementById("optionsMenu"),
        "videoMenu": document.getElementById("videoMenu"),
        "controlsMenu": document.getElementById("controlsMenu"),
        "rulesMenu": document.getElementById("rulesMenu")
    },
    screenManager = new ScreenManager(
        screens,
        document.getElementById("flashMessage"),
        document.getElementById("flashText")
    ),
    assetManager = new AssetManager(),
    scoreLeftDisplay = document.getElementById("scoreLeftDisplay"),
    scoreRightDisplay = document.getElementById("scoreRightDisplay"),
    serviceDisplay = document.getElementById("serviceDisplay"),
    scoreNeededToWinDisplay = document.getElementById("scoreNeededToWinDisplay"),
    maximumContactsAllowedDisplay = document.getElementById("maximumContactsAllowedDisplay"),
    videoParameterElements = screens['videoMenu'].querySelectorAll('.videoParameterElement'),
    controlsElements = screens['controlsMenu'].querySelectorAll('.controlKey'),
    rulesElements = screens['rulesMenu'].querySelectorAll('.ruleElement'),
    initPlayerControls = [
        {
            'up': 'z',
            'right': 'd',
            'left': 'q'
        },
        {
            'up': 'ArrowUp',
            'right': 'ArrowRight',
            'left': 'ArrowLeft'
        }
    ],
    rules = new Rules(),
    debug = false;

// Bootstrap
init();

// Init
function init () {
    if (initialized) {
        return;
    }

    initialized = true;

    // Load game
    screenManager.goTo("loadingMenu");
    loadGame();
}

// Load game
function loadGame () {
    // Assets
    assetManager.on('loaded', initGame);
    assetManager.on('error', (component, error) => {
        screenManager.getScreen('loadingMenu').classList.add('error');
        throw error;
    });
    assetManager.loadTexture('textures/wood.jpg');
    assetManager.loadTexture('textures/background.jpg');
    assetManager.loadTexture('textures/ball.jpg');
}

// Init game
function initGame () {
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
    camera.position.set(0, 4, 12);
    camera.rotation.x = -5 * Math.PI / 180;

    if (debug) {
        const controls = new OrbitControls( camera );
        controls.addEventListener( 'change', render );
    }

    // Window resizing
    THREExWindowResize(renderer, camera);

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

    /* Events */
    // Prevent F11 to toggle fullscreen, go to video options instead
    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 122) {
            event.preventDefault();
            screenManager.goTo('optionsMenu').goTo('videoMenu');
        }
    });

    // End game event listener
    window.addEventListener("endGame", function (e) {
        screenManager.displayFlashMessage(e.detail.message);
        pauseGame();

        screenManager.goTo("gameOverMenu");
    });

    // Score event listener
    window.addEventListener("score", updateScoreUI);

    // Video menu is displayed, listen keyboard event on inputs
    screenManager.on("videoMenu", function () {
        const onChange = function (e) {
            const input = e.target;
            const value = input.value;
            const name = input.getAttribute('data-parameter');

            // Fullscreen
            if (name === 'fullscreen' && screenfull.enabled) {
                screenfull.toggle();
                return;
            }

            rules.config[name] = value;
            input.value = value;
        };

        _.forEach(videoParameterElements, function (item) {
            const parameter = item.getAttribute('data-parameter');
            item.value = rules.config[parameter];

            if (_.isNull(item.onchange)) {
                item.onchange = onChange;
            }
        });
    });

    // Control menu is displayed, listen keyboard event on inputs
    screenManager.on("controlsMenu", function () {
        const keydownOnInputControl = function (e) {
            // Allow keyboard navigation
            if (_.includes(['Tab', 'Shift'], e.key)) {
                return;
            }

            const input = e.target;
            const player = parseInt(input.getAttribute('data-player'));
            const controlName = input.getAttribute('data-control');

            input.value = e.key;

            // TODO handle control configuration before the party is initialized
            initPlayerControls[player][controlName] = e.key;

            if (party) {
                party.players[player].setControlForKey(controlName, e.key);
            }

            return false;
        };

        _.forEach(controlsElements, function (item) {
            const player = parseInt(item.getAttribute('data-player'));
            const controlName = item.getAttribute('data-control');
            item.value = initPlayerControls[player][controlName];

            if (_.isNull(item.onkeydown)) {
                item.onkeydown = keydownOnInputControl;
            }
        });
    });

    // Rules menu is displayed, listen keyboard event on inputs
    screenManager.on("rulesMenu", function () {
        const keydownOnInputControl = function (e) {
            const input = e.target;
            const ruleValue = parseInt(input.value);
            const ruleName = input.getAttribute('data-ruleName');
            rules.config[ruleName] = ruleValue;
            input.value = ruleValue;
        };

        _.forEach(rulesElements, function (item) {
            const ruleName = item.getAttribute('data-ruleName');
            item.value = rules.config[ruleName];

            if (_.isNull(item.onkeyup)) {
                item.onkeyup = keydownOnInputControl;
            }
        });
    });

    // Display main menu
    screenManager.goTo("mainMenu");
}

function newParty () {
    screenManager.hide();
    screenManager.displayFlashMessage("Game starts !");

    updateRulesUI();

    // Party
    party = new Party(
        scene,
        rules,
        [
            {
                name: 'P1',
                controls: initPlayerControls[0],
                position: 'left'
            },
            {
                name: 'P2',
                controls: initPlayerControls[1],
                position: 'right'
            }
        ]
    );
    party.newGame();

    render();
}

function pauseGame () {
    if (!party.inProgress) {
        return;
    }

    const pauseState = party.pause();

    if (pauseState) {
        screenManager.goTo("pauseMenu");
    } else {
        screenManager.hide();
    }
}

function updateRulesUI () {
    scoreNeededToWinDisplay.textContent = rules.config.scoreToWin;
    maximumContactsAllowedDisplay.textContent = rules.config.maximumContactsAllowed;
}

function updateScoreUI (event) {
    const winSide = event.detail.side,
        scores = event.detail.scores;

    scoreLeftDisplay.textContent = scores.left;
    scoreRightDisplay.textContent = scores.right;
    serviceDisplay.className = winSide;
    serviceDisplay.textContent = winSide.charAt(0).toUpperCase() + winSide.slice(1);
}

// Animation loop
function renderLoop (time) {
    request = requestAnimationFrame(renderLoop);

    // Sync physics with time (compute elapsed time since last render frame)
    const deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

    party.update(fixedTimeStep, deltaTime, maxSubSteps);

    // Update stats
    stats.update();

    renderer.render(scene, camera);
}

// Launch animation
function render () {
    if (!_.isUndefined(request)) {
        cancelAnimationFrame(request);
    }

    request = requestAnimationFrame(renderLoop);
}

// FIXME Do not store into window
window.newParty = newParty;
window.pauseGame = pauseGame;
window.screenManager = screenManager;
window.assetManager = assetManager;
