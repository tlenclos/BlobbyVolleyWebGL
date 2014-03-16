function Blob (world, color, spawnPosition) {
    // Shortcuts
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ;

    // Properties
    this.world = world;
    this.color = color;
    this.spawnPosition = spawnPosition;
    this.fixture = null;
    this.threeObject = null;
    this.radius = 1;
    this.speed = 5;
    this.jumpAllowed = false;

    // Methods
    this.init = function() {
        var fixDef = new b2FixtureDef;
        fixDef.density = 100;
        fixDef.friction = 1;
        fixDef.restitution = 0;
        fixDef.shape = new b2CircleShape(this.radius);

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.fixedRotation = true;
        bodyDef.position.x = this.spawnPosition[0];
        bodyDef.position.y = this.spawnPosition[1];

        this.fixture = this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        var geometry = new THREE.CylinderGeometry(this.radius, this.radius, 0, 7, 1, false);
        var material = new THREE.MeshBasicMaterial({ color: this.color });
        this.threeObject = new THREE.Mesh(geometry, material);
        this.threeObject.rotation.x += 90 * Math.PI / 180;
    };

    this.getFixture = function () {
        return this.fixture;
    };

    this.move = function(x, y) {
        // Vertical jump
        if (y > 0) {
            this.handleJump();
        }


        // Horizontal move
        if (x !== 0) {
            var body = this.fixture.GetBody(),
                vel = body.GetLinearVelocity(),
                velDelta = (this.speed * x) - vel.x,
                force = body.GetMass() * velDelta / (dt)
            ;

            body.ApplyForce(
                new b2Vec2(force, 0),
                body.GetDefinition().position
            );
        }
    };

    this.handleJump = function () {
        var body = this.fixture.GetBody(),
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
    };

    this.isTouchingGround = function () {
        var contacts = this.fixture.GetBody().GetContactList(),
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
    };

    this.isTouchingBall = function () {
        var contacts = this.fixture.GetBody().GetContactList(),
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
    };

    this.physics = function () {
        var pos = this.fixture.GetBody().GetDefinition().position;
        this.threeObject.position.x = pos.x;
        this.threeObject.position.y = pos.y;
    };

    this.init();
}
