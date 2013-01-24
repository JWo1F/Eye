atom.declare('Eye.List', {
    initialize: function (alg) {
        this.alg = alg;
        this.i = 0;
        this.dom = atom.dom([]);
    },
    render: function () {
        this.parse();
        var dom = atom.dom('#log').html('');
        this.dom.appendTo(dom);
        return dom;
    },
    parse: function () {
        this.alg.forEach(function (v) {
            if (v == '0') {
                this.createItem('Шаг').appendTo(this.dom);
            } else if (v == '1') {
                this.createItem('Прыжок').appendTo(this.dom);
            } else if (v == '2') {
                this.createItem('Поворот').appendTo(this.dom);
            }
        }.bind(this));
    },
    createItem: function (text) {
        this.i++;
        var elem = atom.dom.create('li', { 'data-id': this.i }).html(text);
        elem.active = 0;
        elem.bind('click', function () {
            elem.active = (elem.active) ? 0 : 1;
            elem.toggleClass('active');
        }.bind(this));
        return elem;
    }
});