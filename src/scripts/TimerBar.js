(function(exports) {
	function TimerBar(game, x, y) {
		Phaser.Sprite.call(this, game, x, y, 'timer-bar-bg');

		var bar = this._bar = game.make.sprite(0, 0, 'timer-bar'),
			rect = this._rect = new Phaser.Rectangle(0, 0, 1, this.height);

		this.addChild(bar);
		bar.crop(rect);
	}

	_.extend(TimerBar, {
		preload: function(load) {
			load.image('timer-bar-bg', 'assets/img/timer bar bg.png');
			load.image('timer-bar', 'assets/img/timer bar.png');
		}
	});

	TimerBar.prototype = Object.create(Phaser.Sprite.prototype);
	TimerBar.prototype.constructor = TimerBar;

	Object.defineProperties(TimerBar.prototype, {
		value: {
			set: function(val) {
				val = Math.max(0, val);
				val = Math.min(1, val);

				this._rect.width = Math.floor(this.width * val);
				this._bar.crop(this._rect);
			}
		}
	});

	exports.TimerBar = TimerBar;
})(this);
