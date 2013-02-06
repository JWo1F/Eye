atom.declare('Eye.Algoritm', {
	initialize: function(obj) {
		this.engine = obj.engine;
		this.position = new Point(obj.start);
		this.vector = obj.vector;
		this.action = [this.move.bind(this), this.jump.bind(this), this.rotate.bind(this)];
		this.algoritm = [];
		this._parsed = [];
		this.bound = obj.bound;
		this.error = false;
		this.result = [];
		this.subprograms = {};
		this.events = obj.events;
	},
	move: function() {
		var cell = this.getNextCell();
		if (cell) {
			this.position = cell.point.clone();
			this._parsed.push(0);
		}
		else {
			this.error = 0;
			return false;
		}
	},
	jump: function() {
		var cell = this.getNextCell();
		if (cell) {
			this.position = cell.point.clone();
			this._parsed.push(1);
		}
		else {
			this.error = 0;
			return false;
		}
	},
	rotate: function() {
		this.vector = (this.vector == 3) ? 0 : this.vector + 1;
		this._parsed.push(2);
	},
	add: function(obj) {
		this.algoritm.push(obj);
		return this;
	},
	addSubprogram: function (name, alg) {
		return this.subprograms[name] = new Eye.Subprogram(name, alg);
	},
	addSubprograms: function (obj) {
		for (var key in obj) this.addSubprogram(obj[key].name, obj[key].alg);
	},
	parse: function(alg) {
		var child = !!alg;
			alg = (child) ? alg : this.alg;
			
		alg.forEach(function (v) {
			if (atom.typeOf(v) == 'array') {
				this.parse(v);
			} else if (typeof v == 'number') {
				this.bound--;
				this.action[v]();
			} else if (typeof v == 'string') {
				this.parse(this.subprograms[v].alg);
			} else if (v.type == 'Eye.Loop') {
				if (v.num > 0) {
					if (this.error === false) for (var i=0; i < v.num; i++) if (this.bound) this.parse(v.alg);
				} else if (v.num == -1) {
					if (this.error === false) while (!this.getNextCell()) if (this.bound) this.parse(v.alg);
				} else {
					if (this.error === false) while (this.getNextCell()) if (this.bound) this.parse(v.alg);
				}
			} else if (v.type == 'Eye.Branch') {
				this.parse((this.getNextCell()) ? v.space : v.wall);
			}
		}.bind(this));
		
		return this._parsed;
	},
	getNextCell: function() {
		var neighbours = this.position.getNeighbours();
		neighbours = [neighbours[2], neighbours[0], neighbours[1], neighbours[3]];
		var next = this.engine.getCellByIndex(neighbours[this.vector]);
		return (next) ? (next.value == 1) ? false : next : false;
	},
	get alg() {
		return atom.clone(this.algoritm);
	},
	get sub() {
		return atom.clone(this.subprograms);
	},
	get parsed() {
		return atom.clone(this._parsed);
	},
	export: function() {
		return Base64.encode(JSON.stringify( [this.alg, this.sub] ));
	},
	import: function (str) {
		var parse = JSON.parse(Base64.decode(str));
		this.add(parse[0]);
		this.addSubprograms(parse[1]);
		return this;
	}
});