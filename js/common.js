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

var GAME_WIDTH = 800;
var GAME_HEIGHT = 450;