atom.declare('Eye.Subprograms', {
	initialize: function (controller) {
		this.controller = controller;
		
		this.store = {};
	},
	add: function (name, alg) {
		this.store[name] = alg;
	},
	get: function (name) {
		return atom.clone(this.store[name]);
	}
});