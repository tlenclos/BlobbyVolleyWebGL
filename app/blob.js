import THREE from 'three';
import p2 from 'p2';

export default class Blob {
    constructor (world, color, spawnPosition) {
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

    init () {
        const body = new p2.Body({
            mass: 100,
            fixedRotation: true,
            position: this.spawnPosition
        });

        const shape = new p2.Circle({
            radius: this.radius
        });

        body.addShape(shape);
        body.setDensity(100);

        this.material = new p2.Material();
        shape.material = this.material;

        this.world.addBody(body);
        this.fixture = body;

        this.world.on('beginContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            if (
                event.bodyA.userData === 'type_ground' ||
                event.bodyB.userData === 'type_ground'
            ) {
                this._isTouchingGround = true;
            } else if (
                event.bodyA.userData === 'type_ball' ||
                event.bodyB.userData === 'type_ball'
            ) {
                this._isTouchingBall = true;
            }
        }.bind(this));

        this.world.on('endContact', function (event) {
            if (event.bodyA !== body && event.bodyB !== body) {
                return;
            }

            if (
                event.bodyA.userData === 'type_ground' ||
                event.bodyB.userData === 'type_ground'
            ) {
                this._isTouchingGround = false;
            } else if (
                event.bodyA.userData === 'type_ball' ||
                event.bodyB.userData === 'type_ball'
            ) {
                this._isTouchingBall = false;
            }
        }.bind(this));

        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, 1, 7, 1, false);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.threeObject = new THREE.Mesh(geometry, material);
        this.threeObject.rotation.x += 90 * Math.PI / 180;
    }

    getFixture () {
        return this.fixture;
    }

    move (x, y) {
        // Vertical jump
        if (y > 0) {
            this.handleJump();
        }


        // Horizontal move
        if (x !== 0) {
            const body = this.fixture,
                vel = body.velocity,
                velDelta = (this.speed * x) - vel[0],
                force = body.mass * velDelta / (1 / 60); // TODO 1/60 could change (see main)

            body.applyForce(
                [force, 0]
            );
        }
    }

    handleJump () {
        const body = this.fixture,
            yVelocity = body.velocity[1];

        // Allow jumping
        if (!this.jumpAllowed && yVelocity < 0.00001 && this.isTouchingGround()) {
            this.jumpAllowed = true;
        }

        // Jumping
        if (this.jumpAllowed) {
            body.applyImpulse(
                p2.vec2.fromValues(0, 9 * this.fixture.mass)
            );

            // Prevent jumping
            this.jumpAllowed = false;
        }
    }

    isTouchingGround () {
        return this._isTouchingGround;
    }

    isTouchingBall () {
        return this._isTouchingBall;
    }

    physics () {
        const pos = this.fixture.position;
        this.threeObject.position.x = pos[0];
        this.threeObject.position.y = pos[1];
    }

    moveTo (position) {
        this.fixture.position = position;
        this.fixture.velocity = [0, 0];
    }
}
