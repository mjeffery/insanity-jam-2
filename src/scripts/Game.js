(function(exports) {
	function Game() {}

	Game.preload = function(load) {
		load.image('dirt', 'assets/img/dirt.png');
	};

	Game.prototype = {
		create: function() {
			var physics = this.game.physics,
				add = this.add,
				debugBodies = false;
			
			this.game.stage.setBackgroundColor('#6495ED');
			this.world.setBounds(-800, -1200, 2400, 1800);

			physics.startSystem(Phaser.Physics.P2JS);
			physics.p2.gravity.y = 300;

			var collisionGroups = {
				world: physics.p2.createCollisionGroup(),
				player: {
					body: physics.p2.createCollisionGroup(),
					damage: physics.p2.createCollisionGroup(),
					victim: physics.p2.createCollisionGroup()
				},
				enemy: {
					body: physics.p2.createCollisionGroup(),
					damage: physics.p2.createCollisionGroup(),
					victim: physics.p2.createCollisionGroup()
				}
			};

			var ground = add.tileSprite(this.world.bounds.centerX, 568, this.world.bounds.width, 64, 'dirt', 0);

			var robot = this.robot = new Robot(this.game, collisionGroups, 200, 300, debugBodies);
			
			var enemy = this.enemy = add.existing(new Enemy(this.game, collisionGroups, 600, 350));

			physics.p2.enable(ground, debugBodies);
			ground.body.setRectangleFromSprite(ground);
			ground.body.static = true;
			ground.body.setCollisionGroup(collisionGroups.world);
			ground.body.collides(collisionGroups.player.body);


			var dolly = this.dolly = add.existing(new FightCamera(this.game, 400, 300, [robot.torso, enemy]));
			this.camera.follow(dolly);
			
			/*
			var keys = this.input.keyboard.createCursorKeys();
			keys.down.onDown.add(robot.squat, robot);
			keys.up.onDown.add(robot.jump, robot);
			keys.left.onDown.add(robot.defend, robot);
			keys.right.onDown.add(robot.punch, robot);
			*/

			//add.bitmapText(150, 20, 'minecraftia', 'Press "DOWN" to squat and "UP" to jump!', 16);
			//add.bitmapText(130, 40, 'minecraftia', 'Press "RIGHT" to punch and "LEFT" to defend!', 16);
			
			//new Instructions(this.game);
		
			add.existing(new HealthBar(this.game, 20, 20, 'player'));
			add.existing(new HealthBar(this.game, 440, 20, 'enemy'));

			var commandBuffer = this.commandBuffer = new CommandBuffer(this.game);
			var commandKeyPool = this.commandKeyPool = new CommandKeyPool(this.game);
			var commandDisplay = this.commandDisplay = new CommandDisplay(
				this.game,
				commandKeyPool,
				commandBuffer.commandsToKeyCodes
			);
			commandDisplay.x = 200;			 // why are these not in real coordinates?
			commandDisplay.y = 275;
			commandDisplay.timerBar.x = 135; // why do I have to set these?
			commandDisplay.timerBar.y = 292;
			commandDisplay.fixedToCamera = true; 

			// Wiring
			commandBuffer.events.onStringEnd.add(robot.processCommandString, robot);
			commandBuffer.events.onStringStart.add(commandDisplay.onStringStart, commandDisplay);
			commandBuffer.events.onCommand.add(commandDisplay.onCommand, commandDisplay);
			commandBuffer.events.onStringEnd.add(commandDisplay.onStringEnd, commandDisplay);
			commandBuffer.events.onTimerChanged.add(commandDisplay.onTimerChanged, commandDisplay);
		},

		update: function() {
			this.commandBuffer.update();

			_.forEach(this.robot.damageSources, function(damage) {
				var velocity = damage.calculateVelocity();
				if(velocity > 600 && SAT.circleVsRect(damage.circle, this.enemy.victim.rect)) {
					console.log(velocity);
				}
			}, this);
		},

		render: function() {
			/*
			this.game.debug.spriteBounds(this.dolly);
			_.forEach(this.dolly.rects, function(rect) {
				this.game.debug.geom(rect);
			}, this.dolly);
			this.game.debug.geom(this.dolly.target);
			*/

			this.game.debug.geom(this.enemy.victim.rect);
		}
	};

	exports.Game = Game;	
})(this);
