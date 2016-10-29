(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("assetManager.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _eventEmitter = require('./eventEmitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AssetManager = function (_EventEmitter) {
    _inherits(AssetManager, _EventEmitter);

    function AssetManager() {
        _classCallCheck(this, AssetManager);

        var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

        _this.assets = {};
        _this.loadingManager = new _three2.default.LoadingManager();
        _this.loadingManager.onLoad = _this._loaded.bind(_this);
        _this.loadingManager.onProgress = _this._progressing.bind(_this);
        _this.loadingManager.onError = _this._error.bind(_this);
        _this.textureLoader = new _three2.default.TextureLoader(_this.loadingManager);
        return _this;
    }

    AssetManager.prototype._loaded = function _loaded() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        this.dispatch.apply(this, ['loaded'].concat(args));
    };

    AssetManager.prototype._progressing = function _progressing() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        this.dispatch.apply(this, ['progress'].concat(args));
    };

    AssetManager.prototype._error = function _error() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        this.dispatch.apply(this, ['error'].concat(args));
    };

    AssetManager.prototype.loadTexture = function loadTexture(path) {
        var _this2 = this;

        this.textureLoader.load(path, function (texture) {
            return _this2.set(path.replace(/\.[^.]+$/, '').replace('/', '.'), texture);
        });
    };

    AssetManager.prototype.has = function has(path) {
        return _lodash2.default.has(this.assets, path);
    };

    AssetManager.prototype.get = function get(path) {
        return _lodash2.default.get(this.assets, path);
    };

    AssetManager.prototype.set = function set(path, asset) {
        _lodash2.default.set(this.assets, path, asset);
        return this;
    };

    return AssetManager;
}(_eventEmitter2.default);

exports.default = AssetManager;
module.exports = exports['default'];

});

require.register("ball.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _sound = require('./sound');

var _sound2 = _interopRequireDefault(_sound);

var _p = require('p2');

var _p2 = _interopRequireDefault(_p);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ball = function () {
    function Ball(world, color, spawnPosition) {
        _classCallCheck(this, Ball);

        this.world = world;
        this.color = color;
        this.spawnPosition = spawnPosition;
        this.radius = 1.1; // TODO : If we reduce the radius the ball can be stuck against a wall and the blob can't move it
        this.maxSpeed = 12;
        this.fixture = null;
        this.material = null;
        this.threeObject = null;
        this.sound = null;
        this._isHavingContact = false;
        this._isTouchingGround = false;

        this.init();
    }

    Ball.prototype.init = function init() {
        var body = new _p2.default.Body({
            mass: 1,
            position: this.spawnPosition
        });

        body.userData = 'type_ball';

        var shape = new _p2.default.Circle({
            radius: this.radius
        });

        body.addShape(shape);
        body.setDensity(1);

        this.material = new _p2.default.Material();
        shape.material = this.material;

        this.world.addBody(body);
        this.fixture = body;

        this.world.on('beginContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            this._isHavingContact = true;

            if (event.bodyA.userData === 'type_ground' || event.bodyB.userData === 'type_ground') {
                this._isTouchingGround = true;
            }
        }.bind(this));

        this.world.on('endContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            this._isHavingContact = false;

            if (event.bodyA.userData === 'type_ground' || event.bodyB.userData === 'type_ground') {
                this._isTouchingGround = false;
            }
        }.bind(this));

        var texture = window.assetManager.get('textures.ball');
        var geometry = new _three2.default.SphereGeometry(this.radius, 64, 64);
        var material = new _three2.default.MeshPhongMaterial({
            map: texture,
            bumpMap: texture,
            bumpScale: 0.01
        });
        this.threeObject = new _three2.default.Mesh(geometry, material);
        this.threeObject.rotation.x += 90 * Math.PI / 180;

        this.sound = new _sound2.default(['sounds/ball.mp3', 'sounds/ball.ogg']);
    };

    Ball.prototype.getFixture = function getFixture() {
        return this.fixture;
    };

    Ball.prototype.physics = function physics() {
        var body = this.fixture,
            pos = body.position,
            velocity = body.velocity,
            speed = _p2.default.vec2.length(velocity);

        if (speed > this.maxSpeed) {
            body.velocity = [this.maxSpeed / speed * velocity[0], this.maxSpeed / speed * velocity[1]];
        }

        this.threeObject.position.x = pos[0];
        this.threeObject.position.y = pos[1];

        if (this.hasTouchingContact()) {
            this.sound.play(true);
        }
    };

    Ball.prototype.hasTouchingContact = function hasTouchingContact() {
        return this._isHavingContact;
    };

    Ball.prototype.isTouchingGround = function isTouchingGround() {
        return this._isTouchingGround;
    };

    Ball.prototype.moveTo = function moveTo(position) {
        this.fixture.position = position;
        this.fixture.velocity = [0, 0];
    };

    return Ball;
}();

exports.default = Ball;
module.exports = exports['default'];

});

require.register("blob.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _p = require('p2');

var _p2 = _interopRequireDefault(_p);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Blob = function () {
    function Blob(world, color, spawnPosition) {
        _classCallCheck(this, Blob);

        this.world = world;
        this.color = color;
        this.spawnPosition = spawnPosition;
        this.fixture = null;
        this.material = null;
        this.threeObject = null;
        this.radius = 1;
        this.speed = 5;
        this.jumpAllowed = false;
        this._isTouchingGround = false;
        this._isTouchingBall = false;

        this.init();
    }

    Blob.prototype.init = function init() {
        var body = new _p2.default.Body({
            mass: 100,
            fixedRotation: true,
            position: this.spawnPosition
        });

        var shape = new _p2.default.Circle({
            radius: this.radius
        });

        body.addShape(shape);
        body.setDensity(100);

        this.material = new _p2.default.Material();
        shape.material = this.material;

        this.world.addBody(body);
        this.fixture = body;

        this.world.on('beginContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            if (event.bodyA.userData === 'type_ground' || event.bodyB.userData === 'type_ground') {
                this._isTouchingGround = true;
            } else if (event.bodyA.userData === 'type_ball' || event.bodyB.userData === 'type_ball') {
                this._isTouchingBall = true;
            }
        }.bind(this));

        this.world.on('endContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            if (event.bodyA.userData === 'type_ground' || event.bodyB.userData === 'type_ground') {
                this._isTouchingGround = false;
            } else if (event.bodyA.userData === 'type_ball' || event.bodyB.userData === 'type_ball') {
                this._isTouchingBall = false;
            }
        }.bind(this));

        var geometry = new _three2.default.CylinderGeometry(this.radius, this.radius, 1, 7, 1, false);
        var material = new _three2.default.MeshBasicMaterial({ color: this.color });
        this.threeObject = new _three2.default.Mesh(geometry, material);
        this.threeObject.rotation.x += 90 * Math.PI / 180;
    };

    Blob.prototype.getFixture = function getFixture() {
        return this.fixture;
    };

    Blob.prototype.move = function move(x, y) {
        // Vertical jump
        if (y > 0) {
            this.handleJump();
        }

        // Horizontal move
        if (x !== 0) {
            var body = this.fixture,
                vel = body.velocity,
                velDelta = this.speed * x - vel[0],
                force = body.mass * velDelta / (1 / 60); // TODO 1/60 could change (see main)

            body.applyForce([force, 0]);
        }
    };

    Blob.prototype.handleJump = function handleJump() {
        var body = this.fixture,
            yVelocity = body.velocity[1];

        // Allow jumping
        if (!this.jumpAllowed && yVelocity < 0.00001 && this.isTouchingGround()) {
            this.jumpAllowed = true;
        }

        // Jumping
        if (this.jumpAllowed) {
            body.applyImpulse(_p2.default.vec2.fromValues(0, 9 * this.fixture.mass));

            // Prevent jumping
            this.jumpAllowed = false;
        }
    };

    Blob.prototype.isTouchingGround = function isTouchingGround() {
        return this._isTouchingGround;
    };

    Blob.prototype.isTouchingBall = function isTouchingBall() {
        return this._isTouchingBall;
    };

    Blob.prototype.physics = function physics() {
        var pos = this.fixture.position;
        this.threeObject.position.x = pos[0];
        this.threeObject.position.y = pos[1];
    };

    Blob.prototype.moveTo = function moveTo(position) {
        this.fixture.position = position;
        this.fixture.velocity = [0, 0];
    };

    return Blob;
}();

exports.default = Blob;
module.exports = exports['default'];

});

require.register("eventEmitter.js", function(exports, require, module) {
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = function () {
    function EventEmitter() {
        _classCallCheck(this, EventEmitter);

        this.listeners = {};
    }

    EventEmitter.prototype.on = function on(eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(listener);
    };

    EventEmitter.prototype.dispatch = function dispatch(eventName) {
        if (this.listeners[eventName]) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            for (var i = 0; i < this.listeners[eventName].length; i++) {
                var _listeners$eventName;

                (_listeners$eventName = this.listeners[eventName])[i].apply(_listeners$eventName, [this].concat(args));
            }
        }
    };

    return EventEmitter;
}();

exports.default = EventEmitter;
module.exports = exports["default"];

});

require.register("field.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _p = require('p2');

var _p2 = _interopRequireDefault(_p);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Field = function () {
    function Field(world, x, y, width, height) {
        _classCallCheck(this, Field);

        this.world = world;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.position = { x: x, y: y };
        this.dims = [width, height];
        this.parts = [];
        this.materials = [];

        this.init();
    }

    Field.prototype.init = function init() {
        var ground = this.createWall(this.x, this.y - this.height / 2 - 0.5, this.width, 1, 20, window.assetManager.get('textures.wood'), 0xEEEEEE, null, 'type_ground');

        var leftWall = this.createWall(this.x - this.width / 2 - 0.5, this.y + this.height / 2, 1, this.height * 2, 20, null, 0xDEDEDE, 0);

        var rightWall = this.createWall(this.x + this.width / 2 + 0.5, this.y + this.height / 2, 1, this.height * 2, 20, null, 0xDEDEDE, 0);

        var net = this.createWall(this.x, this.y - this.height / 2 + this.height / 4, 0.3, this.height / 2, 20, null, 0xDEDEDE, 0.8);

        // Background
        var bg = new _three2.default.Mesh(new _three2.default.PlaneGeometry(110, 90, 0), new _three2.default.MeshBasicMaterial({ map: window.assetManager.get('textures.background') }));

        bg.position.z = -20;
        bg.position.y = 12;

        this.parts.push(ground, leftWall, rightWall, net, bg);
    };

    Field.prototype.createWall = function createWall(x, y, width, height, depth, texture, color, opacity, userData) {
        var body = new _p2.default.Body({
            mass: 0,
            position: [x, y]
        });

        if (typeof userData !== 'undefined') {
            body.userData = userData;
        }

        var shape = new _p2.default.Box({
            width: width,
            height: height
        });

        body.addShape(shape);
        body.setDensity(1);

        var physicsMaterial = new _p2.default.Material();

        shape.material = physicsMaterial;
        this.materials.push(physicsMaterial);

        this.world.addBody(body);

        var geometry = width > height ? new _three2.default.BoxGeometry(width, height, _lodash2.default.isNumber(depth) ? depth : 0) : new _three2.default.BoxGeometry(width, height, _lodash2.default.isNumber(depth) ? depth : 0);

        var material = void 0;

        if (texture instanceof _three2.default.Texture) {
            material = new _three2.default.MeshBasicMaterial({
                map: texture,
                transparent: true
            });
        } else {
            material = new _three2.default.MeshBasicMaterial({
                color: !_lodash2.default.isUndefined(color) ? color : 0x000000,
                opacity: !_lodash2.default.isUndefined(opacity) ? opacity : 1,
                transparent: true
            });
        }

        var mesh = new _three2.default.Mesh(geometry, material);
        mesh.position.x = body.position[0];
        mesh.position.y = body.position[1];

        return mesh;
    };

    Field.prototype.getWorld = function getWorld() {
        return this.world;
    };

    Field.prototype.getPosition = function getPosition() {
        return this.position;
    };

    Field.prototype.getDims = function getDims() {
        return this.dims;
    };

    Field.prototype.getParts = function getParts() {
        return this.parts;
    };

    return Field;
}();

exports.default = Field;
module.exports = exports['default'];

});

require.register("keyboardState.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeyboardState = function () {
    function KeyboardState(element) {
        _classCallCheck(this, KeyboardState);

        this.target = element || document;
        this.pressedKeys = new Set();
        this._onKeydownBound = this._onKeydown.bind(this);
        this._onKeyupBound = this._onKeyup.bind(this);

        this.target.addEventListener('keydown', this._onKeydownBound, false);
        this.target.addEventListener('keyup', this._onKeyupBound, false);
    }

    KeyboardState.prototype._onKeydown = function _onKeydown(event) {
        this.pressedKeys.add(event.key);
    };

    KeyboardState.prototype._onKeyup = function _onKeyup(event) {
        this.pressedKeys.delete(event.key);
    };

    KeyboardState.prototype.pressed = function pressed(key) {
        return this.pressedKeys.has(key);
    };

    KeyboardState.prototype.destroy = function destroy() {
        this.target.removeEventListener('keydown', this._onKeydownBound, false);
        this.target.removeEventListener('keyup', this._onKeyupBound, false);
    };

    return KeyboardState;
}();

exports.default = KeyboardState;
module.exports = exports['default'];

});

require.register("main.js", function(exports, require, module) {
'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _stats = require('stats.js');

var _stats2 = _interopRequireDefault(_stats);

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _threeWindowResize = require('three-window-resize');

var _threeWindowResize2 = _interopRequireDefault(_threeWindowResize);

var _screenfull = require('screenfull');

var _screenfull2 = _interopRequireDefault(_screenfull);

var _screensManager = require('./screensManager');

var _screensManager2 = _interopRequireDefault(_screensManager);

var _party = require('./party');

var _party2 = _interopRequireDefault(_party);

var _rules = require('./rules');

var _rules2 = _interopRequireDefault(_rules);

var _assetManager = require('./assetManager');

var _assetManager2 = _interopRequireDefault(_assetManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OrbitControls = require('three-orbit-controls')(_three2.default);

// Variables
var fixedTimeStep = 1 / 60;
var maxSubSteps = 10;
var lastTime = void 0;

var camera = void 0,
    scene = void 0,
    renderer = void 0,
    stats = void 0,
    container = void 0,
    party = void 0,
    request = void 0,
    initialized = false;

var screens = {
    "loadingMenu": document.getElementById("loadingMenu"),
    "mainMenu": document.getElementById("mainMenu"),
    "pauseMenu": document.getElementById("pauseMenu"),
    "gameOverMenu": document.getElementById("gameOverMenu"),
    "optionsMenu": document.getElementById("optionsMenu"),
    "videoMenu": document.getElementById("videoMenu"),
    "controlsMenu": document.getElementById("controlsMenu"),
    "rulesMenu": document.getElementById("rulesMenu")
},
    screenManager = new _screensManager2.default(screens, document.getElementById("flashMessage"), document.getElementById("flashText")),
    assetManager = new _assetManager2.default(),
    scoreLeftDisplay = document.getElementById("scoreLeftDisplay"),
    scoreRightDisplay = document.getElementById("scoreRightDisplay"),
    serviceDisplay = document.getElementById("serviceDisplay"),
    scoreNeededToWinDisplay = document.getElementById("scoreNeededToWinDisplay"),
    maximumContactsAllowedDisplay = document.getElementById("maximumContactsAllowedDisplay"),
    videoParameterElements = screens['videoMenu'].querySelectorAll('.videoParameterElement'),
    controlsElements = screens['controlsMenu'].querySelectorAll('.controlKey'),
    rulesElements = screens['rulesMenu'].querySelectorAll('.ruleElement'),
    initPlayerControls = [{
    'up': 'z',
    'right': 'd',
    'left': 'q'
}, {
    'up': 'ArrowUp',
    'right': 'ArrowRight',
    'left': 'ArrowLeft'
}],
    rules = new _rules2.default(),
    debug = false;

// Bootstrap
init();

// Init
function init() {
    if (initialized) {
        return;
    }

    initialized = true;

    // Load game
    screenManager.goTo("loadingMenu");
    loadGame();
}

// Load game
function loadGame() {
    // Assets
    assetManager.on('loaded', initGame);
    assetManager.on('error', function (component, error) {
        screenManager.getScreen('loadingMenu').classList.add('error');
        throw error;
    });
    assetManager.loadTexture('textures/wood.jpg');
    assetManager.loadTexture('textures/background.jpg');
    assetManager.loadTexture('textures/ball.jpg');
}

// Init game
function initGame() {
    // Scene
    scene = new _three2.default.Scene();
    camera = new _three2.default.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new _three2.default.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.clear();
    container = document.body;
    container.appendChild(renderer.domElement);

    // Camera default position
    camera.position.set(0, 4, 12);
    camera.rotation.x = -5 * Math.PI / 180;

    if (debug) {
        var controls = new OrbitControls(camera);
        controls.addEventListener('change', render);
    }

    // Window resizing
    (0, _threeWindowResize2.default)(renderer, camera);

    // Stats
    stats = new _stats2.default();
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
        var onChange = function onChange(e) {
            var input = e.target;
            var value = input.value;
            var name = input.getAttribute('data-parameter');

            // Fullscreen
            if (name === 'fullscreen' && _screenfull2.default.enabled) {
                _screenfull2.default.toggle();
                return;
            }

            rules.config[name] = value;
            input.value = value;
        };

        _lodash2.default.forEach(videoParameterElements, function (item) {
            var parameter = item.getAttribute('data-parameter');
            item.value = rules.config[parameter];

            if (_lodash2.default.isNull(item.onchange)) {
                item.onchange = onChange;
            }
        });
    });

    // Control menu is displayed, listen keyboard event on inputs
    screenManager.on("controlsMenu", function () {
        var keydownOnInputControl = function keydownOnInputControl(e) {
            // Allow keyboard navigation
            if (_lodash2.default.includes(['Tab', 'Shift'], e.key)) {
                return;
            }

            var input = e.target;
            var player = parseInt(input.getAttribute('data-player'));
            var controlName = input.getAttribute('data-control');

            input.value = e.key;

            // TODO handle control configuration before the party is initialized
            initPlayerControls[player][controlName] = e.key;

            if (party) {
                party.players[player].setControlForKey(controlName, e.key);
            }

            return false;
        };

        _lodash2.default.forEach(controlsElements, function (item) {
            var player = parseInt(item.getAttribute('data-player'));
            var controlName = item.getAttribute('data-control');
            item.value = initPlayerControls[player][controlName];

            if (_lodash2.default.isNull(item.onkeydown)) {
                item.onkeydown = keydownOnInputControl;
            }
        });
    });

    // Rules menu is displayed, listen keyboard event on inputs
    screenManager.on("rulesMenu", function () {
        var keydownOnInputControl = function keydownOnInputControl(e) {
            var input = e.target;
            var ruleValue = parseInt(input.value);
            var ruleName = input.getAttribute('data-ruleName');
            rules.config[ruleName] = ruleValue;
            input.value = ruleValue;
        };

        _lodash2.default.forEach(rulesElements, function (item) {
            var ruleName = item.getAttribute('data-ruleName');
            item.value = rules.config[ruleName];

            if (_lodash2.default.isNull(item.onkeyup)) {
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

    updateRulesUI();

    // Party
    party = new _party2.default(scene, rules, [{
        name: 'P1',
        controls: initPlayerControls[0],
        position: 'left'
    }, {
        name: 'P2',
        controls: initPlayerControls[1],
        position: 'right'
    }]);
    party.newGame();

    render();
}

function pauseGame() {
    if (!party.inProgress) {
        return;
    }

    var pauseState = party.pause();

    if (pauseState) {
        screenManager.goTo("pauseMenu");
    } else {
        screenManager.hide();
    }
}

function updateRulesUI() {
    scoreNeededToWinDisplay.textContent = rules.config.scoreToWin;
    maximumContactsAllowedDisplay.textContent = rules.config.maximumContactsAllowed;
}

function updateScoreUI(event) {
    var winSide = event.detail.side,
        scores = event.detail.scores;

    scoreLeftDisplay.textContent = scores.left;
    scoreRightDisplay.textContent = scores.right;
    serviceDisplay.className = winSide;
    serviceDisplay.textContent = winSide.charAt(0).toUpperCase() + winSide.slice(1);
}

// Animation loop
function renderLoop(time) {
    request = requestAnimationFrame(renderLoop);

    // Sync physics with time (compute elapsed time since last render frame)
    var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

    party.update(fixedTimeStep, deltaTime, maxSubSteps);

    // Update stats
    stats.update();

    renderer.render(scene, camera);
}

// Launch animation
function render() {
    if (!_lodash2.default.isUndefined(request)) {
        cancelAnimationFrame(request);
    }

    request = requestAnimationFrame(renderLoop);
}

// FIXME Do not store into window
window.newParty = newParty;
window.pauseGame = pauseGame;
window.screenManager = screenManager;
window.assetManager = assetManager;

});

require.register("party.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _p = require('p2');

var _p2 = _interopRequireDefault(_p);

var _ball = require('./ball');

var _ball2 = _interopRequireDefault(_ball);

var _blob = require('./blob');

var _blob2 = _interopRequireDefault(_blob);

var _field = require('./field');

var _field2 = _interopRequireDefault(_field);

var _player = require('./player');

var _player2 = _interopRequireDefault(_player);

var _physics = require('./physics');

var _physics2 = _interopRequireDefault(_physics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Party = function () {
    function Party(scene, rules, playersConfig) {
        _classCallCheck(this, Party);

        this.scene = scene;
        this.rules = rules;
        this.playersConfig = playersConfig;
        this.physics = null;
        this.field = null;
        this.players = null;
        this.ball = null;
        this.scores = null;
        this.paused = false;
        this.lockPause = false;
        this.playingSide = null;
        this.servingSide = null;
        this.inProgress = null;

        this.init();
    }

    Party.prototype.init = function init() {
        this.resetScore();
    };

    Party.prototype.clear = function clear() {
        // Clear players
        _lodash2.default.each(this.players, function (player) {
            return player.keyboard.destroy();
        });

        // Clear scene
        this.clearScene();

        // Reset score
        this.resetScore();
    };

    Party.prototype.clearScene = function clearScene() {
        for (var i = this.scene.children.length - 1; i >= 0; i--) {
            var obj = this.scene.children[i];
            this.scene.remove(obj);
        }
    };

    Party.prototype.resetScore = function resetScore() {
        this.scores = {
            left: 0,
            right: 0
        };

        // Dispatch score event
        window.dispatchEvent(new CustomEvent('score', { detail: { side: 'left', scores: this.scores } }));
    };

    Party.prototype.newGame = function newGame() {
        // Clear
        this.clear();

        // Lightning
        // TODO Better lightning
        var light = new _three2.default.HemisphereLight(0xffffff, 0xffffff, 1);
        this.scene.add(light);

        // Physics
        this.physics = new _physics2.default(10);

        // Field
        this.field = new _field2.default(this.physics.getWorld(), 0, 0, 22, 10);

        // Players
        this.players = [];

        for (var index in this.playersConfig) {
            var playerConfig = this.playersConfig[index];
            var position = [playerConfig.position === 'left' ? -5 : 5, -4];
            var color = playerConfig.position === 'left' ? 0xff0000 : 0x0000ff;

            var blob = new _blob2.default(this.physics.getWorld(), color, position);
            var player = new _player2.default(playerConfig.name, playerConfig.controls, playerConfig.position);

            player.attachBlob(blob);
            this.players.push(player);
        }

        // Ball
        this.ball = new _ball2.default(this.physics.getWorld(), 0xff000, [-5, 5]);

        // Declare interactions between materials
        this._declareMaterialsInteractions();

        // Serving side
        this.servingSide = 'left';

        // Add all meshes to the scene
        var meshes = [].concat(this.field.getParts(), _lodash2.default.map(this.players, function (player) {
            return player.getBlob().threeObject;
        }), [this.ball.threeObject]);

        for (var i in meshes) {
            this.scene.add(meshes[i]);
        }

        if (this.paused) {
            this.pause(false);
        }

        this.inProgress = true;
    };

    Party.prototype.endGame = function endGame() {
        this.inProgress = false;

        window.dispatchEvent(new CustomEvent('endGame', { detail: { message: _lodash2.default.invert(this.scores)[_lodash2.default.max(_lodash2.default.values(this.scores))] + ' player wins' } }));
    };

    Party.prototype.afterScoring = function afterScoring(winSide) {
        this.playingSide = null;
        var resetObjects = true;

        // Internal pause
        this.pause(true);
        this.lockPause = true;

        if (winSide === this.servingSide) {
            this.incrementScore(winSide);

            // End of game
            var maxScore = _lodash2.default.max(_lodash2.default.values(this.scores)),
                minScore = _lodash2.default.min(_lodash2.default.values(this.scores));

            if (maxScore >= this.rules.config.scoreToWin && maxScore - minScore > 1) {
                this.endGame();
                resetObjects = false;
            }
        } else {
            this.servingSide = winSide;
        }

        // Dispatch score event
        window.dispatchEvent(new CustomEvent('score', { detail: { side: winSide, scores: this.scores } }));

        if (resetObjects) {
            // Reset objects
            this.ball.moveTo([winSide === 'left' ? -5 : 5, 5]);

            _lodash2.default.forEach(this.players, function (player) {
                player.blob.moveTo([player.side === 'left' ? -5 : 5, -4]);
            });

            _lodash2.default.delay(function () {
                this.lockPause = false;
                this.pause(false);
            }.bind(this), 1000);
        }
    };

    Party.prototype.pause = function pause(_pause) {
        if (this.lockPause) {
            throw new Error('Pause is locked');
        }

        this.paused = !_lodash2.default.isUndefined(_pause) ? Boolean(_pause) : !this.paused;
        return this.paused;
    };

    Party.prototype.update = function update(fixedTimeStep, deltaTime, maxSubSteps) {
        if (this.paused || !this.inProgress) {
            return;
        }

        this.applyRules();

        for (var i in this.players) {
            this.players[i].listenInput();
            this.players[i].getBlob().physics();
        }

        this.ball.physics();
        this.physics.step(fixedTimeStep, deltaTime, maxSubSteps);
    };

    Party.prototype.applyRules = function applyRules() {
        var winSide = null,
            resetTouches = false;

        // Ball touching ground
        if (this.ball.isTouchingGround()) {
            winSide = this.ball.threeObject.position.x > 0 ? 'left' : 'right';

            // Counting maximum touches
        } else {
            _lodash2.default.forEach(this.players, function (player) {
                if (player.getBlob().isTouchingBall()) {
                    player.currentTouches++;

                    if (player.side !== this.playingSide) {
                        // Switching side, reset touches
                        if (!_lodash2.default.isNull(this.playingSide)) {
                            resetTouches = true;
                        }

                        this.playingSide = player.side;
                    }
                }

                // Maximum touches reached
                if (player.currentTouches > this.rules.config.maximumContactsAllowed) {
                    winSide = player.side === 'right' ? 'left' : 'right';
                    resetTouches = true;
                }
            }.bind(this));
        }

        // Reset touches count
        if (resetTouches) {
            _lodash2.default.forEach(this.players, function (player) {
                player.currentTouches = 0;
            });
        }

        // We have a winner for this round
        if (winSide) {
            this.afterScoring(winSide);
        }
    };

    Party.prototype.incrementScore = function incrementScore(side) {
        this.scores[side]++;
    };

    Party.prototype._declareMaterialsInteractions = function _declareMaterialsInteractions() {
        var _this = this;

        var world = this.physics.getWorld();

        _lodash2.default.each(this.players, function (player) {
            // Interaction blob vs ball
            world.addContactMaterial(new _p2.default.ContactMaterial(player.blob.material, _this.ball.material, {
                friction: 0,
                restitution: 1.1
            }));

            // Interaction blob vs ground
            world.addContactMaterial(new _p2.default.ContactMaterial(player.blob.material, _this.field.materials[0], {
                friction: 2,
                restitution: 0
            }));

            // TODO Interaction blob vs walls/net
        });

        // Interaction ball vs ground/walls/net
        _lodash2.default.each(this.field.materials, function (material) {
            world.addContactMaterial(new _p2.default.ContactMaterial(_this.ball.material, material, {
                friction: 0,
                restitution: 1
            }));
        });
    };

    return Party;
}();

exports.default = Party;
module.exports = exports['default'];

});

require.register("physics.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _p = require('p2');

var _p2 = _interopRequireDefault(_p);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Physics = function () {
    function Physics(gravity) {
        _classCallCheck(this, Physics);

        this.gravity = _lodash2.default.isNumber(gravity) ? gravity : 100;
        this.world = null;

        this.init();
    }

    Physics.prototype.init = function init() {
        this.world = new _p2.default.World({
            gravity: [0, -this.gravity]
        });
    };

    Physics.prototype.getWorld = function getWorld() {
        return this.world;
    };

    Physics.prototype.step = function step(fixedTimeStep, deltaTime, maxSubSteps) {
        this.world.step(fixedTimeStep, deltaTime, maxSubSteps);
    };

    return Physics;
}();

exports.default = Physics;
module.exports = exports['default'];

});

require.register("player.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _keyboardState = require('./keyboardState');

var _keyboardState2 = _interopRequireDefault(_keyboardState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Player = function () {
    function Player(name, controls, side) {
        _classCallCheck(this, Player);

        this.name = name;
        this.controls = controls;
        this.side = side;
        this.keyboard = new _keyboardState2.default();
        this.blob = null;
        this.currentTouches = 0;
    }

    Player.prototype.setControls = function setControls(controls) {
        _lodash2.default.forEach(controls, function (value, key) {
            this.setControlForKey(key, value);
        }.bind(this));
    };

    Player.prototype.setControlForKey = function setControlForKey(key, keyBinding) {
        if (_lodash2.default.isUndefined(this.controls[key])) {
            throw new Error("This control does not exist");
        }

        this.controls[key] = keyBinding;
    };

    Player.prototype.getControlsAntagonistKey = function getControlsAntagonistKey(key) {
        var antagonists = {
            'left': 'right',
            'right': 'left'
        };

        return antagonists[key];
    };

    Player.prototype.listenInput = function listenInput() {
        var x = 0,
            y = 0;

        for (var key in this.controls) {
            var control = this.controls[key],
                antagonistControl = this.controls[this.getControlsAntagonistKey(key)];

            if (this.keyboard.pressed(control) && (typeof antagonistControl === 'undefined' || !this.keyboard.pressed(antagonistControl))) {
                switch (key) {
                    case 'up':
                        y = 1;
                        break;
                    case 'right':
                        x = 1;
                        break;
                    case 'left':
                        x = -1;
                        break;
                }

                this.moveBlob(x, y);
            }
        }
    };

    Player.prototype.attachBlob = function attachBlob(blob) {
        this.blob = blob;
    };

    Player.prototype.detachBlob = function detachBlob() {
        this.blob = null;
    };

    Player.prototype.getBlob = function getBlob() {
        return this.blob;
    };

    Player.prototype.moveBlob = function moveBlob(x, y) {
        if (this.blob !== null) {
            this.blob.move(x, y);
        }
    };

    return Player;
}();

exports.default = Player;
module.exports = exports['default'];

});

require.register("rules.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rules = function Rules(config) {
    _classCallCheck(this, Rules);

    this.defaultConfig = {
        maximumContactsAllowed: 3,
        scoreToWin: 25
    };
    this.config = _lodash2.default.extend({}, this.defaultConfig, config);
};

exports.default = Rules;
module.exports = exports['default'];

});

require.register("screensManager.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _eventEmitter = require('./eventEmitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScreenManager = function (_EventEmitter) {
    _inherits(ScreenManager, _EventEmitter);

    function ScreenManager(screens, flashMessageElement, flashMessageTextElement) {
        _classCallCheck(this, ScreenManager);

        var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

        _lodash2.default.forEach(screens, function (item) {
            if (!(item instanceof HTMLElement)) {
                throw new Error("Screen must be an instance of HTMLElement");
            }
        });

        if (!(flashMessageElement instanceof HTMLElement)) {
            throw new Error("flashMessageElement must be an instance of HTMLElement");
        }

        if (!(flashMessageTextElement instanceof HTMLElement)) {
            throw new Error("flashMessageTextElement must be an instance of HTMLElement");
        }

        _this.screens = screens;
        _this.flashMessageElement = flashMessageElement;
        _this.flashMessageTextElement = flashMessageTextElement;
        _this.history = [];
        _this.listeners = {};
        return _this;
    }

    ScreenManager.prototype.goTo = function goTo(screen) {
        this.displayScreen(screen);
        this.history.push(screen);
        return this;
    };

    ScreenManager.prototype.goBack = function goBack() {
        var index = this.history.length - 2;

        if (index >= 0) {
            var previousScreen = this.history[index];
            if (previousScreen) {
                this.displayScreen(previousScreen);
                this.history.pop();
            }
        }
    };

    ScreenManager.prototype.getScreen = function getScreen(name) {
        if (_lodash2.default.isUndefined(this.screens[name])) {
            throw new Error('Screen ' + name + ' does not exist');
        }

        return this.screens[name];
    };

    ScreenManager.prototype.displayScreen = function displayScreen(name) {
        var screen = this.getScreen(name);

        this.dispatch(name);
        this.hide();
        screen.style.display = 'block';
    };

    ScreenManager.prototype.hide = function hide() {
        _lodash2.default.forEach(this.screens, function (item) {
            item.style.display = 'none';
        });
    };

    ScreenManager.prototype.displayFlashMessage = function displayFlashMessage(message, duration) {
        this.flashMessageTextElement.textContent = message;
        this.fadeIn(this.flashMessageElement);

        setTimeout(function () {
            this.fadeOut(this.flashMessageElement);
        }.bind(this), duration ? duration : 2000);
    };

    ScreenManager.prototype.fadeIn = function fadeIn(el) {
        el.style.display = 'block';
        el.style.opacity = 0;

        var last = +new Date();
        var tick = function tick() {
            el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
            last = +new Date();

            if (+el.style.opacity < 1) {
                window.requestAnimationFrame && requestAnimationFrame(tick) || setTimeout(tick, 16);
            }
        };

        tick();
    };

    ScreenManager.prototype.fadeOut = function fadeOut(el) {
        el.style.display = 'block';
        el.style.opacity = 1;

        var last = +new Date();
        var tick = function tick() {
            el.style.opacity -= (new Date() - last) / 400;
            last = +new Date();

            if (+el.style.opacity > 0) {
                window.requestAnimationFrame && requestAnimationFrame(tick) || setTimeout(tick, 16);
            }
        };

        tick();
    };

    return ScreenManager;
}(_eventEmitter2.default);

exports.default = ScreenManager;
module.exports = exports['default'];

});

require.register("sound.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sound = function () {
    function Sound(sources) {
        _classCallCheck(this, Sound);

        this.sources = sources;
        this.audio = null;
        this.play = _lodash2.default.throttle(this._play.bind(this), 100, { leading: true });

        this.init();
    }

    Sound.prototype.init = function init() {
        this.audio = document.createElement('audio');

        for (var i = 0; i < this.sources.length; i++) {
            var source = document.createElement('source');
            source.src = this.sources[i];
            this.audio.appendChild(source);
        }
    };

    Sound.prototype.getAudio = function getAudio() {
        return this.audio;
    };

    Sound.prototype._play = function _play(restart) {
        if (restart === true && this.audio.currentTime > 0) {
            this.stop();
        }

        this.audio.play();
    };

    Sound.prototype.stop = function stop() {
        this.audio.currentTime = 0;
    };

    return Sound;
}();

exports.default = Sound;
module.exports = exports['default'];

});

require.alias("buffer/index.js", "buffer");
require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

