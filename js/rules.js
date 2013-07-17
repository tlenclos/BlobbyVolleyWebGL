function Rules () {
    // Properties
    this.maximumContacts = null;
    this.scoreToWin = null;
    this.scores = [];

    // Methods
    this.init = function () {
    };

    this.apply = function () {
        /*
        this.fireEvent('party:start');
        if (_.max(this.scores) === this.scoreToWin) {
            this.fireEvent('party:stop');
        }
        */
    };

    this.fireEvent = function (eventName, data) {
        var event = new CustomEvent(eventName, data);
        document.dispatchEvent(event);
    };

    this.init();
}