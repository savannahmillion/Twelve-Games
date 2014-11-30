function mainGame() {

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
    }

    function update() {

    }

    function render() {

    }
};