export default class Sound {
    constructor (sources) {
        this.sources = sources;
        this.audio = null;

        this.init();
    }

    init () {
        this.audio = document.createElement('audio');

        for (let i = 0; i < this.sources.length; i++) {
            const source = document.createElement('source');
            source.src = this.sources[i];
            this.audio.appendChild(source);
        }
    }

    getAudio () {
       return this.audio;
    }

    play (restart) {
        if (restart === true && this.audio.currentTime > 0) {
            this.stop();
        }

        this.audio.play();
    }

    stop () {
        this.audio.currentTime = 0;
    }
}
