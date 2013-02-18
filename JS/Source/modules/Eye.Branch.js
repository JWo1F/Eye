atom.declare('Eye.Branch', {
	type: 'Eye.Branch',
	initialize: function(wall, space) {
		this.wall = wall||[];
		this.space = space||[];
	},
	get: function (wall) {
		return (wall == 'w') ? this.wall : this.space;
	},
	push: function (wall, value) {
		if (wall) {
			this.wall.push(value);
		} else {
			this.space.push(value);
		}
	},
	replace: function (id, value) {
		if (id.match(/w/)) {
			this.wall[parseFloat(id)] = value;
		} else {
			this.space[parseFloat(id)] = value;
		}
	},
	del: function (id) {
		if (id.match(/w/)) {
			delete this.wall[parseFloat(id)];
			this.wall = this.wall.clean();
		} else {
			delete this.space[parseFloat(id)];
			this.space = this.space.clean();
		}
	}
});