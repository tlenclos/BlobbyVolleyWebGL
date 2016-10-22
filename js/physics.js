define(['lodash'], function (_) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2World = Box2D.Dynamics.b2World;

    return class Physics {
        constructor (gravity) {
            this.gravity = _.isNumber(gravity) ? gravity : 100;
            this.world = null;

            this.init();
        }

        init () {
            this.world = new b2World(
                new b2Vec2(0, -this.gravity),
                true
            );
        }

        getWorld () {
            return this.world;
        }

        step () {
            this.world.Step(
                window.dt,
                10,
                10
            );

            this.world.ClearForces();
        }
    }
});
