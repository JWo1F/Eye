atom.declare('Eye.Algoritm', {
	initialize: function (obj) {
		this.settings = obj;
		this.events = obj.events;
		this.alg = [];
		this._parsed = [];
		this.cell = obj.cell.clone();
		this.engine = obj.engine;
		this.vector = obj.vector;
		this.error = false;
		this.events.list.add('select', this.select.bind(this));
		this.events.list.add('unselect', this.unselect.bind(this));
		this.events.main.add('debugger', this.parse.bind(this));
	},
	move: function (jump) {
		var next = this.nextCell;
		
		if (this.isNextCell() && !this.error) {
			this.cell = next.point.clone();
			this._parsed.push((jump) ? 1 :0);
		} else {
			this.setError('wall');
		}
	},
	rotate: function () {
		if (!this.error) {
			this._parsed.push(2);
			this.vector = (this.vector > 2) ? 0 : this.vector+1;
		}
	},
	parse: function (alg) {
		var children = !!alg;
		
		if (!children) this._parsed = [];
		alg = alg || this.alg;
		
		alg.forEach(function (v) {
			if (atom.typeOf(v) == 'array') {
				this.parse(v);
			} else if (typeof v == 'number') {
				(v < 2) ? this.move(v) : this.rotate();
			} else if (v.type == 'Eye.Branch') {
				if (this.isNextCell()) {
					if (v.get('s')[0]) {
						this._parsed.push('s~');
						this.parse(v.get('s'));
						this._parsed.push('q~');
					}
				} else {
					if (v.get('w')[0]) {
						this._parsed.push('w~');
						this.parse(v.get('w'));
						this._parsed.push('q~');
					}
				}
			}
		}.bind(this));
		
		if (children) this.cell = this.settings.cell;
		if (children) this.vector = this.settings.vector;
		
		if (!children) {
			var parsed = this._parsed;
			parsed = parsed.join('-');
			while (parsed.match(/s~-q~/)) parsed = parsed.replace(/-?s~-q~/, '');
			this._parsed = parsed.split('-');
		}
	},
	loop: function (obj) {
		
	},
	branch: function (obj) {
		
	},
	add: function (id) {
		id = (typeof id == 'number') ? id : (id == 'branch') ? new Eye.Branch([2,2,2,0], [0,0,0]) : false;
		
		if (this.active) {
			var center = this.active+1;
			var last = this.alg.splice(center, this.alg.length-center);
			this.alg.push(id);
			last.forEach(function (v) { this.alg.push(v) }.bind(this));
			
			this.events.algoritm.fire('extraAdded', [id.toString()]);
		} else {
			this.alg.push(id);
			this.events.algoritm.fire('added', [id]);
		}
	},
	get parsed () {
		return atom.clone(this._parsed);
	},
	isNextCell: function () {
		return (!this.nextCell || this.nextCell.value !== 0 ) ? false : true;
	},
	get nextCell () {
		var neighbours = new Point(this.cell).getNeighbours();
			neighbours = [neighbours[2], neighbours[0], neighbours[1], neighbours[3]];
		return this.engine.getCellByIndex(neighbours[this.vector]);
	},
	setError: function (type) {
		if (!this.error) this._parsed.push('e~');
		this.error = type;
	},
	select: function (elem) {
		this.active = (elem.attr('data-id')) ? parseFloat(elem.attr('data-id')) : elem.attr('path');
	},
	unselect: function () {
		this.active = false;
	}
});