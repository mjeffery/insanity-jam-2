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

			physics.startSystem(Phaser.Physics.P2JS);
			physics.p2.gravity.y = 300;

			var worldCollisionGroup = physics.p2.createCollisionGroup();

			var robot = this.robot = new Robot(this.game, worldCollisionGroup, debugBodies);

			var ground = add.tileSprite(400, 568, 800, 64, 'dirt', 0);
			physics.p2.enable(ground, debugBodies);
			ground.body.setRectangleFromSprite(ground);
			ground.body.static = true;
			ground.body.setCollisionGroup(worldCollisionGroup);
			ground.body.collides(robot.collisionGroups.bodyParts);

			var key = this.key = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			key.onDown.add(function() {
				robot.squat();
			});
		},

		update: function() {

		}
	};

	exports.Game = Game;	
})(this);
