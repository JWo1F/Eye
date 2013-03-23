atom.declare('Eye.Branch', {
	initialize: function(border, space) {
		this._border = border||[];
		this._space = space||[];
	},
	get border () {
		return atom.clone(this._border);
	},
	get space () {
		return atom.clone(this._space);
	}
});