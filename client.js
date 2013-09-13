var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		//ige.timeScale(0.1);
		ige.showStats(1);

		// Load our textures
		var self = this;

		// Enable networking
		ige.addComponent(IgeNetIoComponent);

		// Implement our game methods
		this.implement(ClientNetworkEvents);
        //this.implement(HealthBar);

		// Create the HTML canvas
		ige.createFrontBuffer(true);

		// Load the textures we want to use
		this.textures = {
			ship: new IgeTexture('./assets/tank.png'),
            bg: new IgeTexture('./assets/background.png'),
            deathscreen: new IgeTexture('./assets/deathscreen.png')
		};

        this.ui = {
            hp: 100,
            ammo: 10
        };

        this.uiOBJ = [];

		ige.on('texturesLoaded', function () {
			// Ask the engine to start
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					// Start the networking (you can do this elsewhere if it
					// makes sense to connect to the server later on rather
					// than before the scene etc are created... maybe you want
					// a splash screen or a menu first? Then connect after you've
					// got a username or something?
					ige.network.start('http://10.0.0.6:2000', function () {
						// Setup the network command listeners
						ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js
                        ige.network.define('playerDamage', self._onPlayerDamage); // Defined in ./gameClasses/ClientNetworkEvents.js
                        ige.network.define('playerDeath', self._onPlayerDeath); // Defined in ./gameClasses/ClientNetworkEvents.js

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(80) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());

							});

						self.mainScene = new IgeScene2d()
							.id('mainScene');

                        self.bglayer = new IgeScene2d()
                            .id('bglayer')
                            .layer(0)
                            .mount(self.mainScene);

						// Create the scene
						self.scene1 = new IgeScene2d()
							.id('scene1')
                            .layer(1)
							.mount(self.mainScene);

                        // Add background
                        self.bg = new IgeEntity()
                            .id('background')
                            .width(1440)
                            .height(960)
                            .texture(self.textures.bg)
                            .mount(self.bglayer);

                        // Create the UI
						self.uiScene = new IgeScene2d()
							.id('uiScene')
                            .ignoreCamera(true)
                            .layer(2)
							.mount(self.mainScene);

                        // Create healthbar and add it to UI
                        self.uiOBJ[0] = new HealthBar()
                            .id('healthBar')
                            .depth(10)
                            .backgroundColor('#42db13')
                            .borderColor('#666666')
                            .borderWidth(2)
                            .backgroundPosition(0, 0)
                            .mount(self.uiScene);

                        self.uiOBJ[1] = new IgeUiEntity()
                            .id('deathMessage')
                            .center(0)
                            .middle(0)
                            .texture(self.textures.deathscreen)
                            .width('100%')
                            .height('100%')
                            .hide()
                            .mount(self.uiScene);

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
                            .autoSize(true)
							.scene(self.mainScene)
							.drawBounds(false)
							.mount(ige);

						// Define our player controls
						ige.input.mapAction('left', ige.input.key.left);
						ige.input.mapAction('right', ige.input.key.right);
						ige.input.mapAction('thrust', ige.input.key.up);
                        ige.input.mapAction('brake', ige.input.key.down);
                        ige.input.mapAction('shoot', ige.input.key.space);

						// Ask the server to create an entity for us
						ige.network.send('playerEntity');

						// We don't create any entities here because in this example the entities
						// are created server-side and then streamed to the clients. If an entity
						// is streamed to a client and the client doesn't have the entity in
						// memory, the entity is automatically created. Woohoo!

						// Enable console logging of network messages but only show 10 of them and
						// then stop logging them. This is a demo of how to help you debug network
						// data messages.
						ige.network.debug(true);
					});
				}
			});
		});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }