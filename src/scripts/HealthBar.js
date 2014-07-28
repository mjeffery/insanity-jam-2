(function(exports) {
	function HealthBar(game, x, y, team) {
		Phaser.Sprite.call(this, game, x, y, 'hp-guages', 'guage-bg');
		this.fixedToCamera = true;

		var guage = this._guage = game.make.sprite(0, 1, 'hp-guages', team + '-hp-guage');
		var overlay = game.make.sprite(-3, -3, 'hp-guages', team + '-hp-guage-overlay');

		this.addChild(guage);
		this.addChild(overlay);

		this._width = guage.width;
		var rect = this._rect = new Phaser.Rectangle(0, 0, 1, guage.height);
		guage.crop(rect);

		this.team = team;
		this._curr = 0;
		this._target = 1;
	}

	_.extend(HealthBar, {
		Speed: 0.33,
		preload: function(load) {
			load.atlasJSONHash('hp-guages', 'assets/atlas/health guages.png', 'assets/atlas/health guages.json');
		}
	});

	HealthBar.prototype = Object.create(Phaser.Sprite.prototype);
	HealthBar.prototype.constructor = HealthBar;

	_.extend(HealthBar.prototype, {
		update: function() {
			var curr = this._curr,
				target = this._target,
				changed = false;

			if(curr > target) {
				changed = true;
				curr -= HealthBar.Speed * this.game.time.physicsElapsed;
				if(curr < target)
					curr = target;
			}
			else if(curr < target) {
				changed = true;
				curr += HealthBar.Speed * this.game.time.physicsElapsed;
				if(curr > target)
					curr = target;
			}

			if(changed) {
				var guage = this._guage,
					rect = this._rect,
					w = Math.floor(this._width * curr);

				if(this.team === 'player') { // drain to the left
					rect.width = w;
					guage.x = this._width - w;
				}
				else {
					rect.width = w;
				}
	
				this._curr = curr;
				guage.crop(rect);
			}
		},
		
		onDamage: function(curr, total) {
			this._target = curr / total;
		}	
	});

	exports.HealthBar = HealthBar;
})(this);
