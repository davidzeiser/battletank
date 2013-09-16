var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;
		ige.timeScale(1);

		// Define an object to hold references to our player entities
		this.players = {};

		// Add the server-side game methods / event handlers
		this.implement(ServerNetworkEvents);

        ige.addComponent(IgeBox2dComponent)
            .box2d.sleep(true)
            .box2d.gravity(0, 0)
            .box2d.createWorld()
            .box2d.start();

		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						// Create some network commands we will need
						ige.network.define('playerEntity', self._onPlayerEntity);
                        ige.network.define('playerDamage', self._onPlayerDamage);
                        ige.network.define('playerDeath', self._onPlayerDeath);


                        ige.network.define('playerControlLeftDown', self._onPlayerLeftDown);
						ige.network.define('playerControlRightDown', self._onPlayerRightDown);
						ige.network.define('playerControlThrustDown', self._onPlayerThrustDown);
                        ige.network.define('playerControlBrakeDown', self._onPlayerBrakeDown);
                        ige.network.define('playerControlShootDown', self._onPlayerShootDown);

						ige.network.define('playerControlLeftUp', self._onPlayerLeftUp);
						ige.network.define('playerControlRightUp', self._onPlayerRightUp);
						ige.network.define('playerControlThrustUp', self._onPlayerThrustUp);
                        ige.network.define('playerControlBrakeUp', self._onPlayerBrakeUp);
                        ige.network.define('playerControlShootUp', self._onPlayerShootUp);

						ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
						ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(30) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Create the scene
						self.mainScene = new IgeScene2d()
							.id('mainScene');

						// Create the scene
						self.scene1 = new IgeScene2d()
							.id('scene1')
							.mount(self.mainScene);

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.mainScene)
							.drawBounds(true)
							.mount(ige);

                        ige.box2d.contactListener(
                            // Listen for when contact's begin
                            function (contact) {
                                // Send collision damage to both players
                                var playerA = ige.$(contact.igeEntityA()._id),
                                    playerB = ige.$(contact.igeEntityB()._id),
                                    dmgtoA = Math.random() * 10,
                                    dmgtoB = Math.random() * 10;

                                self.players[playerA.id()].status.hp -= dmgtoA;
                                self.players[playerB.id()].status.hp -= dmgtoB;
                                // Check if A was killed by B
                                if(playerA.status.hp <= 0)
                                {
                                    ige.network.send('playerDeath',playerB.id(), playerA.id());
                                    self.players[playerA.id()].alive = false;
                                    //delete self.players[playerA.id()];
                                }
                                else
                                    ige.network.send('playerDamage',dmgtoA,playerA.id());

                                // Check if B was killed by A
                                if(playerB.status.hp <= 0)
                                {
                                    ige.network.send('playerDeath',playerA.id(), playerB.id());
                                    self.players[playerB.id()].alive = false;
                                    //delete self.players[playerB.id()];
                                }
                                else
                                    ige.network.send('playerDamage',dmgtoB,playerB.id());

                            },
                            // Listen for when contact's end
                            function (contact) {
                                //console.log('Contact ends between', getID(contact.igeEntityA()._id), 'and', getID(contact.igeEntityB()._id));
                            },
                            function (contact) {
                                var objA = ige.$(contact.igeEntityA()._id),
                                    objB = ige.$(contact.igeEntityB()._id),
                                    par = [];

                                par[0] = objA.parent();
                                par[1] = objB.parent();
                                if(contact.igeEitherId('bullet') && contact.igeEitherId('bullet')) contact.SetEnabled(false);
                                if(objA.id() == objB.id() || objA.id() == par[1].id() || objB.id() == par[0].id()) contact.SetEnabled(false);


                            }
                        );
					}
				});
			});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }