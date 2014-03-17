function ScreenManager (screens) {
    // Properties
    this.screens = null;
    this.history = [];

    // Methods
    this.init = function () {
        _.each(screens, function(item) {
            if ( !(item instanceof HTMLElement) ) {
                throw "Screen must be an instance of HTMLElement";
            }
        });

        this.screens = screens;
    };

    // Methods
    this.goTo = function (scene) {
        if (_.isUndefined(this.screens[scene])) {
            throw "Scene does not exist";
        }

        this.history.push(scene);
        var screen = this.screens[scene];

        this.hide();
        screen.style.display = 'block';
    };

    this.goBack = function() {
        var index = this.history.length-2;
        if (index >= 0) {
            var previousScreen = this.history[index];
            if (previousScreen) {
                this.goTo(previousScreen);
            }
        }
    }

    this.hide = function() {
        _.each(this.screens, function(item) {
            item.style.display = 'none';
        });
    };

    this.init();
}