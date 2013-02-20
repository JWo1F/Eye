atom.declare('Eye.Tail', App.Element, {
	configure: function() {
		this.cell = this.settings.get('cell');
		this.shape = new Line(this.cell.x+25, this.cell.y+25, this.cell.x+25, this.cell.y+25);
		this.shapes = [];
		this.animatable = new atom.Animatable(this);
		this.animate = this.animatable.animate;
		this.settings.get('events').player.add('complete', this.add.bind(this));
	},
	renderTo: function(ctx) {
		this.shapes.forEach(function (v) {
			ctx
				.beginPath()
				.moveTo(v.from)
				.lineTo(v.to)
				.set({ lineWidth: 14, lineCap: 'round', strokeStyle: '#00669c' })
				.stroke();
		}.bind(this));
		
		ctx
			.beginPath()
			.moveTo(this.shape.from)
			.lineTo(this.shape.to)
			.set({ lineWidth: 14, lineCap: 'round', strokeStyle: '#00669c' })
			.stroke();
	},
	add: function(to, tail) {
		if (tail) {
			this.shape = new Line(this.shape.to.clone(), this.shape.to.clone());
			this.animate({
				props: {
					'shape.to.x': to.x+25,
					'shape.to.y': to.y+25
				},
				onTick: function () {
					this.redraw();
				}.bind(this),
				onComplete: function () {
					this.shapes.push(this.shape.clone());
				}.bind(this)
			});
		} else if (to) {
			this.shape = new Line(to.clone().move([25,25]), to.clone().move([25,25]));
		}
	},
	restart: function () {
		this.animatable.stop(true);
		this.shape = new Line(this.cell.x+25, this.cell.y+25, this.cell.x+25, this.cell.y+25);
		this.shapes = [];
		this.layer.ctx.clearAll();
	},
	get currentBoundingShape() {
		return new Rectangle(0, 0, 0, 0);
	}
});