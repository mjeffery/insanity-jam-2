(function(exports) {

	var DELTA = 0.1;

	function LimbController(torsoJoint, torsoOptions, limbJoint, limbOptions) {
		_.extend(this, {
			_state: 'none',
			events: {
				onStateChange: new Phaser.Signal()
			},
			torso: {
				joint: torsoJoint,
				options: _.defaults(torsoOptions || {}, {
					extended: {
						limit: -Math.PI / 8,
						motorDir: 1,
						scale: 1
					},
					retracted: {
						limit: 3 * Math.PI / 4,
						motorDir: -1,
						scale: 1
					}
				})
			},
			limb: {
				joint: limbJoint,
				options: _.defaults(limbOptions || {}, {
					extended: {
						limit: -Math.PI / 8,
						motorDir: 1,
						scale: 1
					},
					retracted: {
						limit: 3 * Math.PI / 4,
						motorDir: -1,
						scale: 1
					}
				})
			}
		});
	}

	LimbController.prototype = {
		extend: function(speed) {
			switch(this.state) {
				case 'none':
				case 'extending':
				case 'retracting':
				case 'retracted':
					this.doExtend(speed);
					break;

				case 'relaxed':
					this.restoreExtended();
			}
		},

		retract: function(speed) {
			switch(this.state) {
				case 'none':
				case 'extending':
				case 'extended':
				case 'retracting':
					this.doRetract(speed);
					break;

				case 'relaxed':
					this.restoreRetracted();
			}
		},

		relax: function() {
			var limb = this.limb,
				torso = this.torso;

			this.relaxJoint(torso.joint, torso.options.relaxed);
			this.relaxJoint(limb.joint, limb.options.relaxed);

			this.state = 'relaxed';
		},

		restoreExtended: function() {
			var limb = this.limb,
				torso = this.torso;

			this.restoreJoint(limb.joint, limb.options.extended);
			this.restoreJoint(torso.joint, torso.options.extended);

			this.nextState = 'extended';
			this.state = 'restoring';
		},

		restoreRetracted: function() {
			var limb = this.limb,
				torso = this.torso;

			this.restoreJoint(limb.joint, limb.options.retracted);
			this.restoreJoint(torso.joint, torso.options.retracted);

			this.nextState = 'retracted';
			this.state = 'restoring';
		},
				
		update: function() {
			var limb = this.limb,
				torso = this.torso;

			this.updateJoint(limb);
			this.updateJoint(torso);	

			if(limb.relaxed && torso.relaxed) {
				switch(this.state) {
					case 'extending':
						this.state = 'extended';
						break;
					
					case 'retracting':
						this.state = 'retracted';
						break;

					case 'restoring':
						this.state = this.nextState;
						break;
				}
			}
		},

		doExtend: function(speed) {
			var limb = this.limb, 
				torso = this.torso;

			this.driveJoint(torso.joint, speed, torso.options.extended);
			this.driveJoint(limb.joint, speed, limb.options.extended);

			this.state = 'extending';
		},

		doRetract: function(speed) {
			var limb = this.limb, 
				torso = this.torso;

			this.driveJoint(torso.joint, speed, torso.options.retracted);
			this.driveJoint(limb.joint, speed, limb.options.retracted);

			this.state = 'retracting';
		},

		restoreJoint: function(joint, options) {
			if(!joint.motorIsEnabled()) joint.enableMotor();

			if(joint.angle > options.limit) {
				joint.lowerLimit = options.limit;
				joint.setMotorSpeed(3.5);
			}
			else {
				joint.upperLimit = options.limit;
				joint.setMotorSpeed(-3.5);
			}
		},

		updateJoint: function(part) {
			var joint = part.joint;

			if(joint.motorIsEnabled()) {
				if(joint.getMotorSpeed() > 0 && Math.abs(joint.angle - joint.lowerLimit) < DELTA) {
					joint.setMotorSpeed(0.5);
					part.relaxed = true;
				}
				else if(joint.getMotorSpeed() < 0 && Math.abs(joint.angle - joint.upperLimit) < DELTA) {
					joint.setMotorSpeed(-0.5);
					part.relaxed = true;
				}
				else 
					part.relaxed = false;
			}
		},

		driveJoint: function(joint, speed, options) {
			if(options.motorDir > 0) 
				joint.lowerLimit = options.limit;
			else
				joint.upperLimit = options.limit;

			if(!joint.motorIsEnabled()) joint.enableMotor();
			joint.setMotorSpeed(speed * options.motorDir);
		},

		relaxJoint: function(joint, options) {
			joint.lowerLimit = options.lowerLimit || -Math.PI / 8;
			joint.upperLimitEnabled = options.upperLimit || Math.PI / 8;
			if(joint.motorIsEnabled()) joint.disableMotor();
		},

		mirror: function(torsoJoint, limbJoint) {
			return new LimbController(
				torsoJoint,
				negateJointOptions(this.torso.options),
				limbJoint,
				negateJointOptions(this.limb.options)
			);

			function negateDriveOptions(driveOpts) {
				return {
					limit: -driveOpts.limit,
					motorDir: -driveOpts.motorDir
				}
			}

			function negateJointOptions(jointOptions) {
				return {
					retracted: negateDriveOptions(jointOptions.retracted),
					extended: negateDriveOptions(jointOptions.extended),
					relaxed: {
						lowerLimit: -jointOptions.relaxed.upperLimit, 
						upperLimit: -jointOptions.relaxed.lowerLimit
					}
				}
			}
		},

	};

	Object.defineProperties(LimbController.prototype, {
		state: {
			get: function() {
				return this._state;
			},
			set: function(val) {
				if(val !== this._state) {
					var prevState = this._state;
					this._state = val;

					this.events.onStateChange.dispatch(val, prevState);
				}
			}
		}	
	});

	exports.LimbController = LimbController;

})(this);
