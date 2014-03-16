function Party (scene, rules, playersConfig) {
    // Properties
    this.scene = null;
    this.rules = null;
    this.playersConfig = null;
    this.physics = null;
    this.field = null;
    this.players = null;
    this.ball = null;
    this.paused = false;

    // Methods
    this.init = function () {
        this.scene = scene;
        this.rules = rules;
        this.playersConfig = playersConfig;

        this.listen('party:start', this.newGame);
        this.listen('party:stop', this.endGame);
        this.listen('party:pause', this.pause);
    };

    this.listen = function (type, listener, capture) {
        document.removeEventListener(type, listener, capture);
        document.addEventListener(type, listener, capture);
    };

    this.clearScene = function () {
        var obj, i;

        for (i = this.scene.children.length - 1; i >= 0; i --) {
            obj = scene.children[i];
            scene.remove(obj);
        }
    };

    this.newGame = function () {
        // Clear scene
        this.clearScene();

        // Physics
        this.physics = new Physics(10);

        // Field
        this.field = new Field(this.physics.getWorld(), 0, 0, 22, 10);

        // Players
        this.players = [];

        for (var index in this.playersConfig) {
            var playerConfig = this.playersConfig[index],
                blob,
                position,
                color,
                player
            ;

            position = [playerConfig.position === 'left' ? -5 : 5, 0];
            color = playerConfig.position === 'left' ? 0xff0000 : 0x0000ff;

            blob = new Blob(this.physics.getWorld(), color, position);
            player = new Player(playerConfig.name, playerConfig.controls);
            player.attachBlob(blob);

            this.players.push(player);
        }

        // Ball
        this.ball = new Ball(this.physics.getWorld(), 0xff000, [-5, 5]);

        // Add all meshes to the scene
        var meshes = _.union(
            this.field.getWalls(),
            _.map(this.players, function(player) { return player.getBlob().threeObject; }),
            this.ball.threeObject
        );

        for (var i in meshes) {
            this.scene.add(meshes[i]);
        }
    };

    this.endGame = function () {
        this.newGame();
    };

    this.pause = function (pause) {
        this.paused = !_.isUndefined(pause) ? Boolean(pause) : !this.paused;
    }

    this.update = function () {
        if (this.paused) {
            return;
        }

        for (var i in this.players) {
            this.players[i].listenInput();
            this.players[i].getBlob().physics();
        }

        this.ball.physics();
        this.physics.step();
        this.applyRules();
    };

    this.applyRules = function () {
        this.rules.apply();
    };

    this.init();
}
