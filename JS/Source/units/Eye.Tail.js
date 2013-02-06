atom.declare('Eye.Tail', App.Element, {
	configure: function () {
		this.player = this.settings.get
		this.shape = new Circle()
	}
});