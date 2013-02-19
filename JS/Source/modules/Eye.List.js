atom.declare('Eye.List', {
	
	initialize: function (obj) {
		this.alg = obj.alg;
		this.events = obj.events;
		
		this.active = false;
		this.dom = atom.dom('#log').text('');
		
		this.events.algoritm.add('added', function (v) { this.parse(); }.bind(this));
		this.events.player.add('complete', this.selectNext.bind(this));
		this.events.main.add('debugger', this.debug.bind(this));
		this.events.main.add('editor', this.edit.bind(this));
		this.events.main.add('error', this.error.bind(this));
		this.events.main.add('enterWall', function () { this.enter = 'wall'; }.bind(this));
		this.events.main.add('enterSpace', function () { this.enter = 'space'; }.bind(this));
		this.events.main.add('leaveBlock', function () { this.enter = 'leave'; this.selectNext(); }.bind(this));
		
		this.keyboard = new atom.Keyboard();
		this.keyboard.events.add('aup', this.up.bind(this));
		this.keyboard.events.add('adown', this.down.bind(this));
		this.keyboard.events.add('delete', this.del.bind(this));
		
		atom.dom('#log').delegate('.item', 'click', this.click.bind(this));
	},
	createItem: function (id, parent) {
		parent.attr('data-items', parseFloat(parent.attr('data-items'))+1);
		
		return atom.dom.create('div', {
			'class': 'item',
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1) : parseFloat(parent.attr('data-items')) - 1
		}).text(['Шаг', 'Прыжок', 'Поворот'][id]);
	},
	createBranch: function (branch, parent) {
		parent.attr('data-items', parseFloat(parent.attr('data-items'))+1);
		
		var content = atom.dom.create('div', {
			'class': 'branch',
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1) : parseFloat(parent.attr('data-items')) - 1
		});
		atom.dom.create('div', { 'class': 'info openTag' }).text('Если стена {').appendTo(content);
		var wall = atom.dom.create('div', {
			'class': 'branch-wall',
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1) + 'w' : parseFloat(parent.attr('data-items')) - 1 + 'w',
			'data-items': 0
		});
		if (branch.get('w').last !== null) {
			this.parse([wall, branch.get('w')]);
		} else {
			atom.dom.create('div', { 'class': 'empty-action' }).text('Действие').appendTo(wall);
		}
		wall.appendTo(content);
		
		atom.dom.create('div', { 'class': 'info splice' }).text('} Иначе {').appendTo(content);
		
		var space = atom.dom.create('div', {
			'class': 'branch-space',
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1) + 's' : parseFloat(parent.attr('data-items')) - 1 + 's',
			'data-items': 0
		});
		if (branch.get('s').last !== null) {
			this.parse([space, branch.get('s')]);
		} else {
			atom.dom.create('div', { 'class': 'empty-action' }).text('Действие').appendTo(space);
		}
		space.appendTo(content);
		
		atom.dom.create('div', { 'class': 'info closeTag' }).text('}').appendTo(content);
		
		content.bind('click', this.click.bind(this));
		
		return content;
	},
	createLoop: function (parent) {
		parent = parent||this.dom;
		
		
	},
	parse: function (config) {
		var children = !!config;
		var parent = (children) ? config[0] : this.dom;
		var alg = (children) ? config[1] : this.alg;
		
		if (!children) this.dom.text('').attr('data-items', 0);
		
		alg.forEach(function (v) {
			if (typeof v == 'number') {
				this.createItem(v, parent).appendTo(parent);
			} else if (v.type == 'Eye.Branch') {
				this.createBranch(v, parent).appendTo(parent);
			}
		}.bind(this));
	},
	click: function (event) {
		event.stopPropagation();
		
		var elem = atom.dom(event.srcElement);
		while (!elem.hasClass('item') && !elem.hasClass('branch') && !elem.hasClass('loop')) elem = elem.parent();
		
		if (!atom.dom('#log').hasClass('deactive')) {
			if (elem.hasClass('active')) {
				this.unselect();
			} else {
				if (this.active) this.unselect();
				this.select(elem);
			}
		}
	},
	select: function (elem) {
		elem.addClass('active');
		
		this.active = elem;
	},
	unselect: function () {
		this.active.removeClass('active');
		
		this.active = false;
	},
	getAlg: function (path, flag) {
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
			}
		}.bind(this));
		
		return (flag) ? [current, last] : current;
	},
	replaceAlg: function (path, value) {
		var store = this.getAlg(path, true);
		
		if (!path.toString().split('-').last.match(/\D/)) {
			if (store[1]) {
				if (atom.typeOf(store[1] == 'array')) {
					store[1][path.toString().split('-').last] = value;
				} else {
					store[1].replace(path.toString().split('-').last, value);
				}
			} else {
				this.alg[path] = value;
			}
		}
	},
	delAlg: function (path) {
		var store = this.getAlg(path, true);
		
		if (!path.toString().split('-').last.match(/\D/)) {
			if (store[1]) {
				store[1].splice(parseFloat(path.toString().split('-').last), 1);
			} else {
				this.alg.splice(path,1);
			}
		}
	},
	up: function (e) {
		e.preventDefault();
		
		if (this.active && parseFloat(this.active.attr('data-path').toString().split('-').last)) {
			var log = atom.dom('#log');
			var height = parseFloat(log.css('height'));
			var iHeight = parseFloat(atom.dom('.item').css('height'));
			var position = parseFloat(this.active.attr('data-path').toString().split('-').last);
			
			var newPath = this.active.attr('data-path').toString().split('-');
			newPath[newPath.length-1] = (newPath.last.match(/\D/)) ? newPath.last.match(/\D+/)[0] + parseFloat(newPath.last)-1 : parseFloat(newPath.last)-1;
			newPath = newPath.join('-');
			
			var pre = this.getAlg(newPath);
			var cur = this.getAlg(this.active.attr('data-path'));
			
			this.replaceAlg(newPath, cur);
			this.replaceAlg(this.active.attr('data-path').toString(), pre);
			
			this.parse();
			
			log.first.scrollTop = position*iHeight-height/2-iHeight/2;
			atom.dom('[data-path="'+newPath+'"]').first.click();
		}
	},
	down: function (e) {
		e.preventDefault();
		
		if (this.active && this.active.first.nextSibling) {
			var log = atom.dom('#log');
			var height = parseFloat(log.css('height'));
			var iHeight = parseFloat(atom.dom('.item').css('height'));
			var position = parseFloat(this.active.attr('data-path').toString().split('-').last);
			
			var newPath = this.active.attr('data-path').toString().split('-');
			newPath[newPath.length-1] = (newPath.last.match(/\D/)) ? newPath.last.match(/\D+/)[0] + parseFloat(newPath.last)+1 : parseFloat(newPath.last)+1;
			newPath = newPath.join('-');
			
			var next = this.getAlg(newPath);
			var current = this.getAlg(this.active.attr('data-path'));
			
			this.replaceAlg(newPath, current);
			this.replaceAlg(this.active.attr('data-path').toString(), next);
			
			this.parse();
			
			log.first.scrollTop = position*iHeight-height/2+iHeight*1.5;
			atom.dom('[data-path="'+newPath+'"]').first.click();
		}
	},
	del: function () {
		if (this.active) {
			this.delAlg(this.active.attr('data-path'));
			this.parse();
			this.active = (atom.dom('[data-path="'+this.active.attr('data-path')+'"]').first) ? atom.dom('[data-path="'+this.active.attr('data-path')+'"]') : atom.dom('[data-path="'+(this.active.attr('data-path')-1)+'"]').first ? atom.dom('[data-path="'+(this.active.attr('data-path')-1)+'"]') : false;
			if (this.active) this.active.first.click();
		}
	},
	selectNext: function () {
		var current = atom.dom('#log .current');
		current.removeClass('current');
		
		if (current.get()) {
			if (!this.enter) {
				while (!atom.dom(current.first.nextSibling).hasClass('item')) current = atom.dom(current.first.nextSibling);
				atom.dom(current.first.nextSibling).addClass('current');
			} else if (this.enter == 'space') {
				atom.dom(atom.dom(current.first.nextSibling).find('.branch-space').find('div').first).addClass('current');
			} else if (this.enter == 'wall') {
				atom.dom(atom.dom(current.first.nextSibling).find('.branch-wall').find('div').first).addClass('current');
			} else if (this.enter == 'leave') {
				if (current.parent().hasClass('loop')) {
					current.parent().addClass('current');
				} else {
					current.parent(2).addClass('current');
				}
			}
			this.enter = false;
		} else {
			atom.dom(atom.dom('#log div').first).addClass('current');
		}
	},
	debug: function () {
		if (this.active) this.unselect();
		atom.dom('.empty-action').addClass('invise');
	},
	edit: function () {
		atom.dom('.empty-action').removeClass('invise');
	},
	enterWall: function () {
		
	},
	error: function () {
		this.selectNext();
		atom.dom('.current').addClass('error');
	}
});