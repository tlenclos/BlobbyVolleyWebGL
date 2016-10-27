import _ from 'lodash';
import p2 from 'p2';

export default class Physics {
    constructor (gravity) {
        this.gravity = _.isNumber(gravity) ? gravity : 100;
        this.world = null;

        this.init();
    }

    init () {
        this.world = new p2.World({
            gravity: [0, -this.gravity]
        });
    }

    getWorld () {
        return this.world;
    }

    step (fixedTimeStep, deltaTime, maxSubSteps) {
        this.world.step(fixedTimeStep, deltaTime, maxSubSteps);
    }
}
