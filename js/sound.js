function Sound (sources) {
    // Properties
    this.audio = null;

    // Methods
    this.init = function () {
        this.audio = document.createElement('audio');

        for (var i = 0; i < sources.length; i++) {
            var source = document.createElement('source');
            source.src = sources[i];
            this.audio.appendChild(source);
        }
    };

    this.getAudio = function () {
       return this.audio;
    };

    this.play = function (restart) {
        if (restart === true && this.audio.currentTime > 0) {
            this.stop();
        }

        this.audio.play();
    };

    this.stop = function () {
        this.audio.currentTime = 0;
    };

    this.init();
}