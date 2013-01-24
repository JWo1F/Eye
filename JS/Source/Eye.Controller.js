atom.declare('Eye.Controller', {
    res: {
        player: {
            loc: [0,0],
            vector: 0
        },
        boundActions: 1000
    },
    initialize: function () {
        this.engine = this.initEngine();
        this.app = this.initApp();
        this.engineElement = TileEngine.Element.app(this.app, this.engine);
        this.player = new Eye.Player(this.app.createLayer('player'), { wrapper: this.engine.getCellByIndex(this.res.player.loc).rectangle.clone() });
        this.algoritm = new Eye.Algoritm( this.engine, this.res.player.loc.clone(), this.res.boundActions, this.res.player.vector );
        this.list = new Eye.List(this.algoritm.algoritm);
        this.initNoise();
        this.initHandlers();
    },
    initEngine: function () {
        return new TileEngine({
            size: new Size(16,8),
            cellSize: new Size(50,50),
            cellMargin: new Size(1,1),
            defaultValue: 0
        }).setMethod({
            0: '#c9c9c9'
        });
    },
    initApp: function () {
        return new App({
            size: this.engine.countSize(),
            appendTo: '#game'
        });
    },
    initNoise: function () {
        var layer = this.app.createLayer('noise');
        layer.dom.zIndex = 9;
        var size = this.engine.countSize();
        var buffer = [];
        for (var i=0; i < 20; i++) {
            var b = LibCanvas.buffer(size.x, size.y, true);
            for (var n=0; n<2000; n++) {
                var rand = [Math.random()*size.x, Math.random()*size.y, Math.random()*0.2];
                b.ctx.fill(new Circle(rand[0], rand[1], 1), 'rgba(0,0,0,'+rand[2]+')');
            }
            buffer.push(b);
        }
        window.buffer = buffer;
        var x = 0;
        setInterval(function () {
            layer.ctx.clearAll();
            layer.ctx.drawImage({
                image: buffer[x],
                center: this.app.rectangle.center
            });
            if (x==buffer.length-1) {x=0} else {x++}
        }.bind(this), 100);
    },
    initHandlers: function () {
        atom.dom('#move').bind('click', function () {
            this.algoritm.add('action', 0);
            this.list.render();
        }.bind(this));
    },
    start: function () {
        var actions = this.algoritm.parse();
        actions.forEach(function (v, i) {
            var last = (i === actions.length-1) ? this.algoritm.error : false;
            var neighbours = new Point(this.res.player.loc).getNeighbours();
            neighbours = [neighbours[2], neighbours[0], neighbours[1], neighbours[3]];
            var cell = this.engine.getCellByIndex(neighbours[this.res.player.vector]);
            
            if (v === 0) {
                if (cell) {
                    this.res.player.loc = neighbours[this.res.player.vector];
                    this.player.move(cell.rectangle, last);
                } else {
                    this.error = 0;
                    return false;
                }
            } else if (v == 1) {
                if (cell) {
                    this.res.player.loc = neighbours[this.res.player.vector];
                    this.player.move(cell.rectangle, last);
                } else {
                    this.error = 0;
                    return false;
                }
            } else if (v == 2) {
                this.player.rotate();
                this.res.player.vector = (this.res.player.vector == 3) ? 0 : this.res.player.vector+1;
            }
        }.bind(this));
    }
});