import THREE from 'three';
import _ from 'lodash';
import p2 from 'p2';

import Ball from './ball';
import Blob from './blob';
import Field from './field';
import Player from './player';
import Physics from './physics';

export default class Party {
    constructor (scene, rules, playersConfig) {
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

    init () {
        this.resetScore();
    }

    clear () {
        // Clear players
        _.each(this.players, (player) => player.keyboard.destroy());

        // Clear scene
        this.clearScene();

        // Reset score
        this.resetScore();
    }

    clearScene () {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const obj = this.scene.children[i];
            this.scene.remove(obj);
        }
    }

    resetScore () {
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
    }

    newGame () {
        // Clear
        this.clear();

        // Lightning
        // TODO Better lightning
        const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        this.scene.add(light);

        // Physics
        this.physics = new Physics(10);

        // Field
        this.field = new Field(this.physics.getWorld(), 0, 0, 22, 10);

        // Players
        this.players = [];

        for (const index in this.playersConfig) {
            const playerConfig = this.playersConfig[index];
            const position = [playerConfig.position === 'left' ? -5 : 5, -4];
            const color = playerConfig.position === 'left' ? 0xff0000 : 0x0000ff;

            const blob = new Blob(this.physics.getWorld(), color, position);
            const player = new Player(playerConfig.name, playerConfig.controls, playerConfig.position);

            player.attachBlob(blob);
            this.players.push(player);
        }

        // Ball
        this.ball = new Ball(this.physics.getWorld(), 0xff000, [-5, 5]);

        // Declare interactions between materials
        this._declareMaterialsInteractions();

        // Serving side
        this.servingSide = 'left';

        // Add all meshes to the scene
        const meshes = [
            ...this.field.getParts(),
            ..._.map(this.players, (player) => player.getBlob().threeObject),
            this.ball.threeObject
        ];

        for (const i in meshes) {
            this.scene.add(meshes[i]);
        }

        if (this.paused) {
            this.pause(false);
        }

        this.inProgress = true;
    }

    endGame () {
        this.inProgress = false;

        window.dispatchEvent(
            new CustomEvent(
                'endGame',
                {detail: {message: `${_.invert(this.scores)[_.max(_.values(this.scores))]} player wins`}}
            )
        );
    }

    afterScoring (winSide) {
        this.playingSide = null;
        let resetObjects = true;

        // Internal pause
        this.pause(true);
        this.lockPause = true;

        if (winSide === this.servingSide) {
            this.incrementScore(winSide);

            // End of game
            const maxScore = _.max(_.values(this.scores)),
                minScore = _.min(_.values(this.scores));

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

            _.forEach(this.players, function (player) {
                player.blob.moveTo([player.side === 'left' ? -5 : 5, -4]);
            });

            _.delay(function () {
                this.lockPause = false;
                this.pause(false);
            }.bind(this), 1000);
        }
    }

    pause (pause) {
        if (this.lockPause) {
            throw new Error('Pause is locked');
        }

        this.paused = !_.isUndefined(pause) ? Boolean(pause) : !this.paused;
        return this.paused;
    }

    update (fixedTimeStep, deltaTime, maxSubSteps) {
        if (this.paused || !this.inProgress) {
            return;
        }

        this.applyRules();

        for (const i in this.players) {
            this.players[i].listenInput();
            this.players[i].getBlob().physics();
        }

        this.ball.physics();
        this.physics.step(fixedTimeStep, deltaTime, maxSubSteps);
    }

    applyRules () {
        let winSide = null,
            resetTouches = false;

        // Ball touching ground
        if (this.ball.isTouchingGround()) {
            winSide = this.ball.threeObject.position.x > 0 ? 'left' : 'right';

        // Counting maximum touches
        } else {
            _.forEach(this.players, function (player) {
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
            }.bind(this));
        }

        // Reset touches count
        if (resetTouches) {
            _.forEach(this.players, function (player) {
                player.currentTouches = 0;
            });
        }

        // We have a winner for this round
        if (winSide) {
            this.afterScoring(winSide);
        }
    }

    incrementScore (side) {
        this.scores[side]++;
    }

    _declareMaterialsInteractions () {
        const world = this.physics.getWorld();

        _.each(this.players, (player) => {
            // Interaction blob vs ball
            world.addContactMaterial(
                new p2.ContactMaterial(
                    player.blob.material,
                    this.ball.material,
                    {
                        friction: 0,
                        restitution: 1.1
                    }
                )
            );

            // Interaction blob vs ground
            world.addContactMaterial(
                new p2.ContactMaterial(
                    player.blob.material,
                    this.field.materials[0],
                    {
                        friction: 2,
                        restitution: 0
                    }
                )
            );

            // TODO Interaction blob vs walls/net
        });

        // Interaction ball vs ground/walls/net
        _.each(this.field.materials, (material) => {
            world.addContactMaterial(
                new p2.ContactMaterial(
                    this.ball.material,
                    material,
                    {
                        friction: 0,
                        restitution: 1
                    }
                )
            );
        });
    }
}
