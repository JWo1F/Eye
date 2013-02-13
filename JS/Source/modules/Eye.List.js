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
		var scroll = atom.dom('#log').get().scrollTop;
		this.dom.text('');
		this.itemID = 0;
		this.alg.forEach(function (v) {
			if (typeof v == 'number') {
				this.add(v);
			}
		}.bind(this));
		
		if (flag) atom.dom('#log .item[data-id="'+parseFloat(this.active.attr('data-id'))+'"]').get().click();
		atom.dom('#log').get().scrollTop = scroll;
	},
	createItem: function(id) {
		return atom.dom.create('div', {
			'class': 'item',
			'data-id': this.itemID++
		}).text(this.store[id]).bind('click', this.click.bind(this));
	},
	nextPosition: function() {
		var $ = atom.dom,
			current = $('#log .current'),
			itemHeight = parseFloat(atom.dom('.item').css('height')),
			maxHeight = Math.round(parseFloat(atom.dom('#log').css('height')) / itemHeight);

		if (current.first) {
			current.removeClass('current');

			if (!current.first.nextSibling) return;

			$(current.first.nextSibling).addClass('current');
			
			if (maxHeight / parseFloat($(current.first.nextSibling).attr('data-id')) <= 2) {
				this.dom.get().scrollTop += itemHeight;
			}
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
			
			delete this.alg[id];
			var clean = this.alg.clean();
			this.alg.empty();
			this.alg.append(clean);
			this.unselect();
			this.parse();
			this.select(id);
		}
	},
	up: function (e) {
		e.preventDefault();
		
		if (this.active) {
			var id = this.active.attr('data-id'),
				itemHeight = parseFloat(atom.dom('.item').css('height'));
				
			if (parseFloat(id) !== 0) {
				var idPre = parseFloat(id)-1,
				
					act1 = this.alg[idPre],
					act2 = this.alg[id];
				
				this.unselect();
				
				this.alg[id] = act1;
				this.alg[idPre] = act2;
				
				this.parse();
				this.select(idPre);
				
				if (this.dom.get().scrollTop+parseFloat(this.dom.css('height'))/2 <= itemHeight*id) { this.dom.get().scrollTop = itemHeight*id + parseFloat(this.dom.css('height'))/2; } else { this.dom.get().scrollTop -= itemHeight; }
			}
		}
	},
	down: function (e) {
		e.preventDefault();
		
		if (this.active) {
			var id = this.active.attr('data-id'),
				itemHeight = parseFloat(atom.dom('.item').css('height'));
			
			if (parseFloat(id) != this.alg.length-1) {
				var idNext = parseFloat(id)+1;
				
				
				var act1 = this.alg[idNext];
				var act2 = this.alg[id];
				
				this.unselect();
				
				this.alg[id] = act1;
				this.alg[idNext] = act2;
				
				this.parse();
				this.select(idNext);
				
				if (this.dom.get().scrollTop+parseFloat(this.dom.css('height'))/2 <= itemHeight*id) { this.dom.get().scrollTop = itemHeight*id - parseFloat(this.dom.css('height'))/2; }// else { this.dom.get().scrollTop += itemHeight; }
			}
		}
	}
});