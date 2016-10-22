define([], function () {
    return class EventEmitter {
        constructor () {
            this.listeners = {};
        }

        on (eventName, listener) {
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }

            this.listeners[eventName].push(listener);
        }

        dispatch (eventName, ...args) {
            if (this.listeners[eventName]) {
                for (let i = 0; i < this.listeners[eventName].length; i++) {
                    this.listeners[eventName][i](this, ...args);
                }
            }
        }
    }
});
