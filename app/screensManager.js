import _ from 'lodash';
import EventEmitter from './eventEmitter';

export default class ScreenManager extends EventEmitter {
    constructor (screens, flashMessageElement, flashMessageTextElement) {
        super();

        _.forEach(screens, function (item) {
            if (!(item instanceof HTMLElement)) {
                throw new Error("Screen must be an instance of HTMLElement");
            }
        });

        if (!(flashMessageElement instanceof HTMLElement)) {
            throw new Error("flashMessageElement must be an instance of HTMLElement");
        }

        if (!(flashMessageTextElement instanceof HTMLElement)) {
            throw new Error("flashMessageTextElement must be an instance of HTMLElement");
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
        return this;
    }

    goBack () {
        const index = this.history.length - 2;

        if (index >= 0) {
            const previousScreen = this.history[index];
            if (previousScreen) {
                this.displayScreen(previousScreen);
                this.history.pop();
            }
        }
    }

    getScreen (name) {
        if (_.isUndefined(this.screens[name])) {
            throw new Error(`Screen ${name} does not exist`);
        }

        return this.screens[name];
    }

    displayScreen (name) {
        const screen = this.getScreen(name);

        this.dispatch(name);
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
            this.fadeOut(this.flashMessageElement);
        }.bind(this), duration ? duration : 2000);
    }

    fadeIn (el) {
        el.style.display = 'block';
        el.style.opacity = 0;

        let last = +new Date();
        const tick = function () {
            el.style.opacity = +el.style.opacity + ((new Date() - last) / 400);
            last = +new Date();

            if (+el.style.opacity < 1) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
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
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
        };

        tick();
    }
}
