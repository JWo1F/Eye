atom.declare('Eye.Player', App.Element, {
	configure: function () {
		var res = this.res = this.settings.get('res');
		
		this.position = atom.clone(res.settings.cell);
		this.vector = res.settings.vector;
		
		var cCell = this.getCurrentCell();
		this.buffer = this.createBuffer(new Size(cCell.rectangle.width, cCell.rectangle.height), true);
		
		this.shape = new Rectangle([cCell.rectangle.x, cCell.rectangle.y], res.settings.cellSize);
		this.angle = this.shape.angle = res.settings.vector*90;
		
		this.animatable = new atom.Animatable(this);
		this.animate = this.animatable.animate;
		
		this.time = 500;
		
		this.events = this.settings.get('events');
		this.engine = this.settings.get('engine');
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
			onComplete: this.onComplete.bind(this),
			time: this.time
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
			onComplete: this.onComplete.bind(this),
			time: this.time
		});
	},
	createBuffer: function(size) {
		var buffer = LibCanvas.buffer(size.width + 10, size.height + 10, true);
		var circle = new Circle((size.width + 10) / 2, (size.height + 10) / 2, size.width / 2 - 1);
		buffer.ctx.fill(circle, '#088fd7').save().clip(circle).fill(circle.clone().move([35, 0]), '#ff7800').stroke(circle.clone().move([35, 0]), 'rgba(0,0,0,0.5)').restore().stroke(circle);
		return buffer;
	},
	parse: function (num) {
		if (num == parseFloat(num)) num = parseFloat(num);
		
		if (num === 0 || num === 1) {
			var next = this.nextCell;
			this.position = next.point;
			this.move([next.rectangle.x, next.rectangle.y], !num);
		}
		else if (num === 2) {
			this.rotate();
			this.vector = (this.vector == 3) ? 0 : this.vector + 1;
		} else if (num === 'e~') {
			this.res.events.main.fire('error');
			//this.parse(this.alg.shift());
		} else if (num == 'w~') {
			this.res.events.main.fire('enterWall');
			this.parse(this.alg.shift());
		} else if (num == 's~') {
			this.res.events.main.fire('enterSpace');
			this.parse(this.alg.shift());
		} else if (num == 'q~') {
			this.res.events.main.fire('leaveBlock');
			this.parse(this.alg.shift());
		} else if (num.match(/sp\(.+\)~/)) {
			this.res.events.main.fire('enterSub', [num]);
			this.parse(this.alg.shift());
		} else if(num == 'l~') {
			this.res.events.main.fire('enterLoop');
			this.parse(this.alg.shift());
		}
	},
	onComplete: function () {
		var num = this.alg.shift();
		if (typeof num != 'undefined') {
			this.parse(num);
		} else {
			this.events.player.fire('completeChain');
		}
	},
	go: function (alg) {
		this.alg = alg;
		this.parse(this.alg.shift());
	},
	restart: function () {
		var res = this.res,
			cCell = this.engine.getCellByIndex(this.res.settings.cell).rectangle.clone();
			
		this.animatable.stop(true);
		this.shape = new Rectangle([cCell.x, cCell.y], res.settings.cellSize);
		this.position = atom.clone(res.settings.cell);
		this.vector = res.settings.vector;
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
	},
	get nextCell() {
		var neighbours = new Point(this.position).getNeighbours();
		neighbours = [neighbours[2], neighbours[0], neighbours[1], neighbours[3]];
		return this.engine.getCellByIndex(neighbours[this.vector]);
	},
});