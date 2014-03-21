function Player (name, controls, side) {
    // Properties
    this.name = name;
    this.controls = controls;
    this.side = null;
    this.keyboard = null;
    this.blob = null;
    this.currentTouches = null;
    var self = this;

    // Methods
    this.init = function () {
        this.side = side;
        this.keyboard = new THREEx.KeyboardState();
        this.currentTouches = 0;
    };

    this.setControls = function(controls) {
        _.each(controls, function(value, key) {
            self.setControlForKey(key, value);
        });
    };

    this.setControlForKey = function(key, keyBinding) {

        if (_.isUndefined(this.controls[key])) {
            throw "This control does not exist";
        }

        this.controls[key] = keyBinding;
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
