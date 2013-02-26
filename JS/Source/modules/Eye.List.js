atom.declare('Eye.List', {
	
	initialize: function (obj) {
		this.alg = obj.alg;
		this.events = obj.events;
		this.sp = obj.sp;
		
		this.active = false;
		this.save = false;
		this.dom = atom.dom('#log').text('');
		
		this.events.algoritm.add('added', this.add.bind(this));
		this.events.player.add('complete', this.selectNext.bind(this));
		this.events.main.add('debugger', this.debug.bind(this));
		this.events.main.add('editor', this.edit.bind(this));
		this.events.main.add('error', this.error.bind(this));
		this.events.main.add('enterWall', function () { this.enter = 'wall'; this.selectNext(); }.bind(this));
		this.events.main.add('enterSub', function (name) { this.enter = 'sp: ' + name.match(/sp\((.+)\)~/)[1]; this.selectNext(); }.bind(this));
		this.events.main.add('enterSpace', function () { this.enter = 'space'; this.selectNext(); }.bind(this));
		this.events.main.add('enterLoop', function () { this.enter = 'loop'; this.selectNext(); }.bind(this));
		this.events.main.add('leaveBlock', function () { this.enter = 'leave'; this.selectNext(); }.bind(this));
		this.events.subprograms.add('update', function () { this.parse(); }.bind(this));
		
		this.keyboard = new atom.Keyboard();
		this.keyboard.events.add('aup', this.up.bind(this));
		this.keyboard.events.add('adown', this.down.bind(this));
		this.keyboard.events.add('delete', this.del.bind(this));
		
		//atom.dom('#log').delegate('.item', 'click', this.click.bind(this));
		atom.dom('#log').delegate('.empty-action', 'click', this.click.bind(this));
	},
	createItem: function (id, parent) {
		parent.attr('data-items', parseFloat(parent.attr('data-items'))+1);
		
		var text = (typeof id == 'number') ? ['Шаг', 'Прыжок', 'Поворот'][id] : id.replace(/^sp: /, '');
		
		return atom.dom.create('div', {
			'class': 'item',
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1) : parseFloat(parent.attr('data-items')) - 1
		}).text(text).bind('click', this.click.bind(this));
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
		if (branch.wall.last !== null) {
			this.parse([wall, branch.wall]);
		} else {
			atom.dom.create('div', { 'class': 'empty-action', 'data-path': wall.attr('data-path')+'-0' }).text('Действие').appendTo(wall);
		}
		wall.appendTo(content);
		
		atom.dom.create('div', { 'class': 'info splice' }).text('} Иначе {').appendTo(content);
		
		var space = atom.dom.create('div', {
			'class': 'branch-space',
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1) + 's' : parseFloat(parent.attr('data-items')) - 1 + 's',
			'data-items': 0
		});
		if (branch.space.last !== null) {
			this.parse([space, branch.space]);
		} else {
			atom.dom.create('div', { 'class': 'empty-action', 'data-path': space.attr('data-path')+'-0' }).text('Действие').appendTo(space);
		}
		space.appendTo(content);
		
		atom.dom.create('div', { 'class': 'info closeTag' }).text('}').appendTo(content);
		
		content.bind('click', this.click.bind(this));
		
		return content;
	},
	createLoop: function (loop, parent) {
		parent.attr('data-items', parseFloat(parent.attr('data-items'))+1);
		
		var text = (loop.num == -1) ? 'Пока стена {' : (loop.num === 0) ? 'Пока не стена {' : (loop.num == 1) ? '1 раз {' : (loop.num < 5) ? loop.num+' раза {' : loop.num+' раз {'; 
		
		var content = atom.dom.create('div',{
			'class': 'loop',
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1) : parseFloat(parent.attr('data-items')) - 1
		});
		atom.dom.create('div', {
			'class': 'info openTag'
		}).text(text).appendTo(content);
		var body = atom.dom.create('div', {
			'class': 'loop-body',
			'data-items': 0,
			'data-path': (parent.attr('data-path')) ? parent.attr('data-path') + '-' + (parseFloat(parent.attr('data-items')) - 1): parseFloat(parent.attr('data-items')) - 1
		}).appendTo(content);
		if (loop.alg.last !== null) {
			this.parse([body, loop.alg]);
		} else {
			atom.dom.create('div', { 'class': 'empty-action', 'data-path': content.attr('data-path')+'-0' }).text('Действие').appendTo(body);
		}
		
		atom.dom.create('div', { 'class': 'info closeTag' }).text('}').appendTo(content);
		
		content.bind('click', this.click.bind(this));
		
		return content;
	},
	createSp: function () {
		var wrap = atom.dom.create('div').addClass('sp').appendTo('#log');
		atom.dom.create('div').addClass('openTag').text('Подпрограммы {').appendTo(wrap);
		
		var content = atom.dom.create('div', {
			'data-path': 'sp',
			'data-items': 0
		}).addClass('content').appendTo(wrap);
		
		this.sp.forEach(function (v) {
			var body = atom.dom.create('div', {
				'data-path': content.attr('data-path')+'-'+content.attr('data-items'),
				'data-name': v.name
			}).addClass('subprogram').bind('click', this.click.bind(this)).appendTo(content);
			atom.dom.create('div').addClass('openTag').text(v.name + ' {').appendTo(body);
			
			var sp = atom.dom.create('div', {
				'data-items': 0,
				'data-path': content.attr('data-path')+'-'+content.attr('data-items')
			}).addClass('sp-body').appendTo(body);
			if (v.alg.last !== null) {
				this.parse([sp, v.alg]);
			} else {
				atom.dom.create('div', { 'class': 'empty-action', 'data-path': body.attr('data-path')+'-0' }).text('Действие').appendTo(sp);
			}
			
			content.attr('data-items', parseFloat(content.attr('data-items'))+1);
			sp.attr('data-items', parseFloat(content.attr('data-items'))+1);
			
			atom.dom.create('div').addClass('closeTag').text('}').appendTo(body);
		}.bind(this));
		
		atom.dom.create('div').addClass('closeTag').text('}').appendTo(wrap);
	},
	add: function () {
		var next = this.active ? this.active.attr('data-path').replace(/\d+$/, '') + (parseFloat(this.active.attr('data-path').split('-').last)+1) : false;
		
		this.parse();
		
		if (next) {
			if (atom.dom('[data-path="'+next+'"]').first) {
				this.active.first.click();
				this.active = atom.dom('[data-path="'+next+'"]');
				this.active.first.click();
				
			}
		}
	},
	parse: function (config) {
		var children = !!config;
		var parent = (children) ? config[0] : this.dom;
		var alg = (children) ? config[1] : this.alg;
		
		if (!children) this.dom.text('').attr('data-items', 0);
		
		alg.forEach(function (v) {
			if (typeof v != 'object') {
				this.createItem(v, parent).appendTo(parent);
			} else if (v.Constructor == 'Eye.Branch') {
				this.createBranch(v, parent).appendTo(parent);
			} else if (v.Constructor == 'Eye.Loop') {
				this.createLoop(v, parent).appendTo(parent);
			}
		}.bind(this));
		
		if (!children && this.sp.exist()) {
			var content = this.createSp();
		}
		if (!children) {
			if (this.active) {
				this.active = (atom.dom('[data-path="' + this.active.attr('data-path') + '"]').first) ? atom.dom('[data-path="' + this.active.attr('data-path') + '"]') : (atom.dom('[data-path="' + (parseFloat(this.active.attr('data-path')) - 1) + '"]').first) ? atom.dom('[data-path="' + (parseFloat(this.active.attr('data-path')) - 1) + '"]') : false;
				if (this.active) this.active.first.click();
			}
		}
	},
	click: function (event) {
		event.stopPropagation();
		
		var elem = atom.dom(event.srcElement||event.target);
		while (!elem.hasClass(['item']) && !elem.hasClass('branch') && !elem.hasClass('loop') && !elem.hasClass('empty-action') && !elem.hasClass('subprogram')) elem = elem.parent();
		
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
		
		this.events.list.fire('select', [this.active]);
	},
	unselect: function () {
		this.active.removeClass('active');
		
		this.active = false;
		
		this.events.list.fire('unselect');
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
						
					current = current[id][(branch == 'w') ? 'wall' : 'space'];
				} else {
					current = current[v];
				}
			} else {
				if (v.match(/\D/)) {
					current = current.alg[parseFloat(v)][(v.match(/\D+/)[0] == 'w') ? 'wall' : 'space'];
				} else {
					current = current.alg[v];
				}
			}
		}.bind(this));
		
		return (flag) ? [current, last] : current;
	},
	replaceAlg: function (path, value) {
		var store = this.getAlg(path, true);
		
		if (!path.toString().split('-').last.match(/\D/)) {
			if (store[1]) {
				if (atom.typeOf(store[1]) == 'array') {
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
				if (atom.typeOf(store[1]) == 'array') {
					store[1].splice(parseFloat(path.toString().split('-').last), 1);
				} else {
					store[1].alg.splice(parseFloat(path.toString().split('-').last), 1);
				}
			} else {
				this.alg.splice(path,1);
			}
		}
	},
	up: function (e) {
		e.preventDefault();
		
		if (this.active && parseFloat(this.active.attr('data-path').toString().split('-').last) && !this.active.attr('data-path').match(/^sp-\d+$/)) {
			var log = atom.dom('#log');
			var height = parseFloat(log.css('height'));
			var iHeight = parseFloat(atom.dom('.item').css('height'));
			var position = parseFloat(this.active.attr('data-path').toString().split('-').last);
			
			var newPath = this.active.attr('data-path').toString().split('-');
			newPath[newPath.length-1] = (newPath.last.match(/\D/)) ? newPath.last.match(/\D+/)[0] + parseFloat(newPath.last)-1 : parseFloat(newPath.last)-1;
			newPath = newPath.join('-');
			
			if (this.active.attr('data-path').split('-')[0] != 'sp') {
				var pre = this.getAlg(newPath);
				var cur = this.getAlg(this.active.attr('data-path'));
				
				this.replaceAlg(newPath, cur);
				this.replaceAlg(this.active.attr('data-path').toString(), pre);
			} else {
				var name = this.active;
				while (!name.attr('data-name')) name = name.parent();
				name = name.attr('data-name');
				this.sp.up(name, this.active.attr('data-path').toString().split('-').last);
			}
			
			this.parse();
			
			log.first.scrollTop = position*iHeight-height/2-iHeight/2;
			atom.dom('[data-path="'+newPath+'"]').first.click();
		}
	},
	down: function (e) {
		e.preventDefault();
		
		if (this.active && this.active.first.nextSibling && !atom.dom(this.active.first.nextSibling).hasClass('sp') && !this.active.attr('data-path').match(/^sp-\d+$/)) {
			var log = atom.dom('#log');
			var height = parseFloat(log.css('height'));
			var iHeight = parseFloat(atom.dom('.item').css('height'));
			var position = parseFloat(this.active.attr('data-path').toString().split('-').last);
			
			var newPath = this.active.attr('data-path').toString().split('-');
			newPath[newPath.length-1] = (newPath.last.match(/\D/)) ? newPath.last.match(/\D+/)[0] + parseFloat(newPath.last)+1 : parseFloat(newPath.last)+1;
			newPath = newPath.join('-');
			
			if (this.active.attr('data-path').split('-')[0] != 'sp') {
				var next = this.getAlg(newPath);
				var current = this.getAlg(this.active.attr('data-path'));
				
				this.replaceAlg(newPath, current);
				this.replaceAlg(this.active.attr('data-path').toString(), next);
			} else {
				var name = this.active;
				while (!name.attr('data-name')) name = name.parent();
				name = name.attr('data-name');
				this.sp.down(name, this.active.attr('data-path').toString().split('-').last);
			}
			
			this.parse();
			
			log.first.scrollTop = position*iHeight-height/2+iHeight*1.5;
			atom.dom('[data-path="'+newPath+'"]').first.click();
		}
	},
	del: function () {
		if (this.active) {
			if (this.active.attr('data-path').split('-')[0] != 'sp') {
				this.delAlg(this.active.attr('data-path'));
				this.parse();
			} else {
				var name = this.active;
				while (!name.attr('data-name')) name = name.parent();
				name = name.attr('data-name');
				
				if (!this.active.attr('data-path').match(/^sp-\d+$/)) {
					var active = this.active;
					this.sp.replace(name, this.active.attr('data-path').toString().split('-').last);
					console.log(atom.dom('[data-path="'+active.attr('data-path')+'"]').first);
					
					if (atom.dom('[data-path="'+active.attr('data-path')+'"]').first) {
						this.active = atom.dom('[data-path="'+active.attr('data-path')+'"]');
						//this.active.first.click();
					} else if (atom.dom('[data-path="'+active.attr('data-path').replace(/\d+$/, '') + (parseFloat(active.attr('data-path').split('-').last)-1)+'"]').first) {
						this.active = atom.dom('[data-path="'+active.attr('data-path').replace(/\d+$/, '') + (parseFloat(active.attr('data-path').split('-').last)-1)+'"]');
						this.active.first.click();
					}
				} else {
					this.events.list.fire('removeSp', [name]);
					this.sp.remove(name);
				}
			}
		}
	},
	selectNext: function () {
		var current = atom.dom('.current').removeClass('current');
		var $ = atom.dom;
		
		if (current.first) {
			if (!this.enter) {
				if (current.hasClass('loop-body') || current.hasClass('branch-wall') || current.hasClass('branch-space') || current.hasClass('sp-body')) {
					$(current.find('.item').first).addClass('current');
				} else {
					if (current.first.nextSibling) {
						$(current.first.nextSibling).addClass('current');
					} else {
						$(current.parent().find('.item').first).addClass('current');
					}
				}
			} else if (this.enter == 'wall') {
				if (current.hasClass('item')) {
					$(current.first.nextSibling).find('.branch-wall').addClass('current');
				} else {
					current.find('.branch > .branch-wall').addClass('current');
				}
			} else if (this.enter == 'space') {
				if (current.hasClass('item')) {
					$(current.first.nextSibling).find('.branch-space').addClass('current');
				} else {
					current.find('.branch > .branch-space').addClass('current');
				}
			} else if (this.enter == 'loop') {
				if (current.hasClass('item')) {
					$(current.first.nextSibling).find('.loop-body').addClass('current');
				} else {
					current.find('.loop > .loop-body').addClass('current');
				}
			} else if (this.enter.match(/sp: /)) {
				this.save = atom.dom(current.first.nextSibling);
				$('#log > .sp > .content > [data-name="'+this.enter.match(/sp: (.+)/)[1]+'"] > .sp-body').addClass('current');
			} else if (this.enter == 'leave') {
				if (this.save) {
					this.save.addClass('current');
					this.save = false;
				} else {
					current.parent(2).addClass('current');
				}
			}
			if (this.enter) this.enter = false;
		} else {
			if (!this.enter) {
				$($('#log > div').first).addClass('current');
			} else if (this.enter == 'wall') {
				$($('#log > div > .branch-wall').first).addClass('current');
			} else if (this.enter == 'space') {
				$($('#log > div > .branch-space').first).addClass('current');
			} else if (this.enter == 'loop') {
				$($('#log > div > .loop-body').first).addClass('current');
			} else if (this.enter.match(/sp: /)) {
				this.save = $($('#log > .item').first);
				$('#log > .sp > .content > [data-name="'+this.enter.match(/sp: (.+)/)[1]+'"] > .sp-body').addClass('current');
			}
			if (this.enter) this.enter = false;
		}
	},
	debug: function () {
		if (this.active) this.unselect();
		atom.dom('.empty-action').addClass('invise');
	},
	edit: function () {
		atom.dom('.empty-action').removeClass('invise');
	},
	error: function () {
		this.selectNext();
		atom.dom('.current').addClass('error');
		this.events.player.fire('completeChain');
	}
});