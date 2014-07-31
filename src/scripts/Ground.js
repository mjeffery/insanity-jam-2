(function(exports) {
	function Ground(game, collisionGroups, materials, y, debug) {
		Phaser.TileSprite.call(this, game, game.world.bounds.centerX, y, game.world.bounds.width, 64, 'dirt', 0);

		game.physics.p2.enable(this, debug);
		this.body.setRectangleFromSprite(this);
		this.body.static = true;
		this.body.setCollisionGroup(collisionGroups.world);
		this.body.collides(collisionGroups.player.body);
		this.body.setMaterial(materials.world);

		var arcade = this.arcade = game.make.sprite(game.world.bounds.left, y - 32);

		game.physics.arcade.enable(arcade);
		arcade.body.setSize(game.world.bounds.width, 64);
		arcade.body.immovable = true;
	}

	_.extend(Ground, {
		preload: function(load) {
			load.image('dirt', 'assets/img/dirt.png');
		}
	});

	Ground.prototype = Object.create(Phaser.TileSprite.prototype);
	Ground.prototype.constructor = Ground;
	
	exports.Ground = Ground;
})(this);
