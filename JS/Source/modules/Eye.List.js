atom.declare('Eye.List', {
	initialize: function (controller) {
		this.controller = controller;
		this.keyboard = new atom.Keyboard();
		this.keyboard.events.add('aup', this.up.bind(this));
		this.keyboard.events.add('adown', this.down.bind(this));
		this.keyboard.events.add('delete', this.del.bind(this));
		
		this.active = false;
		atom.dom('#log').delegate('[data-path], .tag', 'click', this.click.bind(this));
		
		this.controller.events.add(['actionAdd', 'actionRemove', 'actionMove'], this.parse.bind(this));
	},
	click: function (e) {
		e.preventDefault;
		e.stopPropagation();
		
		var elem = atom.dom(e.target);
		if (elem.hasClass('tag')) elem = elem.parent();
		
		if (this.active && this.active.get() == elem.get()) {
			this.unselect();
		} else if (this.active && this.active.get() != elem.get()) {
			this.unselect();
			this.select(elem);
		} else if (!this.active) {
			this.select(elem);
		}
	},
	select: function (elem) {
		this.controller.events.fire('listSelect', [elem]);
		elem.addClass('active');
		this.active = elem;
	},
	unselect: function () {
		this.controller.events.fire('listUnselect');
		this.active.removeClass('active');
		this.active = false;
	},
	up: function () {
		if (this.active) {
			var alg = this.controller.algoritm.getAlgByPath(this.active.attr('data-path'));
			var nextDom = this.active.first.previousSibling && atom.dom(this.active.first.previousSibling).attr('data-path');
			
			if (nextDom) {
				var prev = alg[0].splice(alg[2], 1);
				
				alg[0].splice(parseFloat(alg[2]) - 1, 0, prev[0]);
				this.controller.events.fire('actionMove', ['up']);
				
				this.unselect();
				this.select(atom.dom('[data-path="' + nextDom + '"]'));
			}
		}
	},
	down: function () {
		if (this.active) {
			var alg = this.controller.algoritm.getAlgByPath(this.active.attr('data-path'));
			var nextDom = this.active.first.nextSibling && atom.dom(this.active.first.nextSibling).attr('data-path');
			
			if (nextDom) {
				var prev = alg[0].splice(alg[2], 1);
				
				alg[0].splice(parseFloat(alg[2]) + 1, 0, prev[0]);
				this.controller.events.fire('actionMove', ['down']);
				
				this.unselect();
				this.select(atom.dom('[data-path="' + nextDom + '"]'));
			}
		}
	},
	del: function () {
		if (this.active) {
			var next = this.active.attr('data-path');
			var par = this.active.parent();
			
			var alg = this.controller.algoritm.getAlgByPath(next);
			alg[0].splice(alg[2], 1);
			this.controller.events.fire('actionRemove');
			
			next = atom.dom('[data-path="' + next + '"]').first ? atom.dom('[data-path="' + next + '"]') : par.first.childElementCount ? atom.dom(par.first.children[par.first.children.length - 1]) : false;git 
			this.unselect();
			if (next) this.select(next);
		}
	},
	add: function (elem, append) {
		var result, parent;
		
		if (typeof elem == 'string') {
			result = atom.dom.create('li').addClass('item').text((elem == 'move') ? 'Шаг' : (elem == 'jump') ? 'Прыжок' : (elem == 'rotate') ? 'Поворот' : elem);
		} else if (elem.Constructor == 'Eye.Loop') {
			result = atom.dom.create('ul').addClass('loop').attr('data-num', 0);
			var text = (elem.num == -2) ? 'Пока стена {' : (elem.num == -1) ? 'Пока не стена {' : (elem.num == 1) ? '1 раз {' : (elem.num > 1 && elem.num < 5) ? elem.num + ' раза {' : elem.num + ' раз {';
			atom.dom.create('div').addClass('tag').text(text).appendTo(result);
			var loop = atom.dom.create('div').addClass('loop-body').appendTo(result);
			atom.dom.create('div').addClass('tag').text('}').appendTo(result);
		} else if (elem.Constructor == 'Eye.Branch') {
			result = atom.dom.create('ul').addClass('branch');
			atom.dom.create('div').addClass('tag').text('Если впереди стена {').appendTo(result);
			var border = atom.dom.create('div').addClass('branch-border').attr('data-num', 0).appendTo(result);
			atom.dom.create('div').addClass('tag').text('} Иначе {').appendTo(result);
			var space = atom.dom.create('div').addClass('branch-space').attr('data-num', 0).appendTo(result);
			atom.dom.create('div').addClass('tag').text('}').appendTo(result);
		}
		
		result.appendTo(append || '#log');
		
		if (result.parent().attr('data-path')) {
			parent = result.parent();
		} else {
			parent = result.parent(2);
		}
		
		result.attr('data-path', parent.attr('data-path') + '-' + parent.attr('data-num'));
		parent.attr('data-num', parseFloat(parent.attr('data-num')) + 1);
		
		if (typeof elem == 'object' && elem.Constructor == 'Eye.Loop') {
			if (elem.alg != false) {
				elem.alg.forEach(function (v) {
					this.add(v, loop);
				}.bind(this));
			} else {
				atom.dom.create('li').addClass('item').text('Действие').attr('data-path', result.attr('data-path') + '-0').appendTo(loop);
			}
		} else if (typeof elem == 'object' && elem.Constructor == 'Eye.Branch') {
			if (elem.border != false) {
				elem.border.forEach(function (v) {
					this.add(v, border);
				}.bind(this));
			} else {
				atom.dom.create('li').addClass('item').text('Действие').attr('data-path', result.attr('data-path') + '-0').appendTo(border);
			}
			
			if (elem.space != false) {
				elem.space.forEach(function (v) {
					this.add(v, space);
				}.bind(this));
			} else {
				atom.dom.create('li').addClass('item').text('Действие').attr('data-path', result.attr('data-path') + '-0').appendTo(space);
			}
		}
	},
	parse: function () {
		atom.dom('#log').empty().attr('data-num', 0);
		this.controller.algoritm.alg.forEach(function (v) { this.add(v) }.bind(this));
	}
});