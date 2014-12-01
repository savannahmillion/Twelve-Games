function mainGame() {

    function coroutine(f) {
        var obj = f();
        obj.next();
        
        return function(x) {
            obj.next(x);
        }
    }

    function log(msg){
        setTimeout(function() {
            throw new Error(msg);
        }, 0);
    };

    window.addEventListener("resize", function(event){
        var h = document.getElementById("game-canvas").clientHeight;
        var w = document.getElementById("game-canvas").clientWidth;

        game.scale.setupScale(w, h);
        game.scale.refresh();
    });

    var width = document.getElementById("game-canvas").clientWidth;
    var height = document.getElementById("game-canvas").clientHeight;

    var game = new Phaser.Game(width, height, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var turtles;
    var turtleKey = 'pear';

    var NUM_TURTLES = 5;
    var INSET_PERCENTAGE = 0.25;

    var min;
    var max;
    var range;

    var startButton;

    function preload () {
        this.load.image('background', 'img/one/background.png');
        this.load.image(turtleKey, 'img/one/pear.png');

        this.load.atlasJSONHash('bird', 'img/one/bird.png', 'img/one/bird_anim.json');
    }

    function create () {

        var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var turtleWidth = game.cache.getImage(turtleKey).width;
        var min = width * INSET_PERCENTAGE + turtleWidth/2;
        var max = width - (width * INSET_PERCENTAGE) - turtleWidth/2;
        var range = max - min;

        turtles = this.add.group();
        var stepSize = range/NUM_TURTLES;
        for(i = 0; i < NUM_TURTLES; i++)
        {
            var xPos = min + stepSize/2 + (stepSize * i);
            var yPos = height / 2;
            var turtle = turtles.create(xPos, yPos, turtleKey);
            turtle.anchor.setTo(0.5, 0.5);
        }

        startButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        var test = coroutine(function*(_) {
            var NUM_ROTS = 7;
            var count = 0;

            while(count < NUM_ROTS)
            {
                var indices = turtleIndices();

                var t1 = turtles.getAt(indices[0]);
                var t2 = turtles.getAt(indices[1]);

                var t1StartPos = t1.position;
                var t2StartPos = t2.position;
                var avgPos = Phaser.Point.interpolate(t1StartPos, t2StartPos, 0.5);

                var rotation = 0;
                while(rotation < 180) {
                    yield _;

                    rotation += 5;

                    var p1 = new Phaser.Point(t1StartPos.x, t1StartPos.y);
                    var p2 = new Phaser.Point(t2StartPos.x, t2StartPos.y);

                    t1.position = Phaser.Point.rotate(p1, avgPos.x, avgPos.y, rotation, true);
                    t2.position = Phaser.Point.rotate(p2, avgPos.x, avgPos.y, rotation, true);
                }
                count++;
            }
        });

        game.time.events.loop(Phaser.Timer.SECOND / 60, test, this);
    }

    var turtleIndices = function(){
        var indices = [];
        for(i = 0; i < NUM_TURTLES; i++)
            indices.push(i);

        var firstIndex = indices[game.rnd.integerInRange(0, indices.length - 1)];

        var indices2 = [];
        for(i = 0; i < NUM_TURTLES; i++)
            if(i != firstIndex)
                indices2.push(i);

        var secondIndex = indices2[game.rnd.integerInRange(0, indices2.length - 1)];

        return [firstIndex, secondIndex];
    }

    function update() {

    }

    function render() {

    }
};