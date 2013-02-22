Eye.windowmenu = function () {
	var gui = require('nw.gui');
	var win = gui.Window.get();
	var menubar = new gui.Menu({
		type: 'menubar'
	});

	menubar.append(new gui.MenuItem({
		label: 'Обновить',
		click: function() {
			location.reload();
		}
	}));

	menubar.append(new gui.MenuItem({
		label: 'Сохранить',
		click: this.save.bind(this)
	}));
	
	menubar.append(new gui.MenuItem({
		label: 'Загрузить',
		click: function () {
			new Eye.prompt('Выберете загрузочный файл:', this.load.bind(this), true);
		}.bind(this)
	}));
	
	menubar.append(new gui.MenuItem({
		label: 'Помощь',
		click: function () {
			new Eye.prompt('Выберете загрузочный файл:', this.load.bind(this), true);
		}.bind(this)
	}));

	win.menu = menubar;
};