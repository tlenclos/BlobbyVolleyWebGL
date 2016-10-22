import _ from 'lodash';

export default class ScreenManager {
    constructor (screens, flashMessageElement, flashMessageTextElement) {
        _.forEach(screens, function (item) {
            if (!(item instanceof HTMLElement)) {
                throw "Screen must be an instance of HTMLElement";
            }
        });

        if (!(flashMessageElement instanceof HTMLElement)) {
            throw "flashMessageElement must be an instance of HTMLElement";
        }

        if (!(flashMessageTextElement instanceof HTMLElement)) {
            throw "flashMessageTextElement must be an instance of HTMLElement";
        }

        this.screens = screens;
        this.flashMessageElement = flashMessageElement;
        this.flashMessageTextElement = flashMessageTextElement;
        this.history = [];
        this.listeners = {};
    }

    goTo (screen) {
        this.displayScreen(screen);
        this.history.push(screen);
    }

    goBack () {
        const index = this.history.length-2;

        if (index >= 0) {
            const previousScreen = this.history[index];
            if (previousScreen) {
                this.displayScreen(previousScreen);
                this.history.pop();
            }
        }
    }

    displayScreen (name) {
        if (_.isUndefined(this.screens[name])) {
            throw "Screen does not exist";
        }

        this.dispatch(name);
        const screen = this.screens[name];

        this.hide();
        screen.style.display = 'block';
    }

    hide () {
        _.forEach(this.screens, function (item) {
            item.style.display = 'none';
        });
    }

    displayFlashMessage (message, duration) {
        this.flashMessageTextElement.textContent = message;
        this.fadeIn(this.flashMessageElement);

        setTimeout(function () {
            this.fadeOut(this.flashMessageElement)
        }.bind(this), duration ? duration : 2000);
    }

    fadeIn (el) {
        el.style.display = 'block';
        el.style.opacity = 0;

        let last = +new Date();
        const tick = function () {
            el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
            last = +new Date();

            if (+el.style.opacity < 1) {
              (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            }
        };

        tick();
    }

    fadeOut (el) {
        el.style.display = 'block';
        el.style.opacity = 1;

        let last = +new Date();
        const tick = function () {
            el.style.opacity -= (new Date() - last) / 400;
            last = +new Date();

            if (+el.style.opacity > 0) {
              (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            }
        };

        tick();
    }

    on (eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(listener);
    }

    dispatch (eventName) {
        if (this.listeners[eventName]) {
            for (let i = 0; i < this.listeners[eventName].length; i++) {
                this.listeners[eventName][i](this);
            }
        }
    }
}
