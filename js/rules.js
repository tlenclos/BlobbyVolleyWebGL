function Rules (config) {
    // Properties
    this.config = {
        maximumContactsAllowed: 1,
        scoreToWin: 4
    };

    // Methods
    this.init = function () {
        _.extend(this.config, config);
    };

    this.init();
}
