function Rules (config) {
    // Properties
    this.config = {
        maximumContactsAllowed: 3,
        scoreToWin: 25
    };

    // Methods
    this.init = function () {
        _.extend(this.config, config);
    };

    this.init();
}
