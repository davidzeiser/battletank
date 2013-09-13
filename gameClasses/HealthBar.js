var HealthBar = IgeUiEntity.extend({
    classId: 'HealthBar',

    init: function () {
        IgeUiEntity.prototype.init.call(this);

        var self = this;

        this.drawBounds(false);


        this.hp = 100;


        self.backgroundColor('#42db13')
            .width(192)
            .height(32)
    },

    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    tick: function (ctx) {
        this.hp = ige.client.ui.hp;
        this.width(this.hp * 1.92);
        this.top(15);
        this.left(15);

        // Call the IgeEntity (super-class) tick() method
        IgeUiEntity.prototype.tick.call(this, ctx);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = HealthBar; }