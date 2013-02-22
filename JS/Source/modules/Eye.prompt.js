atom.declare('Eye.prompt', {
	initialize: function (text, callback, file) {
		this.dom = atom.dom('body');
		this.callback = callback;
		this.keyboard = new atom.Keyboard();
		
		var container = atom.dom('#game > div');
		
		var wrapper = this.wrapper = atom.dom.create('div', { 'class': 'prompt' });
		var content = atom.dom.create('div', { 'class': 'content' }).appendTo(wrapper);
		atom.dom.create('div', { 'class': 'text' }).html(text).appendTo(content);
		
		if (callback) {
			var form = atom.dom.create('form', { 'class': 'input', 'action': '#' }).bind('submit', (!file) ? this.ok.bind(this) : this.load.bind(this)).appendTo(content);
			this.value = atom.dom.create('input', { 'class': 'value', type: (file) ? 'file' : 'text', size: 31 }).appendTo(form);
			atom.dom.create('input', { 'class': 'ok', 'type': 'button', 'value': 'Готово' }).bind('click', (!file) ? this.ok.bind(this) : this.load.bind(this)).appendTo(form);
			atom.dom.create('input', { 'class': 'cancel', 'type': 'button', 'value': 'Отмена' }).bind('click', function () {
				this.cancel();
			}.bind(this)).appendTo(form);
		} else {
			atom.dom.create('input', { 'class': 'cancel', 'type': 'button', 'value': 'Закрыть' }).bind('click', this.cancel.bind(this));
		}
		
		wrapper.appendTo('#container');
		
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
	load: function (e) {
		if (e) e.preventDefault();
		
		if (this.value.first.files[0]) {
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				var reader = new FileReader();
				reader.onload = function (e) {
					this.callback(e.target.result);
					this.cancel();
				}.bind(this);
				reader.readAsText(this.value.first.files[0]);
			} else {
				this.cancel();
				new Eye.prompt('Ваш браузер устарел и не поддерживает данную функцию. Обновите браузер или скачайте программу');
			}
		}
	},
	cancel: function () {
		this.wrapper.destroy();
	}
});