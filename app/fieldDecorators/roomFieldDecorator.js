import Abstract from './abstract';
import THREE from 'three';

export default class RoomFieldDecorator extends Abstract {
    initialize () {
        // Ground
        this.field.getParts()[0].material = new THREE.MeshBasicMaterial({
            color: 0xCCCCCC
        });

        // Left wall
        this.field.getParts()[1].material = new THREE.MeshBasicMaterial({
            color: 0xDEDEDE
        });

        // Right wall
        this.field.getParts()[2].material = new THREE.MeshBasicMaterial({
            color: 0xDEDEDE
        });

        // Net
        this.field.getParts()[3].material = new THREE.MeshBasicMaterial({
            color: 0x111111
        });

        // Background
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50, 0),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

        bg.position.z = -10;
        bg.position.y = 12;

        this.parts.push(bg);
    }
}
