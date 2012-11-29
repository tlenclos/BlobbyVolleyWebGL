function Field (world, x, y, width, height) {
    // Shortcuts
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ;

    // Properties
    this.world = world;
    this.position = { x: x, y: y };
    this.dims = [width, height];
    this.walls = [];

    // Methods
    this.init = function () {
        var ground, ceil, leftWall, rightWall, net;
        var wallColor = 0x000000;

        ground = this.createWall(x, y - (height / 2) - 0.5, width, 0.5, wallColor);
        ceil = this.createWall(x, y + (height / 2) + 0.5, width, 0.5, wallColor);
        leftWall = this.createWall(x - (width / 2) - 0.5, y, 0.5, height, wallColor, null, 0);
        rightWall = this.createWall(x + (width / 2) + 0.5, y, 0.5, height, wallColor, null, 0);
        net = this.createWall(x, y - (height / 2) + (height / 4), 0.5, height / 2, wallColor, null, 0);

        this.walls.push(ground, ceil, leftWall, rightWall, net);
    };

    this.createWall = function (x, y, width, height, color, density, friction, restitution) {
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;

        var fixDef = new b2FixtureDef;
        fixDef.density = _.isNumber(density) ? density : 1;
        fixDef.friction = _.isNumber(friction) ? friction : 0.5;
        fixDef.restitution = _.isNumber(restitution) ? restitution : 0;
        fixDef.shape = new b2PolygonShape;

        if (width > height) {
            fixDef.shape.SetAsBox(width / 2, height);
        } else {
            fixDef.shape.SetAsBox(width, height / 2);
        }

        this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        var geometry = width > height
            ? new THREE.CubeGeometry(width, height * 2, 0)
            : new THREE.CubeGeometry(width * 2, height, 0)
        ;

        var mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ color: color })
        );
        mesh.position.x = bodyDef.position.x;
        mesh.position.y = bodyDef.position.y;

        return mesh;
    };

    this.getWorld = function () {
        return this.world;
    };

    this.getPosition = function () {
        return this.position;
    };

    this.getDims = function () {
        return this.dims;
    };

    this.getWalls = function () {
        return this.walls;
    };

    this.init();
}