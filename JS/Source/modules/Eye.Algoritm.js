atom.declare('Eye.Algoritm', {
	initialize: function (controller) {
		this.controller = controller;
		this.alg = [];
		this.error = false;
		this.active = false;
		
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
		this.controller.events.add('listSelect', function (elem) { this.active = elem; }.bind(this));
		this.controller.events.add('listUnselect', function () { this.active = false; }.bind(this));
	},
	add: function (val, type) {
		var push;
		
		if (val != 'loop' && val != 'branch') {
			push = val;
		} else if (val == 'loop') {
			push = new Eye.Loop([], 10);
		} else if (val == 'branch') {
			push = new Eye.Branch();
		}
		
		if (this.active) {
			var alg = this.getAlgByPath(this.active.attr('data-path'));
			alg[0].splice(alg[2]+1, 0, push);
			this.controller.events.fire('requireSelect', [true]);
		} else {
			this.alg.push(push);
			this.controller.events.fire('requireSelect');
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
				parent = parent._border;
				v = v.replace(/\D+/g, '');
			} else if (v.match(/s/)) {
				parent = parent._space;
				v = v.replace(/\D+/g, '');
			} else if (typeof parent == 'object' && parent.Constructor == 'Eye.Loop') {
				parent = parent._alg;
			}
			
			children = parent;
			parent = parent[v];
			num = i;
		}.bind(this));
		
		return [children, parent, parseFloat(path.last.replace(/\D+/g, ''))];
	}
});