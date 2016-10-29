export default class KeyboardState {
    constructor (element) {
        this.target = element || document;
        this.pressedKeys = new Set();
        this._onKeydownBound = this._onKeydown.bind(this);
        this._onKeyupBound = this._onKeyup.bind(this);

        this.target.addEventListener('keydown', this._onKeydownBound, false);
        this.target.addEventListener('keyup', this._onKeyupBound, false);
    }

    _onKeydown (event) {
        this.pressedKeys.add(event.key);
    }

    _onKeyup (event) {
        this.pressedKeys.delete(event.key);
    }

    pressed (key) {
        return this.pressedKeys.has(key);
    }

    destroy () {
        this.target.removeEventListener('keydown', this._onKeydownBound, false);
        this.target.removeEventListener('keyup', this._onKeyupBound, false);
    }
}
