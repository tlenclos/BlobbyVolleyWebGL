import EventEmitter from './eventEmitter';
import THREE from 'three';
import _ from 'lodash';

export default class AssetManager extends EventEmitter {
    constructor () {
        super();

        this.assets = {};
        this.loadingManager = new THREE.LoadingManager();
        this.loadingManager.onLoad = this._loaded.bind(this);
        this.loadingManager.onProgress = this._progressing.bind(this);
        this.loadingManager.onError = this._error.bind(this);
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    }

    _loaded (...args) {
        this.dispatch('loaded', ...args);
    }

    _progressing (...args) {
        this.dispatch('progress', ...args);
    }

    _error (...args) {
        this.dispatch('error', ...args);
    }

    loadTexture (path) {
        this.textureLoader.load(
            path,
            (texture) => this.set(path.replace(/\.[^.]+$/, '').replace('/', '.'), texture)
        );
    }

    has (path) {
        return _.has(this.assets, path);
    }

    get (path) {
        return _.get(this.assets, path);
    }

    set (path, asset) {
        _.set(this.assets, path, asset);
        return this;
    }
}
