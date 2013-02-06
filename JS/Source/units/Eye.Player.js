atom.declare('Eye.Player', App.Element, {
	configure: function() {
		this.shape = this.settings.get('wrapper');
		this.angle = this.shape.angle = 0;
		this.buffer = this.createBuffer(this.shape);
		this.animatable = new atom.Animatable(this);
		this.animate = this.animatable.animate;
		this.bound = new Rectangle(this.shape.x, this.shape.y, this.shape.width * 2, this.shape.width * 2);
		this.res = this.settings.get('res');
	},
	createBuffer: function(rect) {
		var buffer = LibCanvas.buffer(rect.width + 10, rect.height + 10, true);
		var circle = new Circle((rect.width + 10) / 2, (rect.height + 10) / 2, rect.width / 2 - 1);
		buffer.ctx.fill(circle, '#088fd7').save().clip(circle).fill(circle.clone().move([35, 0]), '#ff7800').stroke(circle.clone().move([35, 0]), 'rgba(0,0,0,0.5)').restore().stroke(circle);
		return buffer;
	},
	renderTo: function(ctx) {
		ctx.drawImage({
			image: this.buffer,
			center: this.shape.center,
			angle: this.shape.angle.degree()
		});
	},
	move: function(point, error) {
		this.animate({
			props: {
				'shape.x': point.x,
				'shape.y': point.y
			},
			onTick: this.redraw,
			onComplete: function() {
				if (error === 0) alert('Стена');
				this.settings.get('events').fire('playerAction');
			}.bind(this)
		});
	},
	jump: function(point, error) {
		this.animate({
			props: {
				'shape.x': point.x,
				'shape.y': point.y
			},
			onTick: this.redraw,
			onComplete: function() {
				if (error === 0) alert('Стена');
				this.settings.get('events').fire('playerAction');
			}.bind(this)
		});
	},
	rotate: function() {
		this.angle = this.angle - 90;
		this.animate({
			props: {
				'shape.angle': this.angle
			},
			onTick: this.redraw,
			onComplete: function() {
				this.settings.get('events').fire('playerAction');
			}.bind(this)
		});
	},
	getBoundingRectangle: function() {
		var delta = this.bound.center.diff(this.shape.center);
		this.bound.move(delta);
		return this.bound;
	}
});