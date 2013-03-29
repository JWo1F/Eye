atom.declare('Eye.Controller', {
	initialize: function () {
		
		this.initLoad();
		this.initEvents();
		
		this.playing = false;
		
		this.canvas = new Eye.Canvas(this);
		this.tail = new Eye.Tail(this.canvas.createLayer({ name: 'tail', intersection: 'manual' }), {
			controller: this
		});
		this.player = new Eye.Player(this.canvas.createLayer('player'), {
			controller: this
		});
		this.algoritm = new Eye.Algoritm(this);
		this.subprograms = new Eye.Subprograms(this);
		this.list = new Eye.List(this);
		
		this.events.fire('requireResize');
	},
	resize: function () {
		atom.dom('#log').css('height', parseFloat(atom.dom('.game').css('height')) - parseFloat(atom.dom('.menu').css('height')) -2);
	},
	initLoad: function () {
		this.settings = {
			sizeEngine: new Size(16,8),
			borders: 0,
			boundSteps: -1,
			boundJumps: -1,
			boundRotates: -1,
			boundLoops: -1,
			boundBranches: -1,
			boundSP: -1,
			startCell: new Point(0, 0),
			vector: 0,
			speed: 1
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
		this.events.add(['actionAdd', 'actionRemove'], function (type) {
			if (!type && this.algoritm.alg == false) {
				atom.dom('#debug').addClass('disabled');
			} else {
				atom.dom('#debug').removeClass('disabled');
			}
		}.bind(this));
		
		if (this.settings.boundSteps === 0) atom.dom('#step').addClass('disabled');
		if (this.settings.boundJumps === 0) atom.dom('#jump').addClass('disabled');
		if (this.settings.boundRotates === 0) atom.dom('#rotate').addClass('disabled');
		if (this.settings.boundLoops === 0) atom.dom('#loop').addClass('disabled');
		if (this.settings.boundBranches === 0) atom.dom('#branch').addClass('disabled');
		if (this.settings.boundSP === 0) atom.dom('#callSP').addClass('disabled');
		
		atom.dom('#step').bind('click', function () {
			if (!atom.dom('#step').hasClass('disabled')) this.events.fire('actionAdd', ['move']);
			if (--this.settings.boundSteps === 0) atom.dom('#step').addClass('disabled');
		}.bind(this));
		atom.dom('#jump').bind('click', function () {
			if (!atom.dom('#jump').hasClass('disabled')) this.events.fire('actionAdd', ['jump']);
			if (--this.settings.boundJumps === 0) atom.dom('#jump').addClass('disabled');
		}.bind(this));
		atom.dom('#rotate').bind('click', function () {
			if (!atom.dom('#rotate').hasClass('disabled')) this.events.fire('actionAdd', ['rotate']);
			if (--this.settings.boundRotates === 0) atom.dom('#rotate').addClass('disabled');
		}.bind(this));
		atom.dom('#loop').bind('click', function () {
			if (!atom.dom('#loop').hasClass('disabled')) this.events.fire('actionAdd', ['loop']);
			if (--this.settings.boundLoops === 0) atom.dom('#loop').addClass('disabled');
		}.bind(this));
		atom.dom('#branch').bind('click', function () {
			if (!atom.dom('#branch').hasClass('disabled')) this.events.fire('actionAdd', ['branch']);
			if (--this.settings.boundBranches === 0) atom.dom('#branch').addClass('disabled');
		}.bind(this));
		
		atom.dom('#debug').bind('click', function () {
			if (!atom.dom('#debug').hasClass('disabled')) atom.dom('#mainMenu').animate({
				props: { opacity: 0 },
				onComplete: function () {
					atom.dom('#mainMenu').css('display', 'none');
					atom.dom('#debugMenu').css('display', 'block');
					this.events.fire('requireResize');
					atom.dom('#debugMenu').animate({ opacity: 1 });
				}.bind(this)
			});
		}.bind(this));
		
		atom.dom('#go').bind('click', function () {
			this.settings.speed = 1;
			this.algoritm.go();
		}.bind(this));
		atom.dom('#goFast').bind('click', function () {
			this.settings.speed = 5;
			this.algoritm.go();
		}.bind(this));
		
		atom.dom('#main').bind('click', function () {
			if (!atom.dom('#main').hasClass('disabled')) atom.dom('#debugMenu').animate({
				props: { opacity: 0 },
				onComplete: function () {
					atom.dom('#debugMenu').css('display', 'none');
					atom.dom('#mainMenu').css('display', 'block');
					this.events.fire('requireResize');
					atom.dom('#mainMenu').animate({ opacity: 1 });
				}.bind(this)
			});
		}.bind(this));
	}
});