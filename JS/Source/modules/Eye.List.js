atom.declare('Eye.List', {

	store: ['Шаг', 'Прыжок', 'Поворот'],

	itemID: 0,

	initialize: function(obj) {
		this.settings = obj;
		this.dom = atom.dom('#log').text('');
		obj.events.player.add('complete', this.nextPosition.bind(this));
		obj.events.algoritm.add('added', this.add.bind(this));
	},
	add: function(id) {
		this.createItem(id).appendTo(this.dom);
	},
	createItem: function(id) {
		return atom.dom.create('div', {
			'class': 'item',
			'data-id': this.itemID++
		}).text(this.store[id]);
	},
	nextPosition: function() {
		var $ = atom.dom,
			current = $('#log .current');

		if (current.first) {
			current.removeClass('current');

			if (!current.first.nextSibling) return;

			$(current.first.nextSibling).addClass('current');
		}
		else {
			if (!$('#log .item').first) return;

			$($('#log .item').first).addClass('current');
		}
	}
});