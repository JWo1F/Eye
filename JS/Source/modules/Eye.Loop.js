atom.declare('Eye.Loop', {

	type: 'Eye.Loop',

	initialize: function(alg, num) {
		this.alg = alg;
		this.num = num;
	},
	get list() {
		return atom.clone(this.alg);
	}
});