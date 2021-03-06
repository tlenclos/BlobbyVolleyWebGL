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

var _collisions = require('./collisions');

var _collisions2 = _interopRequireDefault(_collisions);

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
        this.maxSpeed = 20;
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
            mass: 10,
            position: this.spawnPosition
        });

        body.userData = 'type_ball';

        var shape = new _p2.default.Circle({
            radius: this.radius
        });

        shape.collisionGroup = _collisions2.default.BALL;
        shape.collisionMask = _collisions2.default.BLOB | _collisions2.default.FIELD;

        body.addShape(shape);
        body.setDensity(10);

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
            this.sound.play();
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

var _collisions = require('./collisions');

var _collisions2 = _interopRequireDefault(_collisions);

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
        this.speed = 10;
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

        shape.collisionGroup = _collisions2.default.BLOB;
        shape.collisionMask = _collisions2.default.BALL | _collisions2.default.FIELD | _collisions2.default.PLAYER_SEPARATOR;

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
        if (!this.jumpAllowed && yVelocity < 0.1 && this.isTouchingGround()) {
            this.jumpAllowed = true;
        }

        // Jumping
        if (this.jumpAllowed) {
            body.applyImpulse(_p2.default.vec2.fromValues(0, 15 * this.fixture.mass));

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

require.register("collisions.js", function(exports, require, module) {
"use strict";

exports.__esModule = true;
exports.default = {
    BLOB: Math.pow(2, 0),
    BALL: Math.pow(2, 1),
    FIELD: Math.pow(2, 2),
    PLAYER_SEPARATOR: Math.pow(2, 3)
};
module.exports = exports["default"];

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

var _collisions = require('./collisions');

var _collisions2 = _interopRequireDefault(_collisions);

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
        this.fieldDecorator = null;

        this.init();
    }

    Field.prototype.init = function init() {
        // Base field (ground, walls, net)
        var ground = this.createWall(this.x, this.y - this.height / 2 - 0.5, this.width, 1, 20, _collisions2.default.FIELD, -1, 'type_ground');

        var leftWall = this.createWall(this.x - this.width / 2 - 0.5, this.y + this.height / 2, 1, this.height * 5, 20, _collisions2.default.FIELD, -1);

        var rightWall = this.createWall(this.x + this.width / 2 + 0.5, this.y + this.height / 2, 1, this.height * 5, 20, _collisions2.default.FIELD, -1);

        var net = this.createWall(this.x, this.y - this.height / 2 + this.height / 4, 0.3, this.height / 2, 20, _collisions2.default.FIELD, -1);

        var playerSeparatorWall = this.createWall(this.x, this.y - this.height / 2 + this.height / 4, 0.7, this.height * 5, 20, _collisions2.default.PLAYER_SEPARATOR, _collisions2.default.BLOB);

        this.parts.push(ground, leftWall, rightWall, net, playerSeparatorWall);
    };

    Field.prototype.createWall = function createWall(x, y, width, height, depth, collisionGroup, collisionMask, userData) {
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

        shape.collisionGroup = collisionGroup;
        shape.collisionMask = collisionMask;

        body.addShape(shape);
        body.setDensity(1);

        var physicsMaterial = new _p2.default.Material();

        shape.material = physicsMaterial;
        this.materials.push(physicsMaterial);

        this.world.addBody(body);

        var geometry = new _three2.default.BoxGeometry(width, height, _lodash2.default.isNumber(depth) ? depth : 0);

        var material = new _three2.default.MeshBasicMaterial({
            opacity: 0,
            transparent: true
        });

        var mesh = new _three2.default.Mesh(geometry, material);
        mesh.position.x = body.position[0];
        mesh.position.y = body.position[1];

        return mesh;
    };

    Field.prototype.setDecorator = function setDecorator(fieldDecorator) {
        this.fieldDecorator = fieldDecorator;
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
        var decoratorParts = this.fieldDecorator ? this.fieldDecorator.getParts() : [];

        return [].concat(this.parts, decoratorParts);
    };

    return Field;
}();

exports.default = Field;
module.exports = exports['default'];

});

require.register("fieldDecoratorFactory.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _beachFieldDecorator = require('./fieldDecorators/beachFieldDecorator');

var _beachFieldDecorator2 = _interopRequireDefault(_beachFieldDecorator);

var _roomFieldDecorator = require('./fieldDecorators/roomFieldDecorator');

var _roomFieldDecorator2 = _interopRequireDefault(_roomFieldDecorator);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var decorators = {
    beach: _beachFieldDecorator2.default,
    room: _roomFieldDecorator2.default
};

var FieldDecoratorFactory = function () {
    function FieldDecoratorFactory() {
        _classCallCheck(this, FieldDecoratorFactory);
    }

    FieldDecoratorFactory.factory = function factory(name, field) {
        if (!_lodash2.default.has(decorators, name)) {
            throw new Error('Decorator "' + name + '" does not exist');
        }

        return new decorators[name](field);
    };

    return FieldDecoratorFactory;
}();

exports.default = FieldDecoratorFactory;
module.exports = exports['default'];

});

require.register("fieldDecorators/abstract.js", function(exports, require, module) {
"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Abstract = function () {
    function Abstract(field) {
        _classCallCheck(this, Abstract);

        this.field = field;
        this.parts = [];
        this.initialize();
    }

    Abstract.prototype.getParts = function getParts() {
        return this.parts;
    };

    return Abstract;
}();

exports.default = Abstract;
module.exports = exports["default"];

});

require.register("fieldDecorators/beachFieldDecorator.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BeachFieldDecorator = function (_Abstract) {
    _inherits(BeachFieldDecorator, _Abstract);

    function BeachFieldDecorator() {
        _classCallCheck(this, BeachFieldDecorator);

        return _possibleConstructorReturn(this, _Abstract.apply(this, arguments));
    }

    BeachFieldDecorator.prototype.initialize = function initialize() {
        // Ground
        this.field.getParts()[0].material = new _three2.default.MeshBasicMaterial({
            map: window.assetManager.get('textures.wood'),
            transparent: true
        });

        // Net
        this.field.getParts()[3].material = new _three2.default.MeshBasicMaterial({
            color: 0xDEDEDE,
            opacity: 0.8,
            transparent: true
        });

        // Background
        var bg = new _three2.default.Mesh(new _three2.default.PlaneGeometry(110, 90, 0), new _three2.default.MeshBasicMaterial({
            map: window.assetManager.get('textures.background')
        }));

        bg.position.z = -20;
        bg.position.y = 12;

        this.parts.push(bg);
    };

    return BeachFieldDecorator;
}(_abstract2.default);

exports.default = BeachFieldDecorator;
module.exports = exports['default'];

});

require.register("fieldDecorators/roomFieldDecorator.js", function(exports, require, module) {
'use strict';

exports.__esModule = true;

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RoomFieldDecorator = function (_Abstract) {
    _inherits(RoomFieldDecorator, _Abstract);

    function RoomFieldDecorator() {
        _classCallCheck(this, RoomFieldDecorator);

        return _possibleConstructorReturn(this, _Abstract.apply(this, arguments));
    }

    RoomFieldDecorator.prototype.initialize = function initialize() {
        // Ground
        this.field.getParts()[0].material = new _three2.default.MeshBasicMaterial({
            color: 0xCCCCCC
        });

        // Left wall
        this.field.getParts()[1].material = new _three2.default.MeshBasicMaterial({
            color: 0xDEDEDE
        });

        // Right wall
        this.field.getParts()[2].material = new _three2.default.MeshBasicMaterial({
            color: 0xDEDEDE
        });

        // Net
        this.field.getParts()[3].material = new _three2.default.MeshBasicMaterial({
            color: 0x111111
        });

        // Background
        var bg = new _three2.default.Mesh(new _three2.default.PlaneGeometry(50, 50, 0), new _three2.default.MeshBasicMaterial({
            color: 0xffffff
        }));

        bg.position.z = -10;
        bg.position.y = 12;

        this.parts.push(bg);
    };

    return RoomFieldDecorator;
}(_abstract2.default);

exports.default = RoomFieldDecorator;
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

require.register("libs/ThreeOrbitControls.js", function(exports, require, module) {
'use strict';

module.exports = function (THREE) {
    /**
     * @author qiao / https://github.com/qiao
     * @author mrdoob / http://mrdoob.com
     * @author alteredq / http://alteredqualia.com/
     * @author WestLangley / http://github.com/WestLangley
     * @author erich666 / http://erichaines.com
     */
    /*global THREE, console */

    // This set of controls performs orbiting, dollying (zooming), and panning. It maintains
    // the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
    // supported.
    //
    //    Orbit - left mouse / touch: one finger move
    //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
    //    Pan - right mouse, or arrow keys / touch: three finter swipe
    //
    // This is a drop-in replacement for (most) TrackballControls used in examples.
    // That is, include this js file and wherever you see:
    //    	controls = new THREE.TrackballControls( camera );
    //      controls.target.z = 150;
    // Simple substitute "OrbitControls" and the control should work as-is.

    function OrbitControls(object, domElement) {

        this.object = object;
        this.domElement = domElement !== undefined ? domElement : document;

        // API

        // Set to false to disable this control
        this.enabled = true;

        // "target" sets the location of focus, where the control orbits around
        // and where it pans with respect to.
        this.target = new THREE.Vector3();

        // center is old, deprecated; use "target" instead
        this.center = this.target;

        // This option actually enables dollying in and out; left as "zoom" for
        // backwards compatibility
        this.noZoom = false;
        this.zoomSpeed = 1.0;

        // Limits to how far you can dolly in and out
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // Set to true to disable this control
        this.noRotate = false;
        this.rotateSpeed = 1.0;

        // Set to true to disable this control
        this.noPan = false;
        this.keyPanSpeed = 7.0; // pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // Set to true to disable use of the keys
        this.noKeys = false;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        ////////////
        // internals

        var scope = this;

        var EPS = 0.000001;

        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();

        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();
        var panOffset = new THREE.Vector3();

        var offset = new THREE.Vector3();

        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();

        var phiDelta = 0;
        var thetaDelta = 0;
        var scale = 1;
        var pan = new THREE.Vector3();

        var lastPosition = new THREE.Vector3();

        var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

        var state = STATE.NONE;

        // for reset

        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();

        // events

        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };

        this.rotateLeft = function (angle) {

            if (angle === undefined) {

                angle = getAutoRotationAngle();
            }

            thetaDelta -= angle;
        };

        this.rotateUp = function (angle) {

            if (angle === undefined) {

                angle = getAutoRotationAngle();
            }

            phiDelta -= angle;
        };

        // pass in distance in world space to move left
        this.panLeft = function (distance) {

            var te = this.object.matrix.elements;

            // get X column of matrix
            panOffset.set(te[0], te[1], te[2]);
            panOffset.multiplyScalar(-distance);

            pan.add(panOffset);
        };

        // pass in distance in world space to move up
        this.panUp = function (distance) {

            var te = this.object.matrix.elements;

            // get Y column of matrix
            panOffset.set(te[4], te[5], te[6]);
            panOffset.multiplyScalar(distance);

            pan.add(panOffset);
        };

        // pass in x,y of change desired in pixel space,
        // right and down are positive
        this.pan = function (deltaX, deltaY) {

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if (scope.object.fov !== undefined) {

                // perspective
                var position = scope.object.position;
                var offset = position.clone().sub(scope.target);
                var targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180.0);

                // we actually don't use screenWidth, since perspective camera is fixed to screen height
                scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
                scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
            } else if (scope.object.top !== undefined) {

                // orthographic
                scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
                scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);
            } else {

                // camera neither orthographic or perspective
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            }
        };

        this.dollyIn = function (dollyScale) {

            if (dollyScale === undefined) {

                dollyScale = getZoomScale();
            }

            scale /= dollyScale;
        };

        this.dollyOut = function (dollyScale) {

            if (dollyScale === undefined) {

                dollyScale = getZoomScale();
            }

            scale *= dollyScale;
        };

        this.update = function () {

            var position = this.object.position;

            offset.copy(position).sub(this.target);

            // angle from z-axis around y-axis

            var theta = Math.atan2(offset.x, offset.z);

            // angle from y-axis

            var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

            if (this.autoRotate) {

                this.rotateLeft(getAutoRotationAngle());
            }

            theta += thetaDelta;
            phi += phiDelta;

            // restrict phi to be between desired limits
            phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

            // restrict phi to be betwee EPS and PI-EPS
            phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

            var radius = offset.length() * scale;

            // restrict radius to be between desired limits
            radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

            // move target to panned location
            this.target.add(pan);

            offset.x = radius * Math.sin(phi) * Math.sin(theta);
            offset.y = radius * Math.cos(phi);
            offset.z = radius * Math.sin(phi) * Math.cos(theta);

            position.copy(this.target).add(offset);

            this.object.lookAt(this.target);

            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            pan.set(0, 0, 0);

            if (lastPosition.distanceTo(this.object.position) > 0) {

                this.dispatchEvent(changeEvent);

                lastPosition.copy(this.object.position);
            }
        };

        this.reset = function () {

            state = STATE.NONE;

            this.target.copy(this.target0);
            this.object.position.copy(this.position0);

            this.update();
        };

        function getAutoRotationAngle() {

            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
        }

        function getZoomScale() {

            return Math.pow(0.95, scope.zoomSpeed);
        }

        function onMouseDown(event) {

            if (scope.enabled === false) return;
            event.preventDefault();

            if (event.button === 0) {
                if (scope.noRotate === true) return;

                state = STATE.ROTATE;

                rotateStart.set(event.clientX, event.clientY);
            } else if (event.button === 1) {
                if (scope.noZoom === true) return;

                state = STATE.DOLLY;

                dollyStart.set(event.clientX, event.clientY);
            } else if (event.button === 2) {
                if (scope.noPan === true) return;

                state = STATE.PAN;

                panStart.set(event.clientX, event.clientY);
            }

            scope.domElement.addEventListener('mousemove', onMouseMove, false);
            scope.domElement.addEventListener('mouseup', onMouseUp, false);
            scope.dispatchEvent(startEvent);
        }

        function onMouseMove(event) {

            if (scope.enabled === false) return;

            event.preventDefault();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if (state === STATE.ROTATE) {

                if (scope.noRotate === true) return;

                rotateEnd.set(event.clientX, event.clientY);
                rotateDelta.subVectors(rotateEnd, rotateStart);

                // rotating across whole screen goes 360 degrees around
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

                rotateStart.copy(rotateEnd);
            } else if (state === STATE.DOLLY) {

                if (scope.noZoom === true) return;

                dollyEnd.set(event.clientX, event.clientY);
                dollyDelta.subVectors(dollyEnd, dollyStart);

                if (dollyDelta.y > 0) {

                    scope.dollyIn();
                } else {

                    scope.dollyOut();
                }

                dollyStart.copy(dollyEnd);
            } else if (state === STATE.PAN) {

                if (scope.noPan === true) return;

                panEnd.set(event.clientX, event.clientY);
                panDelta.subVectors(panEnd, panStart);

                scope.pan(panDelta.x, panDelta.y);

                panStart.copy(panEnd);
            }

            scope.update();
        }

        function onMouseUp() /* event */{

            if (scope.enabled === false) return;

            scope.domElement.removeEventListener('mousemove', onMouseMove, false);
            scope.domElement.removeEventListener('mouseup', onMouseUp, false);
            scope.dispatchEvent(endEvent);
            state = STATE.NONE;
        }

        function onMouseWheel(event) {

            if (scope.enabled === false || scope.noZoom === true) return;

            event.preventDefault();

            var delta = 0;

            if (event.wheelDelta !== undefined) {
                // WebKit / Opera / Explorer 9

                delta = event.wheelDelta;
            } else if (event.detail !== undefined) {
                // Firefox

                delta = -event.detail;
            }

            if (delta > 0) {

                scope.dollyOut();
            } else {

                scope.dollyIn();
            }

            scope.update();
            scope.dispatchEvent(startEvent);
            scope.dispatchEvent(endEvent);
        }

        function onKeyDown(event) {

            if (scope.enabled === false || scope.noKeys === true || scope.noPan === true) return;

            switch (event.keyCode) {

                case scope.keys.UP:
                    scope.pan(0, scope.keyPanSpeed);
                    scope.update();
                    break;

                case scope.keys.BOTTOM:
                    scope.pan(0, -scope.keyPanSpeed);
                    scope.update();
                    break;

                case scope.keys.LEFT:
                    scope.pan(scope.keyPanSpeed, 0);
                    scope.update();
                    break;

                case scope.keys.RIGHT:
                    scope.pan(-scope.keyPanSpeed, 0);
                    scope.update();
                    break;

            }
        }

        function touchstart(event) {

            if (scope.enabled === false) return;

            switch (event.touches.length) {

                case 1:
                    // one-fingered touch: rotate

                    if (scope.noRotate === true) return;

                    state = STATE.TOUCH_ROTATE;

                    rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                    break;

                case 2:
                    // two-fingered touch: dolly

                    if (scope.noZoom === true) return;

                    state = STATE.TOUCH_DOLLY;

                    var dx = event.touches[0].pageX - event.touches[1].pageX;
                    var dy = event.touches[0].pageY - event.touches[1].pageY;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    dollyStart.set(0, distance);
                    break;

                case 3:
                    // three-fingered touch: pan

                    if (scope.noPan === true) return;

                    state = STATE.TOUCH_PAN;

                    panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                    break;

                default:

                    state = STATE.NONE;

            }

            scope.dispatchEvent(startEvent);
        }

        function touchmove(event) {

            if (scope.enabled === false) return;

            event.preventDefault();
            event.stopPropagation();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            switch (event.touches.length) {

                case 1:
                    // one-fingered touch: rotate

                    if (scope.noRotate === true) return;
                    if (state !== STATE.TOUCH_ROTATE) return;

                    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                    rotateDelta.subVectors(rotateEnd, rotateStart);

                    // rotating across whole screen goes 360 degrees around
                    scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

                    rotateStart.copy(rotateEnd);

                    scope.update();
                    break;

                case 2:
                    // two-fingered touch: dolly

                    if (scope.noZoom === true) return;
                    if (state !== STATE.TOUCH_DOLLY) return;

                    var dx = event.touches[0].pageX - event.touches[1].pageX;
                    var dy = event.touches[0].pageY - event.touches[1].pageY;
                    var distance = Math.sqrt(dx * dx + dy * dy);

                    dollyEnd.set(0, distance);
                    dollyDelta.subVectors(dollyEnd, dollyStart);

                    if (dollyDelta.y > 0) {

                        scope.dollyOut();
                    } else {

                        scope.dollyIn();
                    }

                    dollyStart.copy(dollyEnd);

                    scope.update();
                    break;

                case 3:
                    // three-fingered touch: pan

                    if (scope.noPan === true) return;
                    if (state !== STATE.TOUCH_PAN) return;

                    panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                    panDelta.subVectors(panEnd, panStart);

                    scope.pan(panDelta.x, panDelta.y);

                    panStart.copy(panEnd);

                    scope.update();
                    break;

                default:

                    state = STATE.NONE;

            }
        }

        function touchend() /* event */{

            if (scope.enabled === false) return;

            scope.dispatchEvent(endEvent);
            state = STATE.NONE;
        }

        this.domElement.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        }, false);
        this.domElement.addEventListener('mousedown', onMouseDown, false);
        this.domElement.addEventListener('mousewheel', onMouseWheel, false);
        this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox

        this.domElement.addEventListener('touchstart', touchstart, false);
        this.domElement.addEventListener('touchend', touchend, false);
        this.domElement.addEventListener('touchmove', touchmove, false);

        window.addEventListener('keydown', onKeyDown, false);

        // force an update at start
        this.update();
    };

    OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
    OrbitControls.prototype.constructor = OrbitControls;
    return OrbitControls;
};

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

var OrbitControls = require('./libs/ThreeOrbitControls')(_three2.default);

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
    "rulesMenu": document.getElementById("rulesMenu"),
    "mapsMenu": document.getElementById("mapsMenu")
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
    mapElements = screens['mapsMenu'].querySelectorAll('.mapElement'),
    config = {
    fieldDecorator: 'beach'
},
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
        var onChange = function onChange(e) {
            var input = e.target;
            var ruleValue = parseInt(input.value);
            var ruleName = input.getAttribute('data-ruleName');
            rules.config[ruleName] = ruleValue;
            input.value = ruleValue;
        };

        _lodash2.default.forEach(rulesElements, function (item) {
            var ruleName = item.getAttribute('data-ruleName');
            item.value = rules.config[ruleName];

            if (_lodash2.default.isNull(item.onchange)) {
                item.onchange = onChange;
            }
        });
    });

    // Maps menu is displayed, listen keyboard event on inputs
    screenManager.on("mapsMenu", function () {
        var onChange = function onChange(e) {
            config.fieldDecorator = e.target.value;
        };

        _lodash2.default.forEach(mapElements, function (item) {
            item.value = config.fieldDecorator;

            if (_lodash2.default.isNull(item.onchange)) {
                item.onchange = onChange;
            }
        });
    });

    // Display main menu
    screenManager.goTo("mainMenu");
}

function newParty() {
    screenManager.hide();
    screenManager.displayFlashMessage("Game starts!");

    updateRulesUI();

    // Party
    party = new _party2.default(scene, config, rules, [{
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
    if (!party || !party.inProgress) {
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

var _fieldDecoratorFactory = require('./fieldDecoratorFactory');

var _fieldDecoratorFactory2 = _interopRequireDefault(_fieldDecoratorFactory);

var _player = require('./player');

var _player2 = _interopRequireDefault(_player);

var _physics = require('./physics');

var _physics2 = _interopRequireDefault(_physics);

var _sound = require('./sound');

var _sound2 = _interopRequireDefault(_sound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Party = function () {
    function Party(scene, config, rules, playersConfig) {
        _classCallCheck(this, Party);

        this.scene = scene;
        this.config = config;
        this.rules = rules;
        this.playersConfig = playersConfig;
        this.physics = null;
        this.field = null;
        this.players = null;
        this.ball = null;
        this.scores = null;
        this.paused = false;
        this.playingSide = null;
        this.servingSide = null;
        this.inProgress = null;
        this.waitForUserInput = null;
        this.whistleSound = null;
        this.scoringSound = null;
        this.winSound = null;

        this.init();
    }

    Party.prototype.init = function init() {
        this.resetScore();
        this.whistleSound = new _sound2.default(['sounds/whistle.mp3', 'sounds/whistle.ogg']);
        this.scoringSound = new _sound2.default(['sounds/scoring.mp3', 'sounds/scoring.ogg']);
        this.winSound = new _sound2.default(['sounds/win.mp3', 'sounds/win.ogg']);
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
        this.physics = new _physics2.default(20);

        // Field
        this.field = new _field2.default(this.physics.getWorld(), 0, 0, 22, 10);
        this.field.setDecorator(_fieldDecoratorFactory2.default.factory(this.config.fieldDecorator, this.field));

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
        this.waitForUserInput = true;
        this.whistleSound.play();
    };

    Party.prototype.endGame = function endGame() {
        this.inProgress = false;

        window.dispatchEvent(new CustomEvent('endGame', { detail: { message: _lodash2.default.invert(this.scores)[_lodash2.default.max(_lodash2.default.values(this.scores))] + ' player wins' } }));

        this.scoringSound.stop();
        this.winSound.play();
    };

    Party.prototype.afterScoring = function afterScoring(winSide) {
        this.scoringSound.play();
        this.playingSide = null;
        this.resetTouches();
        this.waitForUserInput = true;

        var resetObjects = true;

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
        }
    };

    Party.prototype.pause = function pause(_pause) {
        this.paused = !_lodash2.default.isUndefined(_pause) ? Boolean(_pause) : !this.paused;
        return this.paused;
    };

    Party.prototype.update = function update(fixedTimeStep, deltaTime, maxSubSteps) {
        if (this.paused || !this.inProgress) {
            return;
        }

        this.applyRules();

        for (var i in this.players) {
            if (this.gotUserInput()) {
                this.players[i].listenInput();
            }

            this.players[i].getBlob().physics();
        }

        this.ball.physics();
        this.physics.getWorld().applyGravity = this.gotUserInput();
        this.physics.step(fixedTimeStep, deltaTime, maxSubSteps);
    };

    Party.prototype.gotUserInput = function gotUserInput() {
        if (!this.waitForUserInput) {
            return true;
        }

        // Check if serving player has pressed a key
        var player = _lodash2.default.find(this.players, { 'side': this.servingSide });

        this.waitForUserInput = _lodash2.default.chain(_lodash2.default.values(player.controls)).map(player.keyboard.pressed.bind(player.keyboard)).filter().isEmpty().value();

        return !this.waitForUserInput;
    };

    Party.prototype.applyRules = function applyRules() {
        var winSide = null;

        // Ball touching ground
        if (this.ball.isTouchingGround()) {
            winSide = this.ball.threeObject.position.x > 0 ? 'left' : 'right';

            // Counting maximum touches
        } else {
            _lodash2.default.forEach(this.players, function (player) {
                if (player.getBlob().isTouchingBall()) {
                    if (player.side !== this.playingSide) {
                        // Switching side, reset touches
                        if (!_lodash2.default.isNull(this.playingSide)) {
                            this.resetTouches();
                        }

                        this.playingSide = player.side;
                    }

                    player.currentTouches++;
                }

                // Maximum touches reached
                if (player.currentTouches > this.rules.config.maximumContactsAllowed) {
                    winSide = player.side === 'right' ? 'left' : 'right';
                }
            }.bind(this));
        }

        // We have a winner for this round
        if (winSide) {
            this.afterScoring(winSide);
        }
    };

    Party.prototype.resetTouches = function resetTouches() {
        _lodash2.default.forEach(this.players, function (player) {
            player.currentTouches = 0;
        });
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
                restitution: 2
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

var _howler = require('howler');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sound = function () {
    function Sound(sources, options) {
        _classCallCheck(this, Sound);

        this.sources = sources;
        this.audio = new _howler.Howl(_lodash2.default.assign({
            src: sources
        }, options));
        this.play = _lodash2.default.throttle(this._play.bind(this), 100, { leading: true });
    }

    Sound.prototype.getAudio = function getAudio() {
        return this.audio;
    };

    Sound.prototype._play = function _play(id) {
        this.audio.play(id);
    };

    Sound.prototype.pause = function pause(id) {
        this.audio.pause(id);
    };

    Sound.prototype.stop = function stop(id) {
        this.audio.stop(id);
    };

    return Sound;
}();

exports.default = Sound;
module.exports = exports['default'];

});

require.alias("buffer/index.js", "buffer");
require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

