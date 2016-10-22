class Rules {
    constructor (config) {
        this.defaultConfig = {
            maximumContactsAllowed: 3,
            scoreToWin: 25
        };
        this.config = _.extend({}, this.defaultConfig, config);
    }
}
