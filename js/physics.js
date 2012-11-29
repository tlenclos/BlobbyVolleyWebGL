function Physics (gravity) {
    // Shortcuts
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2World = Box2D.Dynamics.b2World
    ;

    // Properties
    this.gravity = _.isNumber(gravity) ? gravity : 100;
    this.world = null;

    // Methods
    this.init = function () {
        this.world = new b2World(
            new b2Vec2(0, -this.gravity),
            true
        );
    };

    this.getWorld = function () {
        return this.world;
    };

    this.step = function () {
        this.world.Step(
            1 / 60, // TODO A revoir
            10,
            10
        );

        this.world.ClearForces();
    };

    this.init();
}