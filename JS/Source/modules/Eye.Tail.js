atom.declare('Eye.Tail', App.Element, {
	configure: function() {
		this.shape = new Line(25, 25, 25, 25);
		this.animatable = new atom.Animatable(this);
		this.animate = this.animatable.animate;
		this.settings.get('events').player.add('complete', function (to, tail) {
			if (tail) this.add(to);
		}.bind(this));
	},
	renderTo: function(ctx) {
		ctx.fill(new Circle( this.shape.to, 5 ));
	},
	add: function(to) {
		this.animate({
			props: {
				'shape.to.x': to.x+25,
				'shape.to.y': to.y+25
			},
			onComplete: function() {
				this.shape.from = to.clone();
			}.bind(this),
			onTick: this.redraw
		});
	},
	get currentBoundingShape() {
		return new Rectangle(0, 0, 0, 0);
	}
});