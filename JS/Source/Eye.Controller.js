atom.declare('Eye.Controller', {
	resources: {},
	initialize: function() {
		this.resources.program = {
			user: false
		};
		
		var size = (location.hash != '#') ? location.hash.replace('#', '').split('*') : false;
		if (size.length != 2) size = false;
		
		this.resources.settings = {
			size: new Size(size ? size[0] : 16, size ? size[1] : 8),
			cellSize: new Size(50, 50),
			cell: [0, 0],
			vector: 0,
			logOpenSize: 0
		};
		this._settings = atom.clone(this.resources.settings);
		this.resources.events = {
			list: new atom.Events(),
			algoritm: new atom.Events(),
			player: new atom.Events(),
			main: new atom.Events(),
			subprograms: new atom.Events()
		};
		this.resources.events.main = new atom.Events();
		atom.dom(this.start.bind(this));
	},
	start: function() {
		this.engine = this.createEngine();

		this.app = new App({
			size: this.engine.countSize(),
			appendTo: '#game'
		});

		this.engineElement = TileEngine.Element.app(this.app, this.engine);

		var tailLayer = this.app.createLayer({name: 'tail', intersection: 'manual'});

		this.player = new Eye.Player(this.app.createLayer('player'), {
			res: this.resources,
			engine: this.engine,
			events: this.resources.events
		});
		
		this.tail = new Eye.Tail(tailLayer, {
			events: this.resources.events,
			cell: this.engine.getCellByIndex(this.resources.settings.cell).rectangle.from.clone()
		});
		
		this.subprograms = new Eye.Subprogram({
			events: this.resources.events
		});

		this.algoritm = new Eye.Algoritm({
			engine: this.engine,
			events: this.resources.events,
			cell: this.resources.settings.cell,
			vector: this.resources.settings.vector,
			sp: this.subprograms
		});

		this.list = new Eye.List({
			alg: this.algoritm.alg,
			events: this.resources.events,
			sp: this.subprograms
		});

		this.handlers();
		this.resize();
		this.printUser();
		this.menu();
		this.resources.events.algoritm.add('loading', this.loading.bind(this));
	},
	resize: function () {
		var $ = atom.dom;
		
		$('#controlls').css({position: 'absolute', left: parseFloat(this.app.container.bounds.css('width')) + parseFloat($('body').css('padding-left')) + parseFloat($('#game > div').css('border-right-width').split(' ')[0])*2});
		$('#controlls').css({ height: this.engine.countSize().y });
		$('#log').css({ height: parseFloat($('#controlls').css('height')) - parseFloat($('#menu').css('height')) -4 });
		this.resources.settings.logOpenSize =  parseFloat($('#log').css('height')) + 113;
		this.resources.settings.logSize =  parseFloat($('#log').css('height'));
	},
	menu: function () {
		if (typeof process == 'undefined') {
			var $ = atom.dom;
			
			$('#topMenu').removeClass('hide').css('width', this.engine.countSize().x + parseFloat($('#controlls').css('width')) + 1);
		
			var elems = atom.dom('#topMenu .item').elems.reverse();
			for (var i = 0; i < elems.length; i++) {
				var dom = $(elems[i]);
				dom.css('zIndex', i);
			}
			
			this.resources.events.main.add('debugger', function () {
				atom.dom('#topMenu > .item').toggleClass('deactive');
				atom.dom('#reload, #help').toggleClass('deactive');
			}.bind(this));
			this.resources.events.main.add('editor', function () {
				atom.dom('#topMenu > .item').toggleClass('deactive');
				atom.dom('#reload, #help').toggleClass('deactive');
			}.bind(this));
		} else {
			atom.dom('body').css('padding-left', 0);
			atom.dom('#game > div')
				.css('border-bottom-width', 0)
				.css('border-top-width', 0)
				.css('border-left-width', 0);
			atom.dom('#controlls')
				.css('border-bottom-width', 0)
				.css('border-top-width', 0)
				.css('border-right-width', 0);
			this.resize();
			atom.dom('#controlls').css({position: 'absolute', left: parseFloat(this.app.container.bounds.css('width')) + parseFloat(atom.dom('body').css('padding-left')) + parseFloat(atom.dom('#game > div').css('border-right-width').split(' ')[0])});
			Eye.windowmenu.bind(this)();
		}
	},
	loading: function () {
		var dom = atom.dom('#loading');
		dom.toggleClass('hide');
		
		if (!dom.hasClass('hide')) {
			var container = atom.dom('#game > div');
			dom.css({
				left: (parseFloat(container.css('width')) -parseFloat(dom.css('width')))/2 - parseFloat(atom.dom('body').css('padding-left')) ,
				top: (parseFloat(container.css('height')) - parseFloat(dom.css('height')))/2 - parseFloat(atom.dom('body').css('padding-top'))
			});
		}
	},
	printUser: function () {
		if (this.resources.program.user) {
			if (!this.resources.layerUser) this.resources.layerUser = this.app.createLayer('user');
			this.resources.layerUser.ctx.clearAll();
			this.resources.layerUser.ctx.text({
				text: 'Пользователь: '+ this.resources.program.user,
				color: 'black',
				to: new Rectangle(0,this.engine.countSize().y-25,this.engine.countSize().x-10,25),
				align: 'right',
				size: 11
			});
		}
	},
	handlers: function() {
		var $ = atom.dom;
		var dom;

		$('#move').bind('click', function() {
			if (!$('#move').hasClass('deactive')) {
				if (!this.list.active || (this.list.active && this.list.active.attr('data-path').split('-')[0] != 'sp')) {
					this.algoritm.add(0);
				} else {
					dom = this.list.active;
					while (!dom.attr('data-name')) dom = dom.parent();
					this.subprograms.push(dom.attr('data-name'), 0);
				}
			}
		}.bind(this));

		$('#jump').bind('click', function() {
			if (!$('#jump').hasClass('deactive')) {
				if (!this.list.active || (this.list.active && this.list.active.attr('data-path').split('-')[0] != 'sp')) {
					this.algoritm.add(1);
				} else {
					dom = this.list.active;
					while (!dom.attr('data-name')) dom = dom.parent();
					this.subprograms.push(dom.attr('data-name'), 1);
				}
			}
		}.bind(this));

		$('#rotate').bind('click', function() {
			if (!$('#rotate').hasClass('deactive')) {
				if (!this.list.active || (this.list.active && this.list.active.attr('data-path').split('-')[0] != 'sp')) {
					this.algoritm.add(2);
				} else {
					dom = this.list.active;
					while (!dom.attr('data-name')) dom = dom.parent();
					this.subprograms.push(dom.attr('data-name'), 2);
				}
			}
		}.bind(this));
		
		$('#branch').bind('click', function() {
			if (!$('#branch').hasClass('deactive')) {
				if (!this.list.active || (this.list.active && this.list.active.attr('data-path').split('-')[0] != 'sp')) {
					this.algoritm.add('branch');
				} else {
					dom = this.list.active;
					while (!dom.attr('data-name')) dom = dom.parent();
					this.subprograms.push(dom.attr('data-name'), 'branch');
				}
			}
		}.bind(this));
		
		$('#loop').bind('click', function() {
			new Eye.prompt({
				text: 'Введите количество повторов цикла<br>"0" - пока НЕ стена; "-1" - пока стена:',
				type: 'input',
				buttons: 'ok, cancel',
				callback: function (num) {
					if (!this.list.active || (this.list.active && this.list.active.attr('data-path').split('-')[0] != 'sp')) {
						this.algoritm.add(new Eye.Loop([], parseFloat(num)));
					} else {
						dom = this.list.active;
						while (!dom.attr('data-name')) dom = dom.parent();
						this.subprograms.push(dom.attr('data-name'), new Eye.Loop([], parseFloat(num)));
					}
				}.bind(this)
			});
		}.bind(this));
		
		$('#sp-create').bind('click', function () {
			if (!$('#subprogram').hasClass('deactive')) {
				new Eye.prompt({
					text: 'Введите название новой подпрограммы:',
					type: 'input',
					buttons: 'ok, cancel',
					callback: function (name) {
						this.subprograms.add(name);
					}.bind(this)
				});
			}
		}.bind(this));
		
		$('#sp-call').bind('click', function () {
			if (this.subprograms.list().last !== null) {
				new Eye.prompt({
					text: 'Выберите нужную подпрограмму:',
					type: 'select',
					items: this.subprograms.list(),
					buttons: 'ok, cancel',
					callback: function (name) {
						if (this.list.active && this.list.active.attr('data-path').split('-')[0] == 'sp') this.list.active.first.click();
						this.algoritm.add('sp: '+name);
					}.bind(this)
				});
			}
		}.bind(this));

		$('#debug').bind('click', function() {
			if (!$('#debug').hasClass('deactive')) {
				if (this.algoritm.alg.last !== null) {
					this.loading();
					this.resources.events.main.fire('debugger');
					$('#log').addClass('deactive');
					$('#menu').animate({
						props: {
							opacity: 0
						},
						onComplete: function() {
							$('#menu').css('display', 'none');
							$('#menuDebug').css('display', 'block').animate({
								props: {
									opacity: 1
								}
							});
							$('#log').css('height', this.resources.settings.logOpenSize).removeClass('active');
							this.loading();
						}.bind(this)
					});
				}
			}
		}.bind(this));

		$('#edit').bind('click', function() {
			this.resources.events.main.fire('editor');
			$('#log').removeClass('deactive');
			if (!$('#edit').hasClass('deactive')) $('#menuDebug').animate({
				props: {
					opacity: 0
				},
				onComplete: function() {
					$('#menuDebug').css('display', 'none');
					$('#menu').css('display', 'block').animate({
						props: {
							opacity: 1
						}
					});
					$('#log').css('height', this.resources.settings.logSize).addClass('active');
					$('#log .current').removeClass('current');
					atom.dom('#log .error').removeClass('error');
					this.restart();
				}.bind(this)
			});
		}.bind(this));

		$('#start').bind('click', function() {
			this.restart();
			this.go();
			$('#edit').addClass('deactive');
			$('#start, #force').css('display', 'none');
			$('#stop').css('display', 'block');
		}.bind(this));

		$('#stop').bind('click', function() {
			this.player.animatable.stop(true);
			this.tail.animatable.stop(true);
			$('#start, #force').css('display', 'block');
			$('#stop').css('display', 'none');
			$('#edit').removeClass('deactive');
			this.setSpeed(0);
		}.bind(this));
		
		$('#force').bind('click', function () {
			this.restart();
			this.setSpeed(10);
			this.go();
			$('#edit').addClass('deactive');
			$('#start, #force').css('display', 'none');
			$('#stop').css('display', 'block');
		}.bind(this));

		this.resources.events.player.add('completeChain', function () { $('#stop').first.click(); });
		
		$('#load').bind('click', function () {
			if (!$('#load').hasClass('deactive')) {
				new Eye.prompt({
					text: 'Выберете загрузочный файл:',
					buttons: 'ok, cancel',
					type: 'file',
					callback: function (str) {
						this.load(str);
					}.bind(this)
				});
			}
		}.bind(this));
		
		$('#save').bind('click', function () {
			if (!$('#save').hasClass('deactive')) {
				this.save();
			}
		}.bind(this));
		
		$('#reload').bind('click', function () { location.reload(); });
		
		$('#resize').bind('click', function () {
			new Eye.prompt({
				text: 'Введите новые размеры. Программа будет перезагружена! Пример: 16*8',
				buttons: 'ok, cancel',
				type: 'input',
				callback: function (v) {
					location.hash = v;
					location.reload();
				}.bind(this)
			});
		});
	},
	restart: function() {
		this.resources.settings.cell = atom.clone(this._settings.cell);
		this.resources.settings.vector = atom.clone(this._settings.vector);
		
		this.player.restart();
		this.tail.restart();
		
		atom.dom('#log .item.current').removeClass('current');
	},
	go: function() {
		this.player.go(this.algoritm.parsed);
	},
	createEngine: function() {
		return new TileEngine({
			size: this.resources.settings.size,
			cellSize: this.resources.settings.cellSize,
			cellMargin: new Size(1, 1),
			defaultValue: 0
		}).setMethod({
			0: '#c9c9c9'
		});
	},
	get nextCell() {
		var neighbours = new Point(this.resources.settings.cell).getNeighbours();
		neighbours = [neighbours[2], neighbours[0], neighbours[1], neighbours[3]];
		return this.engine.getCellByIndex(neighbours[this.resources.settings.vector]);
	},
	save: function () {
		if (!this.resources.program.user) {
			new Eye.prompt({
				text: 'Введите ваше имя:',
				buttons: 'ok, cancel',
				type: 'input',
				callback: function (user) {
					this.resources.program.user = user;
					this.printUser();
					var file = Base64.encode(Base64.encode(JSON.stringify({
						user: user,
						algoritm: this.algoritm.alg
					})));
					var a = atom.dom.create('a', { href: "data:application/eye;base64," + file }).css('position', 'absolute').text('download').appendTo('body');
					a.attr('download', 'eyeSave');
					a.first.click();
					a.destroy();
				}.bind(this)
			});
		} else {
			var file = Base64.encode(Base64.encode(JSON.stringify({
				user: this.resources.program.user,
				algoritm: this.algoritm.alg
			})));
			var a = atom.dom.create('a', { href: "data:application/eye;base64," + file }).css('position', 'absolute').text('download').appendTo('body');
			a.attr('download', 'eyeSave');
			a.first.click();
			a.destroy();
		}
	},
	load: function (str) {
		this.algoritm.alg.splice(0, this.algoritm.alg.length);
		this.list.parse();
		var elem = JSON.parse(Base64.decode(str));
		this.resources.program.user = elem.user;
		this.printUser();
		elem.algoritm.forEach(function (v) {
			this.algoritm.add(v);
		}.bind(this));
	},
	setSpeed: function (num) {
		var time = this.player.time;
		this.player.time = num ? time/(num/2) : 500;
		this.tail.time = num ? time/(num/2) : 500;
	}
});