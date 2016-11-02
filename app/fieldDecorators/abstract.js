export default class Abstract {
    constructor (field) {
        this.field = field;
        this.parts = [];
        this.initialize();
    }

    getParts () {
        return this.parts;
    }
}
