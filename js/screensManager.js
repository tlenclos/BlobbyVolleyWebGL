function ScreenManager (screens, flashMessageElement, flashMessageTextElement) {
    // Properties
    this.screens = null;
    this.history = [];
    this.flashMessageElement = flashMessageElement;
    this.flashMessageTextElement = flashMessageTextElement;
    this.listeners = {};

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

    this.goTo = function (screen) {
        this.displayScreen(screen);
        this.history.push(screen);
    };

    this.goBack = function() {
        var index = this.history.length-2;

        if (index >= 0) {
            var previousScreen = this.history[index];
            if (previousScreen) {
                this.displayScreen(previousScreen);
                this.history.pop();
            }
        }
    };

    this.displayScreen = function(screen) {
        if (_.isUndefined(this.screens[screen])) {
            throw "Screen does not exist";
        }

        this.dispatch(screen);
        var screen = this.screens[screen];

        this.hide();
        screen.style.display = 'block';
    };

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

    this.on = function(eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(listener);
    },

    this.dispatch = function(eventName) {
        if (this.listeners[eventName]) {
            for(var i=0; i<this.listeners[eventName].length; i++) {
                this.listeners[eventName][i](this);
            }
        }
    },

    this.init();
}