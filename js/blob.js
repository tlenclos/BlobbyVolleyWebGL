function Blob (world, color, spawnPosition) {
    // Shortcuts
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ;

    // Properties
    this.world = world;
    this.color = color;
    this.spawnPosition = spawnPosition;
    this.fixture = null;
    this.threeObject = null;
    this.size = 1;
    this.speed = 10;
    this.jumpAllowed = false;
    this.yVelocity = -1;

    // Methods
    this.init = function() {
        var fixDef = new b2FixtureDef;
        fixDef.density = 1;
        fixDef.friction = 1;
        fixDef.restitution = 0;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(
            this.size / 2,
            this.size / 2
        );

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.x = this.spawnPosition[0];
        bodyDef.position.y = this.spawnPosition[1];

        this.fixture = this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        var geometry = new THREE.CubeGeometry(this.size, this.size, 0);
        var material = new THREE.MeshBasicMaterial({ color: this.color });
        this.threeObject = new THREE.Mesh(geometry, material);
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
        this.fixture.GetBody().ApplyForce(
            new b2Vec2(this.speed * x, 0),
            this.fixture.GetBody().GetDefinition().position
        );
    };

    this.handleJump = function () {
        var body = this.fixture.GetBody(),
            yVelocity = body.GetLinearVelocity().y
        ;

        // Allow jumping
        if (!this.jumpAllowed && this.yVelocity < 0 && yVelocity == 0) {
            this.jumpAllowed = true;
        }

        this.yVelocity = yVelocity;

        // Jumping
        if (this.jumpAllowed) {
            body.ApplyImpulse(
                new b2Vec2(0, 9),
                body.GetDefinition().position
            );

            // Prevent jumping
            this.jumpAllowed = false;
        }
    };

    this.physics = function () {
        var pos = this.fixture.GetBody().GetDefinition().position;
        this.threeObject.position.x = pos.x;
        this.threeObject.position.y = pos.y;
    };

    this.init();
}