atom.declare('Eye.Controller', {
	initialize: function () {
		
		this.initLoad();
		this.initEvents();
		
		this.canvas = new Eye.Canvas(this);
		this.player = new Eye.Player(this.canvas.createLayer('player'), {
			controller: this
		});
		this.algoritm = new Eye.Algoritm(this);
		this.events.fire('requireResize');
	},
	resize: function () {
		atom.dom('#log').css('height', parseFloat(atom.dom('.game').css('height')) - parseFloat(atom.dom('.rightMenu').css('height')) -1);
	},
	initLoad: function () {
		this.settings = {
			sizeEngine: new Size(16,8),
			borders: 0,
			boundSteps: -1,
			boundJumps: -1,
			boundLoops: -1,
			boundBranches: -1,
			boundSP: -1,
			startCell: new Point(0, 0),
			vector: 0
		};
		
		var load = location.hash.replace(/#/, '');
		
		if (load) {
			load = JSON.parse(Base64.decode(load));
			if (typeof load == 'object') for (var key in load) this.settings[key] = load[key];
		}
		
		window.onhashchange = function () {
			location.reload();
		};
	},
	initEvents: function () {
		this.events = new atom.Events();
		this.events.add('requireResize', function () {
			this.resize();
		}.bind(this));
	}
});