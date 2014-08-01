(function Instructions(exports) {
	function Instructions(game) {
		Phaser.Group.call(this, game);

		var pages = this.pages = [
			game.make.sprite(0, 0, 'instructions-atlas', 'story'),
			game.make.sprite(0, 0, 'instructions-atlas', 'instructions for keys'),
			game.make.sprite(0, 0, 'instructions-atlas', 'instructions for strings'),
			game.make.sprite(0, 0, 'instructions-atlas', 'instructions for blocks')
		];

		_.forEach(pages, function(page) {
			this.add(page);
			page.anchor.setTo(0.5, 0.5);
			page.position.setTo(game.width / 2, game.height / 2);
			page.visible = false;
		}, this);

		this.currentPage = 0;
		pages[0].visible = true;

		this.events = {
			onComplete: new Phaser.Signal()
		};

		var advanceKey = this.advanceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		advanceKey.onDown.add(this.advance, this);
	}

	_.extend(Instructions, {
		preload: function(load) {
			load.atlasJSONArray('instructions-atlas', 'assets/atlas/instructions.png', 'assets/atlas/instructions.json');
		}
	});

	Instructions.prototype = Object.create(Phaser.Group.prototype);
	Instructions.prototype.constructor = Instructions;

	Mixin.create({
		destroy: function() {
			this.advanceKey.onDown.remove(this.advance, this);
			this.__super.apply(this, arguments);
		},

		advance: function() {
			var pages = this.pages,
				oldPage = this.currentPage
				newPage = this.currentPage + 1;
			
			pages[oldPage].visible = false;
			
			if(newPage >= pages.length) {
				this.events.onComplete.dispatch();
				this.destroy();
			}
			else {
				pages[newPage].visible = true;
				this.currentPage = newPage;
			}
		}
	})(Instructions.prototype);

	exports.Instructions = Instructions;
})(this);
