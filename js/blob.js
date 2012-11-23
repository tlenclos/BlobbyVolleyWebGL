function Blob (_color) {
    this.color = _color;
    this.threeObject = null;
    this.init = function() {
        var geometry = new THREE.CubeGeometry(1,1,1);
        var material = new THREE.MeshBasicMaterial({color: this.color});
        this.threeObject = new THREE.Mesh(geometry, material);
    };
    this.move = function(x) {
        this.threeObject.position.x += x;
    };
    this.init();
}