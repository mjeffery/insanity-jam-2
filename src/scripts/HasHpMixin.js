(function(exports) {
	exports.HasHpMixin = Mixin.create({
		initialize: function(maxHp) {
			if(maxHp === undefined) maxHp = 100;

			if(!this.events) this.events = {};
			_.extend(this.events, {
				onDamage: new Phaser.Signal(),
				onDefeated: new Phaser.Signal()
			});
		
			_.extend(this, {
				_hp: maxHp,
				_maxHp: maxHp,
			});
		}	
	}, {
		hp: {
			get: function() {
				return this._hp;
			},
			set: function(val) {
				var prevHp = this._hp;
				this._hp = val;

				if(prevHp > val) 
					this.events.onDamage.dispatch(this._hp, this._maxHp);

				if(val <= 0)
					this.events.onDefeated.dispatch(this);
			}
		},
	});
})(this);
