document.onkeydown = function onKeyDown  ( event ) {
	switch( event.keyCode ) {
		case 38: /*up*/
		case 87: /*W*/ 
			this.moveForward = true;
			console.log("up");
			break;

		case 37: /*left*/
		case 65: /*A*/ 
			this.moveLeft = true;
			console.log("left");
			break;

		case 40: /*down*/
		case 83: /*S*/ 
			this.moveBackward = true;
			console.log("down");
			break;

		case 39: /*right*/
		case 68: /*D*/ 
			this.moveRight = true;
			console.log("right");
			break;

		case 32: /*space*/ 
			this.jump = true;
			console.log("space");
			break;
	}
};