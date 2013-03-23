atom.declare('Eye.Tail', App.Element, {
	configure: function () {
		this.controller = this.settings.get('controller');
		this.size = this.controller.canvas.engine.cells[0].rectangle.size.clone();
		
		this.currentLine = new Line(this.size.x / 2, this.size.y / 2, this.size.x / 2, this.size.y / 2);
		this.lines = [];
		
		this.update = false;
		this.animatable = new atom.Animatable(this);
		this.animate = this.animatable.animate;
		
		this.controller.events.add('playerActionStart', this.startMove.bind(this));
		this.controller.events.add('playerAction', this.completeMove.bind(this));
		window.addEventListener('focus', function (e) {
			this.update = true;
			this.redraw();
			setTimeout(function () {
				this.update = true;
				this.redraw();
			}.bind(this), 50);
			e.stopPropagation();
		}.bind(this));
	},
	renderTo: function (ctx) {
		if (this.update) {
			this.lines.forEach(function (v) {
				ctx
					.save()
					.beginPath()
					.moveTo(v.from)
					.lineTo(v.to)
					.set({ lineWidth: 15, lineCap: 'round' })
					.stroke('#00669c')
					.restore();
			}.bind(this));
			this.update = false;
		}
		
		ctx
			.save()
			.beginPath()
			.moveTo(this.currentLine.from)
			.lineTo(this.currentLine.to)
			.set({ lineWidth: 15, lineCap: 'round' })
			.stroke('#00669c')
			.restore();
	},
	startMove: function (x, y, type) {
		x += this.size.x / 2;
		y += this.size.y / 2
		
		if (type != 'jump') {
			this.currentLine.from.moveTo(this.currentLine.to);
			this.animate({
				props: {
					'currentLine.to.x': x,
					'currentLine.to.y': y
				},
				fn: 'quad',
				time: 500 / this.controller.speed,
				onTick: this.redraw
			});
		} else {
			this.currentLine.to.moveTo([x, y]);
			this.currentLine.from.moveTo([x, y]);
		}
	},
	completeMove: function (type) {
		if (type != 'jump') this.lines.push(this.currentLine.clone());
	},
	get currentBoundingShape () {
		return new Rectangle(0,0,0,0);
	}
});