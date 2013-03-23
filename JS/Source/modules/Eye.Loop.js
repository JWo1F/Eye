atom.declare('Eye.Loop', {
	initialize: function(alg, num) {
		this._alg = alg||[];
		this.num = num;
	},
	get alg () {
		return atom.clone(this._alg);
	}
});