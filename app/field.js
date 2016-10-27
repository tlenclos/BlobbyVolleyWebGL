import THREE from 'three';
import _ from 'lodash';
import p2 from 'p2';

export default class Field {
    constructor (world, x, y, width, height) {
        this.world = world;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.position = { x: x, y: y };
        this.dims = [width, height];
        this.parts = [];
        this.materials = [];

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
            window.assetManager.get('textures.wood'),
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
            0xDEDEDE,
            0.8
        );

        // Background
        bg = new THREE.Mesh(
            new THREE.PlaneGeometry(110, 90, 0),
            new THREE.MeshBasicMaterial({map: window.assetManager.get('textures.background')})
        );

        bg.position.z = -20;
        bg.position.y = 12;

        this.parts.push(ground, leftWall, rightWall, net, bg);
    }

    createWall (x, y, width, height, depth, texture, color, opacity, userData) {
        const body = new p2.Body({
            mass: 0,
            position: [x, y] // FIXME Bug on y for ground with blob
        });

        if (typeof userData !== 'undefined') {
            body.userData = userData;
        }

        const shape = new p2.Box({
            width: width,
            height: height
        });

        body.addShape(shape);
        body.setDensity(1);

        const physicsMaterial = new p2.Material();

        shape.material = physicsMaterial;
        this.materials.push(physicsMaterial);

        this.world.addBody(body);

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
        mesh.position.x = body.position[0];
        mesh.position.y = body.position[1];

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
