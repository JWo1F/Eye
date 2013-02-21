atom.declare('Eye.prompt', {
	initialize: function (text, callback) {
		this.dom = atom.dom('body');
		this.callback = callback;
		this.keyboard = new atom.Keyboard();
		
		var container = atom.dom('#game > div');
		
		var wrapper = this.wrapper = atom.dom.create('div', { 'class': 'prompt' });
		var content = atom.dom.create('div', { 'class': 'content' }).appendTo(wrapper);
		atom.dom.create('div', { 'class': 'text' }).html(text).appendTo(content);
		
		var form = atom.dom.create('form', { 'class': 'input', 'action': '#' }).bind('submit', this.ok.bind(this)).appendTo(content);
		this.value = atom.dom.create('input', { 'class': 'value' }).appendTo(form);
		atom.dom.create('input', { 'class': 'ok', 'type': 'button', 'value': 'Готово' }).bind('click', this.ok.bind(this)).appendTo(form);
		atom.dom.create('input', { 'class': 'cancel', 'type': 'button', 'value': 'Отмена' }).bind('click', function () {
			this.cancel();
		}.bind(this)).appendTo(form);
		
		wrapper.appendTo('body');
		
		content.css({
			'left': parseFloat(container.css('width'))/2 - parseFloat(content.css('width'))/2,
			'top': parseFloat(container.css('height'))/2 - parseFloat(content.css('height'))/2
		});
		this.value.first.focus();
	},
	ok: function (e) {
		if (e) e.preventDefault();
		
		if (this.value.first.value) {
			this.callback(this.value.first.value);
			this.cancel();
		}
	},
	cancel: function () {
		this.wrapper.destroy();
	}
});