function ScreenManager (screens, flashMessageElement, flashMessageTextElement) {
    // Properties
    this.screens = null;
    this.history = [];
    this.flashMessageElement = flashMessageElement;
    this.flashMessageTextElement = flashMessageTextElement;

    // Methods
    this.init = function () {
        _.each(screens, function(item) {
            if ( !(item instanceof HTMLElement) ) {
                throw "Screen must be an instance of HTMLElement";
            }
        });

        if (
            !(this.flashMessageElement instanceof HTMLElement)
            || !(this.flashMessageTextElement instanceof HTMLElement)
        ) {
            throw "Screen must be an instance of HTMLElement";
        }

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

    this.displayFlashMessage = function(message, duration) {
        this.flashMessageTextElement.textContent = message;
        this.fadeIn(this.flashMessageElement);

        var self = this;
        setTimeout(function() {
            self.fadeOut(self.flashMessageElement)
        }, duration ? duration : 2000);
    };

    this.fadeIn = function(el) {
        el.style.display = 'block';
        el.style.opacity = 0;

        var last = +new Date();
        var tick = function() {
            el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
            last = +new Date();

            if (+el.style.opacity < 1) {
              (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            }
        };

        tick();
    }

    this.fadeOut = function(el) {
        el.style.display = 'block';
        el.style.opacity = 1;

        var last = +new Date();
        var tick = function() {
            el.style.opacity -= (new Date() - last) / 400;
            last = +new Date();

            if (+el.style.opacity > 0) {
              (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            }
        };

        tick();
    }

    this.init();
}