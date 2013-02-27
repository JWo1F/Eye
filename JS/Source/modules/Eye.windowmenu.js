Eye.windowmenu = function () {
	var gui = require('nw.gui');
	var win = gui.Window.get();
	var menubar = new gui.Menu({
		type: 'menubar'
	});
	new atom.Keyboard().events.add('d', function () { win.showDevTools() });

	menubar.append(new gui.MenuItem({
		label: 'Обновить',
		click: function() {
			location.reload();
		}
	}));

	menubar.append(new gui.MenuItem({
		label: 'Сохранить',
		click: function () {
			atom.dom('#save').first.click;
		}
	}));
	
	menubar.append(new gui.MenuItem({
		label: 'Загрузить',
		click: function () {
			atom.dom('#load').first.click();
		}.bind(this)
	}));
	
	menubar.append(new gui.MenuItem({
		label: 'Изменить размер',
		click: function () {
			atom.dom('#resize').first.click();
		}.bind(this)
	}));
	
	menubar.append(new gui.MenuItem({
		label: 'Помощь',
		click: function () {
			atom.dom('#help').first.click();
		}.bind(this)
	}));

	win.menu = menubar;
	atom.dom(function () {
		win.height = parseFloat(atom.dom('#game > div').css('height')) + 59;
		win.width = parseFloat(atom.dom('#game > div').css('width')) + parseFloat(atom.dom('#controlls').css('width')) + 17;
	});
};