var program = {
	user: 'WolF',
	salt: 'test'
};
var Eye = {};
Eye.extend = function (method, func) {
	if (typeof method == 'object') {
		for (var key in method) this[key] = method[key];
	} else {
		this[method] = func;
	}
}.bind(Eye);
Eye.temp = {};
Eye.subprograms = {};
LibCanvas.extract();

atom.dom(function () {
    window.eye = new Eye.Controller();
});