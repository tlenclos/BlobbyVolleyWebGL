function Party (scene, rules, playersConfig) {
    // Properties
    this.scene = null;
    this.rules = null;
    this.playersConfig = null;
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

    // Methods
    this.init = function () {
        this.scene = scene;
        this.rules = rules;
        this.playersConfig = playersConfig;
        this.resetScore();
    };

    this.clearScene = function () {
        var obj, i;

        for (i = this.scene.children.length - 1; i >= 0; i --) {
            obj = scene.children[i];
            scene.remove(obj);
        }
    };

    this.resetScore = function () {
        this.scores = {
            left: 0,
            right: 0
        };

        // Dispatch score event
        window.dispatchEvent(
            new CustomEvent(
                'score',
                {detail: {side: 'left', scores: this.scores}}
            )
        );
    };

    this.newGame = function () {
        // Clear scene
        this.clearScene();

        // Reset score
        this.resetScore();

        // Lightning
        // TODO Better lightning
        light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        scene.add(light);

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

            position = [playerConfig.position === 'left' ? -5 : 5, -4];
            color = playerConfig.position === 'left' ? 0xff0000 : 0x0000ff;

            blob = new Blob(this.physics.getWorld(), color, position);
            player = new Player(playerConfig.name, playerConfig.controls, playerConfig.position);
            player.attachBlob(blob);

            this.players.push(player);
        }

        // Ball
        this.ball = new Ball(this.physics.getWorld(), 0xff000, [-5, 5]);

        // Serving side
        this.servingSide = 'left';

        // Add all meshes to the scene
        var meshes = _.union(
            this.field.getParts(),
            _.map(this.players, function(player) { return player.getBlob().threeObject; }),
            this.ball.threeObject
        );

        for (var i in meshes) {
            this.scene.add(meshes[i]);
        }

        if (this.paused) {
            this.pause(false);
        }

        this.inProgress = true;
    };

    this.endGame = function () {
        this.inProgress = false;

        window.dispatchEvent(
            new CustomEvent(
                'endGame',
                {detail: {message: _.invert(this.scores)[_.max(this.scores)] + ' player wins'}}
            )
        );
    };

    this.afterScoring = function (winSide) {
        var resetObjects = true;

        // Internal pause
        this.pause(true);
        this.lockPause = true;

        if (winSide === this.servingSide) {
            this.incrementScore(winSide);

            // End of game
            var maxScore = _.max(this.scores),
                minScore = _.min(this.scores)
            ;

            if (maxScore >= this.rules.config.scoreToWin && maxScore - minScore > 1) {
                this.endGame();
                resetObjects = false;
            }
        } else {
            this.servingSide = winSide;
        }

        // Dispatch score event
        window.dispatchEvent(
            new CustomEvent(
                'score',
                {detail: {side: winSide, scores: this.scores}}
            )
        );

        if (resetObjects) {
            // Reset objects
            this.ball.moveTo([winSide === 'left' ? -5 : 5, 5]);

            _.each(this.players, function (player) {
                player.blob.moveTo([player.side === 'left' ? -5 : 5, -4]);
            });

            var self = this;

            _.delay(function () {
                self.lockPause = false;
                self.pause(false);
            }, 1000);
        }
    };

    this.pause = function (pause) {
        if (this.lockPause) {
            throw 'Pause is locked';
        }

        this.paused = !_.isUndefined(pause) ? Boolean(pause) : !this.paused;
        return this.paused;
    }

    this.update = function () {
        if (this.paused || !this.inProgress) {
            return;
        }

        this.applyRules();

        for (var i in this.players) {
            this.players[i].listenInput();
            this.players[i].getBlob().physics();
        }

        this.ball.physics();
        this.physics.step();
    };

    this.applyRules = function () {
        var winSide = null,
            resetTouches = false
        ;

        // Ball touching ground
        if (this.ball.isTouchingGround()) {
            winSide = this.ball.threeObject.position.x > 0 ? 'left' : 'right';

        // Counting maximum touches
        } else {
            _.each(this.players, function (player) {
                if (player.getBlob().isTouchingBall()) {
                    player.currentTouches++;

                    if (player.side !== this.playingSide) {
                        // Switching side, reset touches
                        if (!_.isNull(this.playingSide)) {
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
            }, this);
        }

        // Reset touches count
        if (resetTouches) {
            _.each(this.players, function (player) {
                player.currentTouches = 0;
            });
        }

        // We have a winner for this round
        if (winSide) {
            this.afterScoring(winSide);
        }
    };

    this.incrementScore = function (side) {
        this.scores[side]++;
    };

    this.init();
}
