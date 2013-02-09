atom.declare('Eye.List', {

	store: ['Шаг', 'Прыжок', 'Поворот'],

	itemID: 0,

	initialize: function(obj) {
		this.settings = obj;
		this.dom = atom.dom('#log').text('');
		obj.events.player.add('complete', this.nextPosition.bind(this));
		this.events = obj.events.list;
		obj.events.algoritm.add('added', function (id) {
			this.add(id);
		}.bind(this));
		obj.events.algoritm.add('extraAdded', this.parse.bind(this));
		this.keyboard = new atom.Keyboard();
		this.keyboard.events.add('delete', this.del.bind(this));
		this.keyboard.events.add('aup', this.up.bind(this));
		this.keyboard.events.add('adown', this.down.bind(this));
		this.alg = obj.alg;
	},
	add: function(id) {
		this.createItem(id).appendTo(this.dom);
	},
	parse: function (flag) {
		this.dom.text('');
		this.itemID = 0;
		this.alg.forEach(function (v) {
			if (typeof v == 'number') {
				this.add(v);
			}
		}.bind(this));
		if (flag) this.select(this.active.attr('data-id'));
	},
	createItem: function(id) {
		return atom.dom.create('div', {
			'class': 'item',
			'data-id': this.itemID++
		}).text(this.store[id]).bind('click', this.click.bind(this));
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
	},
	select: function (id) {
		var elem = (!isNaN(parseFloat(id))) ? atom.dom('#log .item[data-id="'+id+'"]') : id;
		
		if (elem && elem.get() && !atom.dom('#edit').hasClass('deactive')) {
			this.active = elem;
			elem.addClass('active');
			this.events.fire('select', [elem]);
		}
	},
	unselect: function () {
		if (this.active) {
			this.active.removeClass('active');
			this.active = false;
			this.events.fire('unselect');
		}
	},
	click: function (e) {
		var elem = atom.dom(e.srcElement);
		
		if (!atom.dom('#log').hasClass('deactive')) {
			if (this.active && this.active.get() != elem.get()) {
				this.unselect();
				this.select(elem);
			} else if (!this.active) {
				this.select(elem);
			} else if (this.active.get() == elem.get()) {
				this.unselect();
			}
		}
	},
	del: function () {
		if (this.active) {
			var id = this.active.attr('data-id');
			console.log(id);
			
			delete this.alg[id];
			var clean = this.alg.clean();
			this.alg.empty();
			this.alg.append(clean);
			this.unselect();
			this.parse();
			this.select(id);
		}
	},
	up: function () {
		var id = this.active.attr('data-id');
		
		if (this.active && parseFloat(id) !== 0) {
			var idPre = parseFloat(id)-1;
			
			var act1 = this.alg[idPre];
			var act2 = this.alg[id];
			
			this.unselect();
			
			this.alg[id] = act1;
			this.alg[idPre] = act2;
			
			this.parse();
			this.select(idPre);
		}
	},
	down: function () {
		var id = this.active.attr('data-id');
		
		if (this.active && parseFloat(id) != this.alg.length-1) {
			var idNext = parseFloat(id)+1;
			
			
			var act1 = this.alg[idNext];
			var act2 = this.alg[id];
			
			this.unselect();
			
			this.alg[id] = act1;
			this.alg[idNext] = act2;
			
			this.parse();
			this.select(idNext);
		}
	}
});