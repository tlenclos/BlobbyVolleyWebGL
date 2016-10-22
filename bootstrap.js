require.config({
    baseUrl: 'js',
    paths: {
        lodash: 'libs/lodash.min',
        Box2D: 'libs/Box2dWeb-2.1.a.3',
        Stats: 'libs/stats.min',
        THREE: 'libs/three.min',
        OrbitControls: 'libs/OrbitControls',
        THREExWindowResize: 'libs/THREEx.WindowResize',
        THREExKeyboardState: 'libs/THREEx.KeyboardState'
    },
    shim: {
        Box2D: {
            exports: 'Box2D'
        },
        Stats: {
            exports: 'Stats'
        },
        THREE: {
            exports: 'THREE'
        },
        OrbitControls: {
            deps: ['THREE'],
            exports: 'THREE'
        },
        THREExWindowResize: {
            deps: ['THREE'],
            exports: 'THREEx',
            init: function () {
                return this.THREEx.WindowResize;
            }
        },
        THREExKeyboardState: {
            deps: ['THREE'],
            exports: 'THREEx',
            init: function () {
                return this.THREEx.KeyboardState;
            }
        }
    }
});

require(['main']);
