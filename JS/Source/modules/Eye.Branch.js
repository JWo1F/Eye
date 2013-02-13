atom.declare('Eye.Branch', {
	type: 'Eye.Branch',
	initialize: function(wall, space) {
		this.wall = wall;
		this.space = space;
	},
	get: function (wall) {
		return (wall) ? atom.clone(this.wall) : atom.clone(this.space);
	}
});