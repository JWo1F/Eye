atom.declare('Eye.Algoritm', {
	initialize: function (obj) {
		this.settings = obj;
		this.events = obj.events;
		this.events.algoritm = new atom.Events();
		this.alg = [];
		this._parsed = [];
		this.cell = obj.cell.clone();
		this.engine = obj.engine;
		this.vector = obj.vector;
		this.error = false;
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
		this._parsed = [];
		
		alg = alg || this.alg;
		
		alg.forEach(function (v) {
			if (atom.typeOf(v) == 'array') {
				this.parse(v);
			} else if (typeof v == 'number') {
				(v < 2) ? this.move(v) : this.rotate();
			}
		}.bind(this));
		
		this.cell = this.settings.cell;
		this.vector = this.settings.vector;
	},
	loop: function (obj) {
		
	},
	branch: function (obj) {
		
	},
	add: function (id) {
		this.alg.push(id);
		this.events.algoritm.fire('added', [id]);
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
		if (!this.error) this.events.player.add('completeChain', function () { console.log('Ошибка: ' + type); atom.dom('#log .current').addClass('error'); });
		this.error = 'error: ' + type;
	}
});