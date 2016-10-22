define(function (require) {
    const _ = require('lodash'),
        ScreenManager = require('./screensManager'),
        Party = require('./party'),
        Rules = require('./rules');

    // Variables
    let camera, scene, renderer, stats, container, oldTime,
        party,
        screens = {
            "mainMenu": document.getElementById("mainMenu"),
            "pauseMenu": document.getElementById("pauseMenu"),
            "gameOverMenu": document.getElementById("gameOverMenu"),
            "optionsMenu": document.getElementById("optionsMenu"),
            "controlsMenu": document.getElementById("controlsMenu"),
            "rulesMenu": document.getElementById("rulesMenu")
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
        scoreNeededToWinDisplay = document.getElementById("scoreNeededToWinDisplay"),
        maximumContactsAllowedDisplay = document.getElementById("maximumContactsAllowedDisplay"),
        controlsElements = screens['controlsMenu'].querySelectorAll('.controlKey'),
        rulesElements = screens['rulesMenu'].querySelectorAll('.ruleElement'),
        initPlayerControls = [
            {
                'up': 'z',
                'right': 'd',
                'left': 'q'
            },
            {
                'up': 'up',
                'right': 'right',
                'left': 'left'
            }
        ],
        rules = new Rules(),
        debug = false
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
        camera.position.set(0, 4, 12);
        camera.rotation.x = -5 * Math.PI / 180;

        if (debug) {
            const controls = new THREE.OrbitControls( camera );
            controls.addEventListener( 'change', render );
        }

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

        /* Events */
        // End game event listener
        window.addEventListener("endGame", function(e) {
            screenManager.displayFlashMessage(e.detail.message);
            pauseGame();

            screenManager.goTo("gameOverMenu");
        });

        // Score event listener
        window.addEventListener("score", updateScoreUI);

        // Control menu is displayed, listen keyboard event on inputs
        screenManager.on("controlsMenu", function() {
            const keydownOnInputControl = function(e) {
                const input = e.srcElement;
                const player = parseInt(input.getAttribute('data-player'));
                const controlName = input.getAttribute('data-control');
                const keyTextValue = keycodeDictionary[e.keyCode];

                input.value = keyTextValue;

                // TODO handle control configuration before the party is initialized
                initPlayerControls[player][controlName] = keyTextValue;

                if (party) {
                    const control = {};
                    control[controlName] = keyTextValue;
                    party.players[player].setControls(control)
                }

                return false;
            };

            _.forEach(controlsElements, function(item) {
                const player = parseInt(item.getAttribute('data-player'));
                const controlName = item.getAttribute('data-control');
                item.value = initPlayerControls[player][controlName];

                if (_.isNull(item.onkeydown)) {
                    item.onkeydown = keydownOnInputControl;
                }
            });
        });

        // Rules menu is displayed, listen keyboard event on inputs
        screenManager.on("rulesMenu", function() {
            const keydownOnInputControl = function(e) {
                const input = e.srcElement;
                const ruleValue = parseInt(input.value);
                const ruleName = input.getAttribute('data-ruleName');
                rules.config[ruleName] = ruleValue;
                input.value = ruleValue;
            };

            _.forEach(rulesElements, function(item) {
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

    function newParty() {
        screenManager.hide();
        screenManager.displayFlashMessage("Game starts !");

        updateRulesUI(rules);

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

    function pauseGame() {
        if (!party.inProgress)
            return;

        const pauseState = party.pause();

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
        const winSide = event.detail.side,
            scores = event.detail.scores
        ;

        scoreLeftDisplay.textContent = scores.left;
        scoreRightDisplay.textContent = scores.right;
        serviceDisplay.className = winSide;
        serviceDisplay.textContent = winSide.charAt(0).toUpperCase() + winSide.slice(1);
    }

    // Animation loop
    function renderLoop(time) {
        // Sync physics with time
        window.dt = ((time - oldTime) / 1000) || window.dt; // FIXME Do not store dt into window
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

        window.dt = 1 / 60;

        renderLoop();
    }

    // FIXME Do not store into window
    window.newParty = newParty;
    window.pauseGame = pauseGame;
    window.screenManager = screenManager;
});
