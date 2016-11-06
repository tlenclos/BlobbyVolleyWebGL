import collisions from './collisions';
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
        this.fieldDecorator = null;

        this.init();
    }

    init () {
        // Base field (ground, walls, net)
        const ground = this.createWall(
            this.x,
            this.y - (this.height / 2) - 0.5,
            this.width,
            1,
            20,
            collisions.FIELD,
            -1,
            'type_ground'
        );

        const leftWall = this.createWall(
            this.x - (this.width / 2) - 0.5,
            this.y + (this.height / 2),
            1,
            this.height * 5,
            20,
            collisions.FIELD,
            -1
        );

        const rightWall = this.createWall(
            this.x + (this.width / 2) + 0.5,
            this.y + (this.height / 2),
            1,
            this.height * 5,
            20,
            collisions.FIELD,
            -1
        );

        const net = this.createWall(
            this.x,
            this.y - (this.height / 2) + (this.height / 4),
            0.3,
            this.height / 2,
            20,
            collisions.FIELD,
            -1
        );

        const playerSeparatorWall = this.createWall(
            this.x,
            this.y - (this.height / 2) + (this.height / 4),
            0.7,
            this.height * 5,
            20,
            collisions.PLAYER_SEPARATOR,
            collisions.BLOB
        );

        this.parts.push(ground, leftWall, rightWall, net, playerSeparatorWall);
    }

    createWall (x, y, width, height, depth, collisionGroup, collisionMask, userData) {
        const body = new p2.Body({
            mass: 0,
            position: [x, y]
        });

        if (typeof userData !== 'undefined') {
            body.userData = userData;
        }

        const shape = new p2.Box({
            width: width,
            height: height
        });

        shape.collisionGroup = collisionGroup;
        shape.collisionMask = collisionMask;

        body.addShape(shape);
        body.setDensity(1);

        const physicsMaterial = new p2.Material();

        shape.material = physicsMaterial;
        this.materials.push(physicsMaterial);

        this.world.addBody(body);

        const geometry = new THREE.BoxGeometry(width, height, _.isNumber(depth) ? depth : 0);

        const material = new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true
        });

        const mesh = new THREE.Mesh(
            geometry,
            material
        );
        mesh.position.x = body.position[0];
        mesh.position.y = body.position[1];

        return mesh;
    }

    setDecorator (fieldDecorator) {
        this.fieldDecorator = fieldDecorator;
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
        const decoratorParts = this.fieldDecorator ? this.fieldDecorator.getParts() : [];

        return [
            ...this.parts,
            ...decoratorParts
        ];
    }
}
