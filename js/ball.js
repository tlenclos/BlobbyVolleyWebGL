define(['./sound', 'Box2D', 'THREE'], function (Sound, Box2D, THREE) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

    return class Ball {
        constructor (world, color, spawnPosition) {
            this.world = world;
            this.color = color;
            this.spawnPosition = spawnPosition;
            this.radius = 1.1; // TODO : If we reduce the radius the ball can be stuck against a wall and the blob can't move it
            this.maxSpeed = 12;
            this.fixture = null;
            this.threeObject = null;
            this.sound = null;

            this.init();
        }

        getFixture () {
            return this.fixture;
        }

        init () {
            const fixDef = new b2FixtureDef;
            fixDef.density = 1.0;
            fixDef.friction = 0;
            fixDef.restitution = 1;
            fixDef.shape = new b2CircleShape(this.radius);

            const bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.x = this.spawnPosition[0];
            bodyDef.position.y = this.spawnPosition[1];
            bodyDef.userData = 'type_ball';

            this.fixture = this.world.CreateBody(bodyDef).CreateFixture(fixDef);

            const texture = THREE.ImageUtils.loadTexture('textures/ball.jpg');
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

        physics () {
            const body = this.fixture.GetBody(),
                pos = body.GetDefinition().position,
                velocity = body.GetLinearVelocity(),
                speed = velocity.Length()
            ;

            if (speed > this.maxSpeed) {
                body.SetLinearVelocity(
                    new b2Vec2(
                        this.maxSpeed / speed * velocity.x,
                        this.maxSpeed / speed * velocity.y
                    )
                );
            }

            this.threeObject.position.x = pos.x;
            this.threeObject.position.y = pos.y;

            if (this.hasTouchingContact()) {
                this.sound.play(true);
            }
        }

        hasTouchingContact () {
            let touching = false,
                contacts = this.fixture.GetBody().GetContactList()
            ;

            while (touching === false && contacts !== null) {
                touching = contacts.contact.IsTouching();
                contacts = contacts.next;
            }

            return touching;
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

        moveTo (position) {
            this.fixture.GetBody().SetPosition(new b2Vec2(position[0], position[1]));
            this.fixture.GetBody().SetLinearVelocity(new b2Vec2(0, 0));
        }
    }
});
