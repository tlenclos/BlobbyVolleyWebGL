import THREE from 'three';
import Sound from './sound';
import p2 from 'p2';

export default class Ball {
    constructor (world, color, spawnPosition) {
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

    init () {
        const body = new p2.Body({
            mass: 1,
            position: this.spawnPosition
        });

        body.userData = 'type_ball';

        const shape = new p2.Circle({
            radius: this.radius
        });

        body.addShape(shape);
        body.setDensity(1);

        this.material = new p2.Material();
        shape.material = this.material;

        this.world.addBody(body);
        this.fixture = body;

        this.world.on('beginContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            this._isHavingContact = true;

            if (
                event.bodyA.userData === 'type_ground' ||
                event.bodyB.userData === 'type_ground'
            ) {
                this._isTouchingGround = true;
            }
        }.bind(this));

        this.world.on('endContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            this._isHavingContact = false;

            if (
                event.bodyA.userData === 'type_ground' ||
                event.bodyB.userData === 'type_ground'
            ) {
                this._isTouchingGround = false;
            }
        }.bind(this));

        const texture = window.assetManager.get('textures.ball');
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: texture,
            bumpScale: 0.01
        });
        this.threeObject = new THREE.Mesh(geometry, material);
        this.threeObject.rotation.x += 90 * Math.PI / 180;

        this.sound = new Sound(['sounds/ball.mp3', 'sounds/ball.ogg']);
    }

    getFixture () {
        return this.fixture;
    }

    physics () {
        const body = this.fixture,
            pos = body.position,
            velocity = body.velocity,
            speed = p2.vec2.length(velocity);

        if (speed > this.maxSpeed) {
            body.velocity = [
                this.maxSpeed / speed * velocity[0],
                this.maxSpeed / speed * velocity[1]
            ];
        }

        this.threeObject.position.x = pos[0];
        this.threeObject.position.y = pos[1];

        if (this.hasTouchingContact()) {
            this.sound.play();
        }
    }

    hasTouchingContact () {
        return this._isHavingContact;
    }

    isTouchingGround () {
        return this._isTouchingGround;
    }

    moveTo (position) {
        this.fixture.position = position;
        this.fixture.velocity = [0, 0];
    }
}
