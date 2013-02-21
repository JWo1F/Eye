atom.declare('Eye.Controller', {
	resources: {},
	initialize: function() {
		this.resources.program = {
			user: false
		};
				
		this.resources.settings = {
			size: new Size(16, 8),
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
			main: new atom.Events()
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

		this.algoritm = new Eye.Algoritm({
			engine: this.engine,
			events: this.resources.events,
			cell: this.resources.settings.cell,
			vector: this.resources.settings.vector
		});

		this.list = new Eye.List({
			alg: this.algoritm.alg,
			events: this.resources.events
		});

		this.handlers();
		this.resize();
		this.printUser();
		this.resources.events.algoritm.add('loading', this.loading.bind(this));
	},
	resize: function () {
		var $ = atom.dom;
		
		$('#controlls').css({position: 'absolute', left: parseFloat(this.app.container.bounds.css('width')) + parseFloat($('body').css('padding-left')) + parseFloat($('#game > div').css('border-left-width').split(' ')[0])*2});
		$('#controlls').css({ height: this.engine.countSize().y });
		$('#log').css({ height: parseFloat($('#controlls').css('height')) - parseFloat($('#menu').css('height')) -4 });
		this.resources.settings.logOpenSize =  parseFloat($('#log').css('height')) + 140;
		this.resources.settings.logSize =  parseFloat($('#log').css('height'));
		$('#topMenu').css('width', this.engine.countSize().x + parseFloat($('#controlls').css('width')) + 1);
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

		$('#move').bind('click', function() {
			this.algoritm.add(0);
		}.bind(this));

		$('#jump').bind('click', function() {
			this.algoritm.add(1);
		}.bind(this));

		$('#rotate').bind('click', function() {
			this.algoritm.add(2);
		}.bind(this));
		
		$('#branch').bind('click', function() {
			this.algoritm.add('branch');
		}.bind(this));
		
		$('#loop').bind('click', function() {
			this.algoritm.add('loop');
		}.bind(this));

		$('#debug').bind('click', function() {
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
			$('#start').css('display', 'none');
			$('#stop').css('display', 'block');
		}.bind(this));

		$('#stop').bind('click', function() {
			this.player.animatable.stop(true);
			this.tail.animatable.stop(true);
			$('#start').css('display', 'block');
			$('#stop').css('display', 'none');
			$('#edit').removeClass('deactive');
		}.bind(this));

		this.resources.events.player.add('completeChain', function() {
			$('#edit').removeClass('deactive');
			$('#start').css('display', 'block');
			$('#stop').css('display', 'none');
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
	export: function () {
		new Eye.prompt('Введите ваше имя:', function (user) {
			this.resources.program.user = user;
			this.printUser();
			var zip = new JSZip();
			zip.file("code", Base64.encode(JSON.stringify({
				user: user,
				algoritm: this.algoritm.alg
			})));
			var a = atom.dom.create('a', { href: "data:application/zip;base64," + zip.generate() }).css('position', 'absolute').text('download').appendTo('body');
			//a.first.click();
			//a.destroy();
		}.bind(this));
	},
	import: function (str) {
		var elem = JSON.parse(Base64.decode(str));
		this.resources.program.user = elem.user;
		this.printUser();
		elem.algoritm.forEach(function (v) {
			this.algoritm.add(v);
		}.bind(this));
	}
});