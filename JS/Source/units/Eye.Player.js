atom.declare('Eye.Player', App.Element, {
	configure: function () {
		this.controller = this.settings.get('controller');
		this.engine = this.controller.canvas.engine;
		this.position = this.engine.getCellByIndex(this.controller.settings.startCell).rectangle.clone();
		this.shape = new LibCanvas.buffer(this.position.width, this.position.height, true);
		this.animatable = new atom.Animatable(this);
		this.animate = this.animatable.animate;
		this.angle = - this.controller.settings.vector * 90;
		
		this.createPlayer();
	},
	createPlayer: function () {
		var circle = new Circle(this.shape.ctx.rectangle.center, this.shape.ctx.rectangle.width/2 - 1);
		
		this.shape.ctx
			.fill(circle, '#3291da')
			.save()
			.clip(circle)
			.fill(circle.clone().move([circle.radius*1.5, 0]), '#ff6900')
			.stroke(circle.clone().move([circle.radius*1.5, 0]))
			.restore()
			.stroke(circle);
	},
	get currentBoundingShape () {
		return new Rectangle(this.position.x-5, this.position.y-5, this.position.width+10, this.position.height+10);
	},
	move: function (type) {
		if (this.isNextCell()) {
			var x = this.nextCell.rectangle.x;
			var y = this.nextCell.rectangle.y;
			
			this.animate({
				props: {
					'position.x': x,
					'position.y': y
				},
				fn: 'quad',
				onStart: function () {
					this.controller.events.fire('playerActionStart', [x, y, type]);
				}.bind(this),
				onComplete: function () {
					this.controller.events.fire('playerAction', [type]);
				}.bind(this),
				onTick: this.redraw,
				time: 500 / this.controller.settings.speed
			});
		} else {
			this.controller.events.fire('playerError');
		}
	},
	rotate: function () {
		this.animate({
			props: {
				'angle': this.angle-90
			},
			fn: 'quad',
			onComplete: function () {
				this.controller.events.fire('playerAction');
			}.bind(this),
			onTick: this.redraw,
			time: 500 / this.controller.settings.speed
		});
	},
	get vector () {
		return  - this.angle/90 % 4;
	},
	get nextCell () {
		var current = this.engine.getCellByPoint(this.position.center).point;
		var neighbours = current.getNeighbours();
		neighbours.unshift(neighbours.splice(2,1)[0]);
		return this.engine.getCellByIndex(neighbours[this.vector]);
	},
	isNextCell: function () {
		return (this.nextCell && this.nextCell.value != 'border') ? true : false;
	},
	renderTo: function (ctx) {
		ctx
			.drawImage({
				image: this.shape,
				center: this.position.center,
				angle: this.angle.degree()
			});
	}
});