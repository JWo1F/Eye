atom.declare('Eye.Canvas', {
	initialize: function(controller) {
		this.controller = controller;
		
		this.createApp();
		this.initBorders();
	},
	createApp: function() {
		var settings = this.controller.settings;
		
		this.engine = new TileEngine({
			size: new Size(settings.sizeEngine),
			cellMargin: new Size(1, 1),
			cellSize: new Size(50, 50),
			defaultValue: 'none'
		}).setMethod({
			none: '#c9c9c9',
			border: function(ctx, cell) {
				var rectangle = cell.rectangle;
				var size = rectangle.width;
				var x = rectangle.x;
				var y = rectangle.y;

				ctx.fill(rectangle, '#ffc600');
				for (var i=-5; i < 5; i++) {
					ctx
						.save()
						.set('lineWidth', 5)
						.clip(rectangle)
						.stroke(new Line(x - size, y - size + i*20, x + size*2, y + size*2 + i*14))
						.restore();
				}
			},
			path: '#ceb5b5'
		});

		this.app = new App({
			size: this.engine.countSize(),
			appendTo: '.game'
		});

		this.element = new TileEngine.Element(this.app.createLayer('element'), {
			engine: this.engine
		});
	},
	initBorders: function () {
		if (this.controller.settings.borders == -1) {
			var max = Math.floor(this.engine.width*this.engine.height/100*60);
			var count = Math.floor(Math.random()*max);
			for (var i=count; i--;) {
				var x = Math.floor(Math.random()*this.engine.width);
				var y = Math.floor(Math.random()*this.engine.height);
				var cell = this.engine.getCellByIndex([x, y]);
				if (cell.value == 'none') {
					this.engine.getCellByIndex([x, y]).value = 'border';
				}
			}
		} else if (atom.typeOf(this.controller.settings.borders) == 'array') {
			this.engine.cells.forEach(function (v, i) {
				if (this.controller.settings.borders[i]) v.value = this.controller.settings.borders[i];
			}.bind(this));
		}
	},
	createLayer: function (name) {
		return this.app.createLayer(name);
	}
});