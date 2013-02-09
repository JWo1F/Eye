atom.declare('Eye.Player', App.Element, {
	configure: function () {
		var res = this.settings.get('res');
		
		this.position = atom.clone(res.cell);
		this.vector = res.vector;
		
		var cCell = this.getCurrentCell();
		this.buffer = this.createBuffer(new Size(cCell.rectangle.width, cCell.rectangle.height), true);
		
		this.shape = new Rectangle([cCell.rectangle.x, cCell.rectangle.y], res.cellSize);
		this.angle = this.shape.angle = res.vector*90;
		
		this.animatable = new atom.Animatable(this);
		this.animate = this.animatable.animate;
		
		this.events = this.settings.get('events');
	},
	move: function (point, tail) {
		point = new Point(point);
		this.animate({
			props: {
				'shape.x': point.x,
				'shape.y': point.y
			},
			fn: 'quad',
			onTick: this.redraw,
			onStart: function () { this.events.player.fire('complete', [point, tail||false]); }.bind(this),
			onComplete: function () {
				if (this.animatable.animations.length <= 1) this.events.player.fire('completeChain');
			}.bind(this)
		});
	},
	rotate: function () {
		var angle = this.angle - 90;
		this.angle = angle;
		
		this.animate({
			props: {
				'shape.angle': angle.degree()
			},
			fn: 'quad',
			onTick: this.redraw,
			onStart: function () { this.events.player.fire('complete'); }.bind(this),
			onComplete: function () {
				if (this.animatable.animations.length <= 1) this.events.player.fire('completeChain');
			}.bind(this)
		});
	},
	createBuffer: function(size) {
		var buffer = LibCanvas.buffer(size.width + 10, size.height + 10, true);
		var circle = new Circle((size.width + 10) / 2, (size.height + 10) / 2, size.width / 2 - 1);
		buffer.ctx.fill(circle, '#088fd7').save().clip(circle).fill(circle.clone().move([35, 0]), '#ff7800').stroke(circle.clone().move([35, 0]), 'rgba(0,0,0,0.5)').restore().stroke(circle);
		return buffer;
	},
	restart: function () {
		var res = this.settings.get('res'),
			cCell = this.getCurrentCell();
			
		this.animatable.stop(true);
		this.shape = new Rectangle([cCell.rectangle.x, cCell.rectangle.y], res.cellSize);
		this.position = atom.clone(res.cell);
		this.vector = res.vector;
		this.angle = this.shape.angle = this.vector*90;
		this.redraw();
	},
	renderTo: function (ctx) {
		ctx.drawImage({
			image: this.buffer,
			center: this.shape.center,
			angle: this.shape.angle
		});
	},
	get currentBoundingShape () {
		return new Rectangle({
			center: this.shape.center,
			size: new Size(this.buffer.width, this.buffer.height)
		});
	},
	getCurrentCell: function () {
		return this.settings.get('engine').getCellByIndex(this.position);
	}
});