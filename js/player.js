define([], function () {
    return class Player {
        constructor (name, controls, side) {
            this.name = name;
            this.controls = controls;
            this.side = side;
            this.keyboard = new THREEx.KeyboardState();
            this.blob = null;
            this.currentTouches = 0;
        }

        setControls (controls) {
            _.each(controls, function(value, key) {
                this.setControlForKey(key, value);
            }, this);
        }

        setControlForKey (key, keyBinding) {
            if (_.isUndefined(this.controls[key])) {
                throw "This control does not exist";
            }

            this.controls[key] = keyBinding;
        }

        getControlsAntagonistKey (key) {
            const antagonists = {
                'left': 'right',
                'right': 'left'
            };

            return antagonists[key];
        }

        listenInput () {
            let x = 0,
                y = 0;

            for (let key in this.controls) {
                const control = this.controls[key],
                    antagonistControl = this.controls[this.getControlsAntagonistKey(key)]
                ;

                if (
                    this.keyboard.pressed(control)
                    &&
                    (
                        typeof antagonistControl === 'undefined' || !this.keyboard.pressed(antagonistControl)
                    )
                ) {
                    switch (key) {
                    case 'up':
                        y = 1;
                        break;
                    case 'right':
                        x = 1;
                        break;
                    case 'left':
                        x = -1;
                        break;
                    }

                    this.moveBlob(x, y);
                }
            }
        }

        attachBlob (blob) {
            this.blob = blob;
        }

        detachBlob () {
            this.blob = null;
        }

        getBlob () {
            return this.blob;
        }

        moveBlob (x, y) {
            if (this.blob !== null) {
                this.blob.move(x, y);
            }
        }
    }
});
