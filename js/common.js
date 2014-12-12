function log(msg){
    setTimeout(function() {
        throw new Error(msg);
    }, 0);
};

function stringContains(str, subStr) {
	return str.indexOf(subStr) > -1;
};

var GAME_WIDTH = 800;
var GAME_HEIGHT = 450;

var today = new Date();
var unlock;

var START_DAY = 14;
var unlockDates = [
	new Date(2014, 11, START_DAY, 0, 0, 0, 0),    //1
	new Date(2014, 11, START_DAY+1, 0, 0, 0, 0),  //2
	new Date(2014, 11, START_DAY+2, 0, 0, 0, 0),  //3
	new Date(2014, 11, START_DAY+3, 0, 0, 0, 0),  //4
	new Date(2014, 11, START_DAY+4, 0, 0, 0, 0),  //5
	new Date(2014, 11, START_DAY+5, 0, 0, 0, 0),  //6
	new Date(2014, 11, START_DAY+6, 0, 0, 0, 0),  //7
	new Date(2014, 11, START_DAY+7, 0, 0, 0, 0),  //8
	new Date(2014, 11, START_DAY+8, 0, 0, 0, 0),  //9
	new Date(2014, 11, START_DAY+9, 0, 0, 0, 0),  //10
	new Date(2014, 11, START_DAY+10, 0, 0, 0, 0), //11
	new Date(2014, 11, START_DAY+11, 0, 0, 0, 0), //12
];

function setupGameScaling(){
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.minWidth = 80;
    game.scale.maxWidth = GAME_WIDTH;

    game.scale.minHeight = 45;
    game.scale.maxHeight = GAME_HEIGHT;
}

function updateSize(){
	var canvasElement = document.getElementById("game-canvas");

	var h = canvasElement.clientHeight;
    var w = canvasElement.clientWidth;

    h = w * 9.0/16.0;

    canvasElement.style.height = h;

    if(game)
    {
    	game.scale.maxWidth = w;
    	game.scale.maxHeight = h;
    	game.scale.refresh();
    }
}

var game;

function updateNav() {
	for(i = 0; i < unlockDates.length; i++)
	{
		var element = document.getElementById("nav" + (i + 1));
		if(today < unlockDates[i])
			element.src = "img/present.png";
 	}
}

function loadGameIfDateIsValid() {
	window.addEventListener('resize', updateSize);

	if(today > unlock)
	{
		window.addEventListener('load', mainGame);
	}
	else
	{
		function preload(){
			this.load.image('background', 'img/patience.png');
		}

		function create(){
			setupGameScaling();
        		updateSize();

        		var background = this.add.sprite(this.world.centerX, this.world.centerY, 'background');
        		background.anchor.setTo(0.5, 0.5);
		}

		game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', {preload: preload, create: create});
		document.getElementById("about-game").style.display = "none";
	}
}