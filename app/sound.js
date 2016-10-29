import { Howl } from 'howler';
import _ from 'lodash';

export default class Sound {
    constructor (sources, options) {
        this.sources = sources;
        this.audio = new Howl(
            _.assign(
                {
                    src: sources
                },
                options
            )
        );
        this.play = _.throttle(this._play.bind(this), 100, { leading: true });
    }

    getAudio () {
        return this.audio;
    }

    _play (id) {
        this.audio.play(id);
    }

    pause (id) {
        this.audio.pause(id);
    }

    stop (id) {
        this.audio.stop(id);
    }
}
