atom.declare('Eye.Subprogram', {
	initialize: function (name, array) {
		this.algoritm = atom.clone(array);
		this.name = name;
		Eye.subprograms[name] = this;
	},
	get alg () {
		return atom.clone(this.algoritm);
	}
});