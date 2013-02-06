atom.declare('Eye.List', {
	initialize: function(obj) {
		this.dom = atom.dom('#log').text('');
		this.store = ['Шаг', 'Прыжок', 'Поворот'];
		this.alg = obj.algoritm;
		this.started = false;
		obj.events.add('playerAction', this.moveAction);
		obj.events.add('addEvent', this.redraw.bind(this));
	},
	parse: function () {
		this.alg.forEach(function (v, i) {
			if (v.type == 'Eye.Loop') {
				this.createLoop(v, i);
			}
		}.bind(this));
	},
	createItem: function(num, id) {
		return atom.dom.create('div', {
			'class': 'item',
			'data-id': num
		}).text(this.store[id]);
	},
	createLoop: function (obj, id) {
		var elem = atom.dom.create('div', { 'class': 'loop', 'data-id': id });
		atom.dom.create('div', { 'class': 'info openTag' }).text((obj.num > 0) ? (obj.num > 1 && obj.num <= 4) ? obj.num+' раза {' : obj.num+' раз {' : (obj.num == -1) ? 'Пока стена {' : 'Пока не стена {').appendTo(elem);
		var body = atom.dom.create('div', { 'class': 'loop-body'}).appendTo(elem);
		
		atom.dom.create('div', { 'class': 'item' }).text('Шаг').appendTo(body);
		
		atom.dom.create('div', { 'class': 'info closeTag' }).text('}').appendTo(elem);
		this.dom.text('');
		elem.appendTo(this.dom);
	},
	start: function () {
		atom.dom(atom.dom('.item').first).toggleClass('active');
	},
	moveAction: function () {
		if (atom.dom('.item.active').first.nextSibling) atom.dom([atom.dom('.item.active'), atom.dom(atom.dom('.item.active').first.nextSibling)]).each(function(v) {
			v.toggleClass('active');
		});
	},
	redraw: function () {
		this.dom.text('');
		this.alg.forEach(function (v, i) {
			if (typeof v == 'number') {
				this.createItem(i, v).appendTo(this.dom);
			}
		}.bind(this));
	}
});