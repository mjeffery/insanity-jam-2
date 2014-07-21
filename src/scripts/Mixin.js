(function(exports) {
	function createMixin(mixin) {
		return function(proto) {
			for(var key in mixin) {
				if(!mixin.hasOwnProperty(key)) continue;

				var value = mixin[key];
				if(proto[key] && typeof(value) === 'function')
					Util.override(proto, key, value);
				else
					proto[key] = value;
			}
		}
	}

	exports.Mixin = {
		create: createMixin
	};
})(this);
