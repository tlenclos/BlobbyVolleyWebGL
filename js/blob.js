define(['Box2D', 'THREE'], function (Box2D, THREE) {
    const b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

    return class Blob {
        constructor (world, color, spawnPosition) {
            this.world = world;
            this.color = color;
            this.spawnPosition = spawnPosition;
            this.fixture = null;
            this.threeObject = null;
            this.radius = 1;
            this.speed = 5;
            this.jumpAllowed = false;

            this.init();
        }

        init () {
            const fixDef = new b2FixtureDef;
            fixDef.density = 100;
            fixDef.friction = 1;
            fixDef.restitution = 0;
            fixDef.shape = new b2CircleShape(this.radius);

            const bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.fixedRotation = true;
            bodyDef.position.x = this.spawnPosition[0];
            bodyDef.position.y = this.spawnPosition[1];

            this.fixture = this.world.CreateBody(bodyDef).CreateFixture(fixDef);

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
                const body = this.fixture.GetBody(),
                    vel = body.GetLinearVelocity(),
                    velDelta = (this.speed * x) - vel.x,
                    force = body.GetMass() * velDelta / (window.dt)
                ;

                body.ApplyForce(
                    new b2Vec2(force, 0),
                    body.GetDefinition().position
                );
            }
        }

        handleJump () {
            const body = this.fixture.GetBody(),
                yVelocity = body.GetLinearVelocity().y
            ;

            // Allow jumping
            if (!this.jumpAllowed && yVelocity < 0.00001 && this.isTouchingGround()) {
                this.jumpAllowed = true;
            }

            // Jumping
            if (this.jumpAllowed) {
                body.ApplyImpulse(
                    new b2Vec2(0, 9 * this.fixture.GetBody().GetMass()),
                    body.GetDefinition().position
                );

                // Prevent jumping
                this.jumpAllowed = false;
            }
        }

        isTouchingGround () {
            let contacts = this.fixture.GetBody().GetContactList(),
                groundContact,
                isTouchingGround = false
            ;

            while (typeof groundContact === 'undefined' && contacts !== null) {
                if (contacts.contact.GetFixtureA().GetBody().GetUserData() === 'type_ground') {
                    groundContact = contacts.contact;
                    isTouchingGround = groundContact.IsTouching();
                }

                contacts = contacts.next;
            }

            return isTouchingGround;
        }

        isTouchingBall () {
            let contacts = this.fixture.GetBody().GetContactList(),
                ballContact,
                isTouchingBall = false
            ;

            while (typeof ballContact === 'undefined' && contacts !== null) {
                if (contacts.contact.GetFixtureA().GetBody().GetUserData() === 'type_ball') {
                    ballContact = contacts.contact;
                    isTouchingBall = ballContact.IsTouching();
                }

                contacts = contacts.next;
            }

            return isTouchingBall;
        }

        physics () {
            const pos = this.fixture.GetBody().GetDefinition().position;
            this.threeObject.position.x = pos.x;
            this.threeObject.position.y = pos.y;
        }

        moveTo (position) {
            this.fixture.GetBody().SetPosition(new b2Vec2(position[0], position[1]));
            this.fixture.GetBody().SetLinearVelocity(new b2Vec2(0, 0));
        }
    }
});
