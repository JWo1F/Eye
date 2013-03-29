atom.declare('Eye.Algoritm', {
	initialize: function (controller) {
		this.controller = controller;
		this.alg = [];
		this.error = false;
		
		this.controller.events.add('playerAction', function () {
			if (this.alg[0] && !this.error) {
				this.go();
			} else {
				delete this._alg;
			}
		}.bind(this));
		this.controller.events.add('playerError', function () {
			this.error = true;
			throw new Error('Стена');
		}.bind(this));
		this.controller.events.add('actionAdd', this.add.bind(this));
	},
	add: function (val, type) {
		if (val != 'loop' && val != 'branch') {
			this.alg.push(val);
		} else if (val == 'loop') {
			this.alg.push(new Eye.Loop([], 10));
		} else if (val == 'branch') {
			this.alg.push(new Eye.Branch());
		}
	},
	go: function () {
		if (!this._alg) this._alg = atom.clone(this.alg);
		var action = this.alg.shift();
		
		if (typeof action == 'string' && !action.match(/sp:/)) {
			this.controller.player[(action == 'jump') ? 'move' : action](action);
		} else if (action.Constructor == 'Eye.Branch') {
			action[this.controller.player.isNextCell() ? 'space' : 'border'].reverse().forEach(function (v) {
				this.alg.unshift(v);
			}.bind(this));
			this.controller.events.fire('playerAction');
		} else if (action.Constructor == 'Eye.Loop') {
			if (action.num > 0) {
				action.num--;
				
				this.alg.unshift(action);
				this.alg[0].alg.reverse().forEach(function (v) {
					this.alg.unshift(v);
				}.bind(this));
			} else if (action.num == -1) {
				if (this.controller.player.isNextCell()) {
					this.alg.unshift(action);
					this.alg[0].alg.reverse().forEach(function (v) {
						this.alg.unshift(v);
					}.bind(this));
				}
			} else if (action.num == -2) {
				if (!this.controller.player.isNextCell()) {
					this.alg.unshift(action);
					this.alg[0].alg.reverse().forEach(function (v) {
						this.alg.unshift(v);
					}.bind(this));
				}
			}
			
			this.controller.events.fire('playerAction');
		} else if (typeof action == 'string' && action.match(/sp:/)) {
				var sp = this.controller.subprograms.get(action.match(/sp: (.+)/)[1]);
				sp.reverse().forEach(function (v) {
					this.alg.unshift(v);
				}.bind(this));
				this.controller.events.fire('playerAction');
			}
	},
	getAlgByPath: function (path) {
		path = path.split('-');
		path.shift(); // Remove 0- in start
		var parent = this.alg;
		var children, num;
		
		path.forEach(function (v, i) {
			if (v.match(/b/)) {
				parent = parent.border;
				v = v.replace(/\D+/g, '');
			} else if (v.match(/s/)) {
				parent = parent.space;
				v = v.replace(/\D+/g, '');
			} else if (typeof parent == 'object' && parent.Constructor == 'Eye.Loop') {
				parent = parent._alg;
			}
			
			children = parent;
			parent = parent[v];
			num = i;
		}.bind(this));
		
		return [children, parent, path.last.replace(/\D+/g, '')];
	}
});