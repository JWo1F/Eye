atom.declare('Eye.Subprogram', {
	initialize: function (obj) {
		this.store = {};
		this.events = obj.events.subprograms;
		this.fullEvents = obj.events;
		
		obj.events.list.add({
			select: function (val) {
				this.active = val;
			}.bind(this),
			unselect: function () {
				this.active = false;
			}.bind(this)
		});
	},
	add: function (name) {
		this.store[name] = [];
		this.events.fire('update');
	},
	push: function (name, value) {
		if (value == 'branch') {
			value = new Eye.Branch();
		}
		
		var cur = this.getAlg(name, this.active.attr('data-path'));
		cur.splice(parseFloat(this.active.attr('data-path').split('-').last)+1, 0, value);
		this.fullEvents.algoritm.fire('added');
	},
	getAlg: function (name, path) {
		var alg = this.find(name);
		
		path = path.split('-');
		path.shift();
		path.shift();

		if (path.length != 1) {
			path.pop();
			console.log(path);
			while (path[0]) {
				if (path[0].match(/s|w/)) {
					var type = path[0].match(/s|w/)[0];
					var id = parseFloat(path[0]);
					alg = alg[id];
					alg = alg.get(type);
				} else if (alg.Constructor == 'Eye.Loop') {
					alg = alg.alg[path[0]];
				} else {
					alg = alg[path[0]];
				}
				
				path.shift();
			}
			if (alg.Constructor == 'Eye.Loop') alg = alg.alg;
			//if (alg.Constructor == 'Eye.Branch')
		}
		
		console.log(alg);
		return alg;
	},
	replace: function (name, id, value) {
		if (typeof value != 'undefined') {
			this.store[name].splice(id, 1, value);
		} else {
			this.store[name].splice(id, 1);
		}
		this.events.fire('update');
	},
	up: function (name, id) {
		if (id !== 0) {
			var cur = this.find(name)[id];
			var top = this.find(name)[parseFloat(id)-1];
			
			
			this.replace(name, id, top);
			this.replace(name, parseFloat(id)-1, cur);
		}
	},
	down: function (name, id) {
		if (id !== this.find(name).length-1) {
			var cur = this.find(name)[id];
			var down = this.find(name)[parseFloat(id)+1];
			
			this.replace(name, id, down);
			this.replace(name, parseFloat(id)+1, cur);
		}
	},
	find: function (name) {
		if (this.store[name]) {
			return this.store[name];
		} else {
			return false;
		}
	},
	exist: function () {
		var result = false;
		for (var key in this.store) {
			result = true;
			break;
		}
		return result;
	},
	list: function () {
		var arr = [];
		for (var key in this.store) {
			arr.push(key);
		}
		return arr;
	},
	forEach: function (func) {
		for (var key in this.store) {
			func({name: key, alg: this.store[key]});
		}
	},
	remove: function (name) {
		console.log(name);
		delete this.store[name];
		this.events.fire('update');
	}
});