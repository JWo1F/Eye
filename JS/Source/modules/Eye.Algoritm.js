atom.declare('Eye.Algoritm', {
    initialize: function (engine, start, bound, vector) {
        this.engine = engine;
        this.position = new Point(start);
        this.vector = vector;
        this.action = [this.move.bind(this), this.jump.bind(this), this.rotate.bind(this)];
        this.algoritm = [];
        this.bound = bound;
        this.error = false;
        this.result = [];
    },
    move: function () {
        var cell = this.getNextCell();
        if (cell) {
            this.position = cell.point.clone();
            return true;
        } else {
            this.error = 0;
            return false;
        }
    },
    jump: function () {
        var cell = this.getNextCell();
        if (cell) {
            this.position = cell.point.clone();
            return true;
        } else {
            this.error = 0;
            return false;
        }
    },
    rotate: function () {
        this.vector = (this.vector == 3) ? 0 : this.vector+1;
        return true;
    },
    add: function (type, algoritm) {
        if (type == 'action') {
            this.algoritm.push(algoritm);
        } else if (type == 'branch') {
            this.algoritm.push(new Eye.Branch(algoritm));
        }
        return this;
    },
    parse: function (alg) {
        var child = !!alg;
        alg = alg || this.algoritm;
        alg.forEach(function (v) {
            if (this.algoritm.length < this.bound) {
                if (typeof v == 'number') {
                    if (this.action[v]()) {
                        this.result.push(v);
                    }
                } else if (v.type == 'Eye.Branch') {
                    if (this.getNextCell()) {
                        this.parse(v.space);
                    } else {
                        this.parse(v.wall);
                    }
                }
            }
        }.bind(this));
        var result = atom.clone(this.result);
        if (!child) this.result = [];
        return result;
    },
    getNextCell: function () {
        var neighbours = this.position.getNeighbours();
        neighbours = [neighbours[2], neighbours[0], neighbours[1], neighbours[3]];
        return this.engine.getCellByIndex(neighbours[this.vector]);
    }
});