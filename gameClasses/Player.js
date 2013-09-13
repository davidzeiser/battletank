var Player = IgeEntityBox2d.extend({
	classId: 'Player',

	init: function () {
		IgeEntityBox2d.prototype.init.call(this);

		var self = this;

		this.drawBounds(true);

		// Rotate to point upwards
		this.controls = {
			left: false,
			right: false,
			thrust: false,
            brake: false,
            shoot: false
		};

        // Create status variables

            this.status = {
                ammo:  10,
                hp: 100,
                reloading: false
            };


		if (ige.isServer) {
			this.addComponent(IgeVelocityComponent);
        }

		if (!ige.isServer) {
			self.texture(ige.client.textures.ship)
			.width(125)
			.height(75);
		}

		// Define the data sections that will be included in the stream
		this.streamSections(['transform', 'score']);
	},

	/**
	 * Override the default IgeEntity class streamSectionData() method
	 * so that we can check for the custom1 section and handle how we deal
	 * with it.
	 * @param {String} sectionId A string identifying the section to
	 * handle data get / set for.
	 * @param {*=} data If present, this is the data that has been sent
	 * from the server to the client for this entity.
	 * @return {*}
	 */
	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		if (sectionId === 'score') {
			// Check if the server sent us data, if not we are supposed
			// to return the data instead of set it
			if (data) {
				// We have been given new data!
				this._score = data;
			} else {
				// Return current data
				return this._score;
			}
        }

        else {
			// The section was not one that we handle here, so pass this
			// to the super-class streamSectionData() method - it handles
			// the "transform" section by itself
			return IgeEntityBox2d.prototype.streamSectionData.call(this, sectionId, data);
		}
    },

	/**
	 * Called every frame by the engine when this entity is mounted to the
	 * scenegraph.
	 * @param ctx The canvas context to render to.
	 */
	tick: function (ctx) {
		/* CEXCLUDE */
		if (ige.isServer) {
			if (this.controls.left) {
				this.rotateBy(0, 0, Math.radians(-0.2 * ige._tickDelta));
			}

			if (this.controls.right) {
				this.rotateBy(0, 0, Math.radians(0.2 * ige._tickDelta));
			}

            this.velocity.x(this.velocity._x * .2);
            this.velocity.y(this.velocity._y * .2);

			if (this.controls.thrust) {
				this.velocity.byAngleAndPower(this._rotate.z + Math.radians(-180), 0.15);
			}

            if (this.controls.brake) {
                this.velocity.x(this.velocity._x * .7);
                this.velocity.y(this.velocity._x * .7);
            }
            if (this.controls.shoot) {
                if(!this.status.reloading) {
                    this.bullet = new Bullet()
                        .streamMode(1)
                        .id('bullet')
                        .velocity.byAngleAndPower(this._rotate.z + Math.radians(-180), 2)
                        .mount(this);

                    this.status.reloading = true;
                }
            }
		}
		/* CEXCLUDE */

		if (!ige.isServer) {
			if (ige.input.actionState('left')) {
				if (!this.controls.left) {
					// Record the new state
					this.controls.left = true;

					// Tell the server about our control change
					ige.network.send('playerControlLeftDown');
				}
			} else {
				if (this.controls.left) {
					// Record the new state
					this.controls.left = false;

					// Tell the server about our control change
					ige.network.send('playerControlLeftUp');
				}
			}

			if (ige.input.actionState('right')) {
				if (!this.controls.right) {
					// Record the new state
					this.controls.right = true;

					// Tell the server about our control change
					ige.network.send('playerControlRightDown');
				}
			} else {
				if (this.controls.right) {
					// Record the new state
					this.controls.right = false;

					// Tell the server about our control change
					ige.network.send('playerControlRightUp');
				}
			}

			if (ige.input.actionState('thrust')) {
				if (!this.controls.thrust) {
					// Record the new state
					this.controls.thrust = true;

					// Tell the server about our control change
					ige.network.send('playerControlThrustDown');
				}
			} else {
				if (this.controls.thrust) {
					// Record the new state
					this.controls.thrust = false;

					// Tell the server about our control change
					ige.network.send('playerControlThrustUp');
				}
			}
            if (ige.input.actionState('brake')) {
                if (!this.controls.brake) {
                    // Record the new state
                    this.controls.brake = true;

                    // Tell the server about our control change
                    ige.network.send('playerControlBrakeDown');
                }
            } else {
                if (this.controls.brake) {
                    // Record the new state
                    this.controls.brake = false;

                    // Tell the server about our control change
                    ige.network.send('playerControlBrakeUp');
                }
            }
            if (ige.input.actionState('shoot')) {
                if (!this.controls.shoot) {
                    // Record the new state
                    this.controls.shoot = true;

                    // Tell the server about our control change
                    ige.network.send('playerControlShootDown');
                }
            } else {
                if (this.controls.shoot) {
                    // Record the new state
                    this.controls.shoot = false;

                    // Tell the server about our control change
                    ige.network.send('playerControlShootUp');
                }
            }
		}

		// Call the IgeEntity (super-class) tick() method
		IgeEntityBox2d.prototype.tick.call(this, ctx);
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Player; }