(function(exports) {
	function Game() {}

	Game.prototype = {
		create: function() {
			var physics = this.game.physics,
				add = this.add,
				debugBodies = false;
			
			this.game.stage.setBackgroundColor('#6495ED');
			this.world.setBounds(-800, -1200, 2400, 1800);

			physics.startSystem(Phaser.Physics.P2JS);
			physics.p2.gravity.y = 500;

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
					victim: physics.p2.createCollisionGroup(),
					blocked: physics.p2.createCollisionGroup()
				}
			};

			var materials = {
				world: physics.p2.createMaterial('worldMaterial'),
				robot: physics.p2.createMaterial('robotMaterial')
			};
			
			var contact = physics.p2.createContactMaterial(materials.world, materials.robot);
			contact.friction = 1;

			var ground = this.ground = add.existing(new Ground(this.game, collisionGroups, materials, 568));
			var robot = this.robot = new Robot(this.game, collisionGroups, materials, 200, 300, debugBodies);
			var enemy = this.enemy = add.existing(new Enemy(this.game, collisionGroups, 600, 350));

			var dolly = this.dolly = add.existing(new FightCamera(this.game, 400, 300, [robot, enemy]));
			this.camera.follow(dolly);

			var controller = this.enemyController = new EnemyController(robot, enemy, this.game.rnd);
			
			var playerHp = add.existing(new HealthBar(this.game, 20, 20, 'player'));
			robot.events.onDamage.add(playerHp.onDamage, playerHp);

			var enemyHp = add.existing(new HealthBar(this.game, 440, 20, 'enemy'));
			enemy.events.onDamage.add(enemyHp.onDamage, enemyHp);

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

			robot.events.onInputEnabled.add(commandBuffer.onInputEnabled, commandBuffer);
			robot.events.onInputDisabled.add(commandBuffer.onInputDisabled, commandBuffer);
			robot.events.onBlockStatus.add(enemy.onBlockStatus, enemy);

			enemy.events.onCommandPause.add(function() { console.log('commands paused')});
			enemy.events.onCommandResume.add(function() { console.log('commands resumed')});


			//temp, replace with Instructions
			controller.onMatchStart();
			robot.onMatchStart();

			/*
			var instructions = new Instructions(this.game);
			instructions.events.onComplete.addOnce(controller.onMatchStart, controller);
			instructions.events.onComplete.addOnce(robot.onMatchStart, robot);
			*/

		},

		update: function() {
			this.commandBuffer.update();
			this.enemyController.update();
			this.robot.update();

			// resolve damage for robot punches and kicks
			_.forEach(this.robot.damageSources, function(damage) {
				var velocity = damage.calculateVelocity();
				if(velocity > Robot.Attack.Speed.Min && SAT.circleVsRect(damage.circle, this.enemy.victim.rect)) {
					var side  = (this.robot.torso.x < this.enemy.x) ? Phaser.LEFT : Phaser.RIGHT;
					this.enemy.takeDamage(side, damage.circle, velocity);
				}
			}, this);

			if(this.enemy.vulnerable)
				this.game.physics.arcade.collide(this.enemy, this.robot.arcade);
			this.game.physics.arcade.collide(this.enemy, this.ground.arcade, undefined, this.enemy.onCollision, this.enemy);
		},

		render: function() {
			
			/*
			this.game.debug.spriteBounds(this.dolly);
			_.forEach(this.dolly.rects, function(rect) {
				this.game.debug.geom(rect);
			}, this.dolly);
			*/
			//this.game.debug.geom(this.dolly.target);

			//this.game.debug.geom(this.enemy.victim.rect);
			//this.game.debug.body(this.enemy);
			//this.game.debug.body(this.robot.arcade);
			//this.game.debug.body(this.ground.arcade);
		}
	};

	FadeMixin(Game.prototype);

	exports.Game = Game;	
})(this);
