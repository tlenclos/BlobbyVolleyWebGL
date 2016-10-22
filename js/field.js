var b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

class Field {
    constructor (world, x, y, width, height) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.position = { x: x, y: y };
        this.dims = [width, height];
        this.parts = [];

        this.init();
    }

    init () {
        let ground, leftWall, rightWall, net, bg;

        ground = this.createWall(
            this.x,
            this.y - (this.height / 2) - 0.5,
            this.width,
            0.5,
            20,
            null,
            2,
            null,
            THREE.ImageUtils.loadTexture('textures/wood.jpg'),
            0xEEEEEE,
            null,
            'type_ground'
        );

        leftWall = this.createWall(
            this.x - (this.width / 2) - 0.5,
            this.y + (this.height / 2),
            0.5,
            this.height * 2,
            20,
            null,
            0,
            null,
            null,
            0xDEDEDE,
            0
        );

        rightWall = this.createWall(
            this.x + (this.width / 2) + 0.5,
            this.y + (this.height / 2),
            0.5,
            this.height * 2,
            20,
            null,
            0,
            null,
            null,
            0xDEDEDE,
            0
        );

        net = this.createWall(
            this.x,
            this.y - (this.height / 2) + (this.height / 4),
            0.15,
            this.height / 2,
            20,
            null,
            0,
            null,
            null,
            0xDEDEDE,
            0.8
        );

        // Background
        bg = new THREE.Mesh(
            new THREE.PlaneGeometry(110, 90, 0),
            new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('textures/background.jpg')})
        );

        bg.position.z = -20;
        bg.position.y = 12;

        this.parts.push(ground, leftWall, rightWall, net, bg);
    }

    createWall (x, y, width, height, depth, density, friction, restitution, texture, color, opacity, userData) {
        const bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;

        const fixDef = new b2FixtureDef;
        fixDef.density = _.isNumber(density) ? density : 1;
        fixDef.friction = _.isNumber(friction) ? friction : 0.5;
        fixDef.restitution = _.isNumber(restitution) ? restitution : 0;
        fixDef.shape = new b2PolygonShape;

        if (width > height) {
            fixDef.shape.SetAsBox(width / 2, height);
        } else {
            fixDef.shape.SetAsBox(width, height / 2);
        }

        const body = this.world.CreateBody(bodyDef);

        if (typeof userData !== 'undefined') {
            body.SetUserData(userData);
        }

        body.CreateFixture(fixDef);

        const geometry = width > height
            ? new THREE.BoxGeometry(width, height * 2, _.isNumber(depth) ? depth : 0)
            : new THREE.BoxGeometry(width * 2, height, _.isNumber(depth) ? depth : 0)
        ;

        let material;

        if (texture instanceof THREE.Texture) {
            material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            });
        } else {
            material = new THREE.MeshBasicMaterial({
                color: !_.isUndefined(color) ? color : 0x000000,
                opacity: !_.isUndefined(opacity) ? opacity : 1,
                transparent: true
            });
        }

        const mesh = new THREE.Mesh(
            geometry,
            material
        );
        mesh.position.x = bodyDef.position.x;
        mesh.position.y = bodyDef.position.y;

        return mesh;
    }

    getWorld () {
        return this.world;
    }

    getPosition () {
        return this.position;
    }

    getDims () {
        return this.dims;
    }

    getParts () {
        return this.parts;
    }
}
