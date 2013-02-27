atom.declare('Eye.prompt', {
	initialize: function (obj) {
		this.settings = obj;
		
		atom.dom('.prompt').destroy();
		this.generate();
	},
	generate: function () {
		var prompt = this.prompt = atom.dom.create('div').addClass('prompt');
		
		atom.dom.create('div').addClass('black').css({
			left: atom.dom('#game > div').first.offsetLeft,
			width: parseFloat(atom.dom('#game > div').css('width')) + 2,
			top: atom.dom('#game > div').first.offsetTop,
			height: parseFloat(atom.dom('#game > div').css('height')) + 2
		}).appendTo(prompt);
		
		var content = atom.dom.create('div').addClass('content').appendTo(prompt);
		
		atom.dom.create('div').addClass('text').html(this.settings.text).appendTo(content);
		
		this.generateForm().appendTo(content);
		
		content.appendTo(prompt);
		prompt.appendTo('body');
		
		content.css({
			left: (atom.dom('#game > div').first.offsetLeft + parseFloat(atom.dom('#game > div').css('width')) + 2)/2 - 400/2,
			top: (atom.dom('#game > div').first.offsetTop + parseFloat(atom.dom('#game > div').css('height')) + 2)/2 - parseFloat(content.css('height'))/2
		});
	},
	generateForm: function () {
		if (!this.settings.type) this.settings.type = 'text';
		
		var form = atom.dom.create('form', {
				'action': '#'
			}).bind('submit', (this.settings.type != 'file') ? this.ok.bind(this) : this.load.bind(this));
		
		if (this.settings.type == 'input' || this.settings.type == 'file') {
			this.value = atom.dom.create('input', {
				'type': (this.settings.type == 'input') ? 'text' : 'file',
				'maxlength': 15
			}).attr('width', 20).appendTo(form);
		} else {
			this.value = atom.dom.create('select').appendTo(form);
			
			this.settings.items.forEach(function (v) {
				atom.dom.create('option').text(v).appendTo(this.value);
			}.bind(this));
		}
		
		if (this.settings.buttons && this.settings.buttons.match(/ok/)) atom.dom.create('input', {
			'type': 'submit',
			'value': 'Готово'
		}).addClass('button').appendTo(form);
			
		if (this.settings.buttons && this.settings.buttons.match(/cancel/)) atom.dom.create('input', {
			'type': 'button',
			'value': 'Отмена'
		}).addClass('button').css('margin-left', '15px').bind('click', this.cancel.bind(this)).appendTo(form);
		
		return form;
	},
	ok: function (e) {
		if (e) e.preventDefault();
		
		if (this.value.first.value) {
			this.settings.callback(this.value.first.value);
			this.cancel();
		}
	},
	load: function (e) {
		if (e) e.preventDefault();
		
		if (this.value.first.files[0]) {
			if (window.File && window.FileReader && window.FileList && window.Blob) {
				var reader = new FileReader();
				reader.onload = function (e) {
					this.settings.callback(e.target.result);
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
		this.prompt.destroy();
	}
});