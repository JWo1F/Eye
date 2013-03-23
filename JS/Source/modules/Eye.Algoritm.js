atom.declare('Eye.Algoritm', {
	initialize: function (controller) {
		this.controller = controller;
		this.alg = [];
		this.error = false;
		
		this.controller.events.add('playerAction', function () {
			if (this.alg[0] && !this.error) {
				this.go();
			} else {
				//this.alg = atom.clone(this._alg);
				delete this._alg;
			}
		}.bind(this));
		this.controller.events.add('playerError', function () {
			this.error = true;
			throw new Error('Стена');
		}.bind(this));
	},
	add: function (arr) {
		if (atom.typeOf(arr) != 'array') arr = [arr];
		
		arr.forEach(function (v) {
			this.alg.push(v);
		}.bind(this));
	},
	go: function () {
		if (!this._alg) this._alg = atom.clone(this.alg);
		var action = this.alg.shift();
		
		if (typeof action == 'string') {
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
		}
	}
});