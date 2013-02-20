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
		this.bound = 10000;
	},
	move: function (jump) {
		var next = this.nextCell;
		
		if (this.isNextCell() && !this.error) {
			this.cell = next.point.clone();
			this._parsed.push((jump) ? 1 :0);
			this.bound--;
		} else {
			this.setError('wall');
		}
	},
	rotate: function () {
		if (!this.error) {
			this._parsed.push(2);
			this.vector = (this.vector > 2) ? 0 : this.vector+1;
			this.bound--;
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
					if (typeof v.get('s')[0] != 'undefined') {
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
			} else if (v.type == 'Eye.Loop') {
				if (v.alg.last !== null) {
					console.log('loop');
					this._parsed.push('l~');
					if (v.num == -1) {
						while (!this.isNextCell() && this.bound > 0) {
							this.parse(v.alg);
						}
						if (this.bound <= 0) this.events.algoritm.fire('looped');
					} else if (v.num === 0) {
						while (this.isNextCell() && this.bound > 0) {
							this.parse(v.alg);
						}
						if (this.bound <= 0) this.events.algoritm.fire('looped');
					} else {
						for (var x = 0; x < v.num; x++) this.parse(v.alg);
					}
					this._parsed.push('q~');
				}
			}
		}.bind(this));
		
		if (!children) {
			var parsed = this._parsed;
			parsed = parsed.join('-');
			while (parsed.match(/[swl]~-q~/)) parsed = parsed.replace(/-?[swl]~-q~/, '').replace(/^-(\d+|\D+)-$/, '$1');
			this._parsed = parsed.split('-');
			this.bound = 10000;
		}
	},
	add: function (id) {
		if (id == 'branch') {
			id = new Eye.Branch();
		} else if (id == 'loop') {
			this.addLoop();
			return;
		}
		
		if (this.active) {
			var alg = this.getFromPath(this.active, true);
			
			if (alg[1]) {
				if (alg[1].type == 'Eye.Loop') {
					alg[1].alg.splice(parseFloat(this.active.split('-').last)+1, 0, id);
				} else {
					alg[1].splice(parseFloat(this.active.split('-').last)+1, 0, id);
				}
			} else {
				this.alg.splice(parseFloat(this.active.split('-').last)+1, 0, id);
			}
		} else {
			this.alg.push(id);
		}
		
		this.events.algoritm.fire('added');
	},
	addLoop: function () {
		new Eye.prompt('Введите кол-во повторов<br>(-1 - "Пока стена", 0 - "Пока НЕ стена"):', function (v) {
			this.add(new Eye.Loop([], parseFloat(v)));
		}.bind(this));
	},
	get parsed () {
		return atom.clone(this._parsed);
	},
	isNextCell: function () {
		return (!this.nextCell || this.nextCell.value !== 0 ) ? false : true;
	},
	getFromPath: function (path, flag) {
		var list = path.toString().split('-');
		var last, current = this.alg;
		
		list.forEach(function (v, i) {
			if (i !== 0) last = current;
			
			if (atom.typeOf(current) == 'array') {
				if (v.match(/\D/)) {
					var branch = v.match(/\D+/)[0],
						id = parseFloat(v);
						
					current = current[id].get(branch);
				} else {
					current = current[v];
				}
			} else {
				if (v.match(/\D/)) {
					current = current.alg[parseFloat(v)].get(v.match(/\D+/)[0]);
				} else {
					current = current.alg[v];
				}
			}
		}.bind(this));
		
		return (flag) ? [current, last] : current;
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
		this.active = elem.attr('data-path');
	},
	unselect: function () {
		this.active = false;
	}
});