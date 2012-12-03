function Player (name, controls) {
    // Properties
    this.name = name;
    this.controls = {
        'up': controls[0],
        'right': controls[1],
        'left': controls[2]
    };
    this.keyboard = null;
    this.blob = null;

    // Methods
    this.init = function () {
        this.keyboard = new THREEx.KeyboardState();
    };

    this.getControlsAntagonistKey = function (key) {
        var antagonists = {
            'left': 'right',
            'right': 'left'
        };

        return antagonists[key];
    };

    this.listenInput = function () {
        var x = 0,
            y = 0
        ;

        for (var key in this.controls) {
            var control = this.controls[key],
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
    };

    this.attachBlob = function(blob) {
        this.blob = blob;
    };

    this.detachBlob = function() {
        this.blob = null;
    };

    this.getBlob = function () {
        return this.blob;
    };

    this.moveBlob = function (x, y) {
        if (this.blob !== null) {
            this.blob.move(x, y);
        }
    };

    this.init();
}