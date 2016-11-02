import Abstract from './abstract';
import THREE from 'three';

export default class BeachFieldDecorator extends Abstract {
    initialize () {
        // Ground
        this.field.getParts()[0].material = new THREE.MeshBasicMaterial({
            map: window.assetManager.get('textures.wood'),
            transparent: true
        });

        // Net
        this.field.getParts()[3].material = new THREE.MeshBasicMaterial({
            color: 0xDEDEDE,
            opacity: 0.8,
            transparent: true
        });

        // Background
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(110, 90, 0),
            new THREE.MeshBasicMaterial({
                map: window.assetManager.get('textures.background')
            })
        );

        bg.position.z = -20;
        bg.position.y = 12;

        this.parts.push(bg);
    }
}
