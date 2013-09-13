var Bullet = IgeEntityBox2d.extend({
    classId: 'Bullet',

    init: function () {
        IgeEntityBox2d.prototype.init.call(this);

        var self = this;

        this.drawBounds(false);
        this.damage = 25;

        if (ige.isServer) {
            this.addComponent(IgeVelocityComponent);
        }

        self.width(5)
            .height(5)
            .deathTime(5000)
            .box2dBody({
                type: 'dynamic',
                linearDamping: 0.0,
                angularDamping: 0.3,
                allowSleep: true,
                bullet: true,
                gravitic: true,
                fixedRotation: false,
                fixtures: [{
                    density: 5.0,
                    friction: 5.0,
                    restitution: 0.0,
                    shape: {
                        type: 'rectangle'
                    }
                }]
            })

    },

    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    tick: function (ctx) {
        // Call the IgeEntity (super-class) tick() method
        IgeEntityBox2d.prototype.tick.call(this, ctx);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Bullet; }