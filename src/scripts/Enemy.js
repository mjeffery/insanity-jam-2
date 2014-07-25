(function(exports) {

	function Enemy(game, collisionGroups, x, y) {
		Phaser.Sprite.call(this, game, x, y, 'enemy-idle-atlas');
		this.anchor.setTo(0.5, 0.5);

		this.animations.add('idle', Phaser.Animation.generateFrameNames('idle__', 0, 9, '.png', 3), 10, true);
		this.animations.play('idle');

		game.physics.arcade.enable(this);
		this.body.setSize(73, 256);
		this.body.velocity.x = - 50;

		var victim = this.victim = game.add.existing(new EnemyVictim(this.game, 0, 0, 73, 256));
		this.addChild(victim);

		var isIdle = true;
		game.input.keyboard.addKey(Phaser.Keyboard.T).onDown.add(function() {
			if(isIdle) {
				this.switchToAdvanceAtlas();
				this.animations.play('start-advance');	
			}
			else {
				this.switchToIdleAtlas();
				this.animations.play('idle');
			}
			isIdle = !isIdle;
		}, this);
	}

	_.extend(Enemy, {
		preload: function(load) {
			load.atlasJSONArray('enemy-idle-atlas', 'assets/atlas/robot idle.png', 'assets/atlas/robot idle.json');
			load.atlasJSONArray('enemy-advance-atlas', 'assets/atlas/robot advance.png', 'assets/atlas/robot advance.json');
		}
	});

	Enemy.prototype = Object.create(Phaser.Sprite.prototype);
	Enemy.prototype.constructor = Enemy;

	_.extend(Enemy.prototype, {
		switchToIdleAtlas: function() {
			this.loadTexture('enemy-idle-atlas');
			this.anchor.setTo(0.5, 0.5);

			this.animations.add('idle', Phaser.Animation.generateFrameNames('idle__', 0, 9, '.png', 3), 10, true);
			this.animations.play('idle');
		},

		switchToAdvanceAtlas: function() {
			this.loadTexture('enemy-advance-atlas');
			this.anchor.setTo(0.5, 0.5);

			this.animations.add('start-advance', Phaser.Animation.generateFrameNames('advance__', 0, 2, '.png', 3), 10);
			this.animations.add('advancing', Phaser.Animation.generateFrameNames('advance__', 3,5, '.png', 3), 10, true);
			this.animations.add('stop-advance', Phaser.Animation.generateFrameNames('advance__', 2, 0, '.png', 3), 10);
		},

		update: function() {
		}
	});

	function EnemyVictim(game, x, y, w, h) {
		Phaser.Sprite.call(this, game, x, y);
		this.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(this);
		this.body.setSize(w, h);

		this._square = new Phaser.Rectangle(x, y, w, h);
	}

	EnemyVictim.prototype = Object.create(Phaser.Sprite.prototype);
	EnemyVictim.prototype.constructor = EnemyVictim;
	
	Object.defineProperty(EnemyVictim.prototype, 'rect', {
		get: function() {
			this._square.x = this.body.x;
			this._square.y = this.body.y;

			return this._square;
		}
	})

	exports.Enemy = Enemy;
})(this);
