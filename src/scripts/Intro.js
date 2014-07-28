(function(exports) {
	function Intro() {}

	Intro.preload = function(load) {
		load.image('wedges', 'assets/img/wedges.png');
		load.image('title', 'assets/img/title.png');
		load.image('press-space', 'assets/img/title press space.png');
	}

	Intro.prototype = {
		create: function() {

			this.game.stage.setBackgroundColor('#ecb95e');
			//this.game.stage.setBackgroundColor('#c70702')

			this.addWedges(0);
			this.addWedges(30);
			this.addWedges(60);
			this.addWedges(90);
			this.addWedges(120);
			this.addWedges(150);

			var title = this.add.sprite(400, 280, 'title');
			title.anchor.setTo(0.5, 0.5);

			this.game.add.tween(title)
				.to({ y: 320 }, 750, Phaser.Easing.Quadratic.InOut, true, 0, Number.MAX_VALUE, true);

			var instructions = this.game.add.sprite(620, 550, 'press-space');
			instructions.anchor.setTo(0.5, 0.5);


			this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function() {
				this.fadeOut(700, 500)
					.onComplete.add(function() {
						this.game.state.start('game');	
					}, this);
			}, this);

			this.fadeIn(500, 700);
		},

		addWedges: function(angle) {
			var wedge = this.add.sprite(400, 300, 'wedges');
			wedge.anchor.setTo(0.5, 0.5);
			wedge.angle = angle;

			this.game.physics.arcade.enable(wedge);
			wedge.body.angularVelocity = 40;
		}
	};

	FadeMixin(Intro.prototype);

	exports.Intro = Intro;
})(this);
