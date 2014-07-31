(function(exports) {
	function createMixin(mixin, properties) {
		return function(proto) {
			for(var key in mixin) {
				if(!mixin.hasOwnProperty(key)) continue;

				var value = mixin[key];
				if(proto[key] && typeof(value) === 'function')
					Util.override(proto, key, value);
				else
					proto[key] = value;
			}

			if(properties !== undefined)
				Object.defineProperties(proto, properties);
		}
	}

	exports.Mixin = {
		create: createMixin
	};
})(this);
