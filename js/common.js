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

function stringContains(str, subStr) {
	return str.indexOf(subStr) > -1;
};

var GAME_WIDTH = 800;
var GAME_HEIGHT = 450;

var today = new Date();
var unlock;

var START_DAY = 1;
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

function updateSize(){
	var h = document.getElementById("game-canvas").clientHeight;
    var w = document.getElementById("game-canvas").clientWidth;

    h = w * 9.0/16.0;

    document.getElementById("game-canvas").style.height = h;

    if(game != undefined)
    {
	    game.scale.setupScale(w, h);
	    game.scale.refresh();
	}
}

var game;
window.addEventListener("resize", function(event){
    updateSize();
});

function updateNav() {
	for(i = 0; i < unlockDates.length; i++)
	{
		var element = document.getElementById("nav" + (i + 1));
		if(today > unlockDates[i])
			element.src = "img/1_pear.png";
 	}
}

function loadGameIfDateIsValid() {
	if(today > unlock)
	{
		window.addEventListener("load", mainGame);
	}
	else
	{
		updateSize();
	}
}