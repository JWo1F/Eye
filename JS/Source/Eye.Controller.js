atom.declare('Eye.Controller', {
	res: {
		player: {
			loc: [0, 0],
			vector: 0
		},
		boundActions: 900,
		editing: true,
		starting: false
	},
	initialize: function() {
		this.events = new atom.Events();
		this.engine = this.initEngine();
		this.app = this.initApp();
		this.engineElement = TileEngine.Element.app(this.app, this.engine);
		this.player = new Eye.Player(this.app.createLayer('player'), {
			wrapper: this.engine.getCellByIndex(this.res.player.loc).rectangle.clone(),
			events: this.events
		});
		this.algoritm = new Eye.Algoritm({
			engine: this.engine,
			start: this.res.player.loc.clone(),
			bound: this.res.boundActions,
			vector: this.res.player.vector,
			events: this.events
		});
		this.list = new Eye.List({
			algoritm: this.algoritm.algoritm,
			events: this.events
		});
		this.initHandlers();
	},
	initEngine: function() {
		return new TileEngine({
			size: new Size(16, 8),
			cellSize: new Size(50, 50),
			cellMargin: new Size(1, 1),
			defaultValue: 0
		}).setMethod({
			0: '#c9c9c9',
			1: function (ctx, cell) {
				ctx.fill(cell.rectangle, 'white');
				var width = cell.rectangle.width;
				for (var i=1; i < width; i++) if (i/4 == Math.floor(i/4)) ctx.stroke(new Line(cell.rectangle.x+i-0.5,cell.rectangle.y, cell.rectangle.x+i-0.5, cell.rectangle.y+width), 'rgba(0,0,0,0.05)');
				for (i=1; i < width; i++) if (i/4 == Math.floor(i/4)) ctx.stroke(new Line(cell.rectangle.x,cell.rectangle.y+i-0.5, cell.rectangle.x+width, cell.rectangle.y+i-0.5), 'rgba(0,0,0,0.05)');
			}
		});
	},
	initApp: function() {
		return new App({
			size: this.engine.countSize(),
			appendTo: '#game'
		});
	},
	initHandlers: function() {
		var mouse = new Mouse(this.app.container.bounds);
		var handler = new App.MouseHandler({app: this.app, mouse: mouse});
		this.app.resources.set({mouse: mouse, mouseHandler: handler});
		
		handler.subscribe(this.engineElement);
		new TileEngine.Mouse( this.engineElement, mouse ).events.add({
			click: function (cell) {
				if (this.res.editing) cell.value = (cell.value == 1) ? 0 : 1;
			}.bind(this)
		});
		
		atom.dom('#move').bind('click', function() {
			this.algoritm.add(0);
			this.events.fire('addEvent');
		}.bind(this));
		atom.dom('#jump').bind('click', function() {
			this.algoritm.add(1);
			this.events.fire('addEvent');
		}.bind(this));
		atom.dom('#rotate').bind('click', function() {
			this.algoritm.add(2);
			this.events.fire('addEvent');
		}.bind(this));
		atom.dom('#debug').bind('click', function() {
			this.algoritm.parse();
			atom.dom('#menu').animate({ props: { opacity: 0 }, onComplete: function () {
				atom.dom('#menu').css('display', 'none');
				atom.dom('#menuDebug').css('display', 'block');
				atom.dom('#menuDebug').animate({ props: { opacity: 1 } });
				atom.dom('#log').css('height', 320);
				atom.dom('#log').toggleClass('active');
				this.res.editing = false;
			}.bind(this)});
		}.bind(this));
		atom.dom('#edit').bind('click', function() {
			atom.dom('#menuDebug').animate({ props: { opacity: 0 }, onComplete: function () {
				atom.dom('#menuDebug').css('display', 'none');
				atom.dom('#menu').css('display', 'block');
				atom.dom('#menu').animate({ props: { opacity: 1 } });
				atom.dom('#log').css('height', 235);
				atom.dom('#log').toggleClass('active');
				this.res.editing = true;
			}.bind(this)});
		}.bind(this));
		atom.dom('#start').bind('click', function () {
			this.start();
		}.bind(this));
	},
	start: function() {
		if (!this.res.starting && typeof this.algoritm.alg[0] != 'undefined') {
			this.res.starting = true;
			var actions = this.algoritm.parsed;
			this.list.start();
	
			actions.forEach(function(v, i) {
				var last = (i === actions.length - 1) ? this.algoritm.error : false;
				var neighbours = new Point(this.res.player.loc).getNeighbours();
				neighbours = [neighbours[2], neighbours[0], neighbours[1], neighbours[3]];
				var cell = this.engine.getCellByIndex(neighbours[this.res.player.vector]);
	
				if (v === 0) {
					if (cell) {
						this.res.player.loc = neighbours[this.res.player.vector];
						this.player.move(cell.rectangle, last);
					}
					else {
						this.error = 0;
						return false;
					}
				}
				else if (v == 1) {
					if (cell) {
						this.res.player.loc = neighbours[this.res.player.vector];
						this.player.move(cell.rectangle, last);
					}
					else {
						this.error = 0;
						return false;
					}
				}
				else if (v == 2) {
					this.player.rotate();
					this.res.player.vector = (this.res.player.vector == 3) ? 0 : this.res.player.vector + 1;
				}
			}.bind(this));
		}
	}
});