atom.declare('Eye.Controller', {
	initialize: function () {
		
		this.initLoad();
		this.createApp();
		this.resize();
	},
	resize: function () {
		atom.dom('#log').css('height', parseFloat(atom.dom('.game').css('height')) - parseFloat(atom.dom('.rightMenu').css('height')) -1)
	},
	createApp: function () {
		this.engine = new TileEngine({
			size: this.settings.sizeEngine,
			cellMargin: new Size(1,1),
			cellSize: new Size(50,50),
			defaultValue: 'none'
		}).setMethod({
			none: '#c9c9c9'
		});
		
		this.app = new App({
			size: this.engine.countSize(),
			appendTo: '.game'
		});
		
		this.element = new TileEngine.Element(this.app.createLayer('element'), { engine: this.engine });
	},
	initLoad: function () {
		this.settings = {
			sizeEngine: new Size(16,8),
			walls: false,
			boundSteps: -1,
			boundJumps: -1,
			boundLoops: -1,
			boundBranches: -1,
			boundSP: -1
		};
		
		var load = location.hash.replace(/#/, '');
		
		if (load) {
			load = Base64.decode(JSON.parse(load));
			if (typeof load == 'object') for (var key in load) this.settings[key] = load[key];
		}
	}
});