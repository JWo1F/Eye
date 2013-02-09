atom.declare('Eye.Controller', {
	resources: {},
	initialize: function() {
		this.resources.program = {
			user: 'WolF' || prompt('Введите Ваш логин:')
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
			player: new atom.Events()
		};
		this.resources.events.main = new atom.Events();
		atom.dom(this.start.bind(this));
	},
	start: function() {
		var res = this.resources;

		this.engine = this.createEngine();

		this.app = new App({
			size: this.engine.countSize(),
			appendTo: '#game'
		});

		this.engineElement = TileEngine.Element.app(this.app, this.engine);

		var tailLayer = this.app.createLayer({name: 'tail', intersection: 'manual'});

		this.player = new Eye.Player(this.app.createLayer('player'), {
			res: this.resources.settings,
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
	},
	resize: function () {
		var $ = atom.dom;
		
		$('#controlls').css({ height: this.engine.countSize().y });
		$('#log').css({ height: parseFloat($('#controlls').css('height')) - parseFloat($('#menu').css('height')) -4 });
		this.resources.settings.logOpenSize =  parseFloat($('#log').css('height')) + 140;
		this.resources.settings.logSize =  parseFloat($('#log').css('height'));
		$('#topMenu').css('width', this.engine.countSize().x + parseFloat($('#controlls').css('width')) + 1);
	},
	printUser: function () {
		if (!this.resources.layerUser) this.resources.layerUser = this.app.createLayer('user');
		this.resources.layerUser.ctx.clearAll();
		this.resources.layerUser.ctx.text({
			text: 'Пользователь: '+ this.resources.program.user,
			color: 'black',
			to: new Rectangle(0,this.engine.countSize().y-25,this.engine.countSize().x-10,25),
			align: 'right',
			size: 11
		});
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

		$('#debug').bind('click', function() {
			this.algoritm.parse();
			this.list.unselect();
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
				}.bind(this)
			});
		}.bind(this));

		$('#edit').bind('click', function() {
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
			this.restart();
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
		this.algoritm.parsed.forEach(function(v, i) {
			if (v == '0' || v == '1') {
				var next = this.nextCell;
				this.resources.settings.cell = next.point;
				this.player.move([next.rectangle.x, next.rectangle.y], !v);
			}
			else if (v == '2') {
				this.player.rotate();
				this.resources.settings.vector = (this.resources.settings.vector == 3) ? 0 : this.resources.settings.vector + 1;
			} else if (v == 'e~') {
				this.resources.events.player.add('completeChain', function () {
					this.list.nextPosition();
					console.log('Ошибка '+this.algoritm.error);
					atom.dom('#log .current').addClass('error');
				}.bind(this));
			}
		}.bind(this));
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
		return Base64.encode(JSON.stringify({
			user: this.resources.program.user,
			algoritm: this.algoritm.alg
		}));
	}
});