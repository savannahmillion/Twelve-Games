unlock = unlockDates[4];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var fingerBaseYOffsets = [85, 110, 120, 110, 70];
    var fingerYIncrements = [20, 20, 20, 20, 15];
    
    var fingerBaseXOffsets = [22, 5, 0, 0, -5];
    var fingerXIncrements = [-4, 0, 0, 0, 2];
    
    var hand;
    var moveSpeed = 5;
    var cursors;
    
    var rings = [];
    var ringIndex = 0;
    
    var triggers = [];
    var triggerCollisionCount = [];
    
    var NOT_PLAYING = 0;
    var CATCH_RINGS = 0;
    var state = NOT_PLAYING;
    
    var currentLoopingEvent;
    
    var FRAME_DELAY = 50;
    var delayCount = 0;
    
    function Ring (spriteName) {
        this.sprite = game.add.sprite(0, 0, spriteName);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = 0;
        
        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;
        
        this.band = game.add.sprite(0, 0, 'ringBottom');
        this.band.anchor.setTo(0.5, 0.5);
        this.band.z = 2;
        
        this.caught = false;
        
        this.destination = -1;
        this.offset = 0;
    }
    
    Ring.prototype.update = function() {
        if(this.sprite.body.allowGravity && !this.caught)
        {
            for(t = 0; t < triggers.length; t++)
                game.physics.arcade.collide(this.sprite, triggers[t], collisionHandler, null, game);
        }
        else if(this.caught && this.destination > -1)
        {
            var triggerPos = triggers[this.destination].body.position;
            
            var dest = new Phaser.Point(triggerPos.x + fingerBaseXOffsets[this.destination] + (this.offset * fingerXIncrements[this.destination]), 
                                        triggerPos.y + fingerBaseYOffsets[this.destination] - (this.offset * fingerYIncrements[this.destination]));
            this.sprite.position = Phaser.Point.interpolate(this.sprite.position, dest, 0.7);
        }
        
        this.band.x = this.sprite.x;
        this.band.y = this.sprite.y;
    }

    function preload () {
        var height = document.getElementById("game-canvas").clientHeight;
        var width = document.getElementById("game-canvas").clientWidth;

        this.load.image('background', 'img/five/background.png');
        
        this.load.image('hand', 'img/five/hand.png');

        this.load.image('ring1', 'img/five/ring1.png');
        this.load.image('ring2', 'img/five/ring2.png');
        this.load.image('ring3', 'img/five/ring3.png');
        this.load.image('ring4', 'img/five/ring4.png');
        this.load.image('ring5', 'img/five/ring5.png');

        this.load.image('ringBottom', 'img/five/ring-bottom.png');
    }

    function create () {
        setupGameScaling();
        updateSize();
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 100;
        
        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        var NUM_RINGS = 5;

        var allSprites = game.add.group();

        hand = game.add.sprite(GAME_WIDTH/2, GAME_HEIGHT, 'hand');
        hand.anchor.setTo(0.5, 0.75);
        hand.z = 1;
    
        allSprites.addChild(hand);

        for(i = 0; i < NUM_RINGS; i++)
        {
            var spriteName = 'ring' + (i + 1);
            
            var ring = new Ring(spriteName);
            rings.push(ring);
            
            allSprites.addChild(ring.sprite);
            allSprites.addChild(ring.band);
        }

        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);
        
        var triggerWidth = 16;
        var triggerHeight = 32;
        
        
        createTrigger(-90, -215, triggerWidth, triggerHeight);
        createTrigger(-37, -260, triggerWidth, triggerHeight);
        createTrigger(5,   -280, triggerWidth, triggerHeight);
        createTrigger(50,  -270, triggerWidth, triggerHeight);
        createTrigger(90,  -145, triggerWidth, triggerHeight);
        
        initGame();
        
        cursors = game.input.keyboard.createCursorKeys();
        
        var onTouch = function(pointer) {
            
            if(state == NOT_PLAYING)
            {
                state = CATCH_RINGS;
                
                currentLoopingEvent = game.time.events.loop(Phaser.Timer.SECOND / 60, dropRings, this);
            }
        }
        
        game.input.onDown.add(onTouch, this);
    }
    
    function initGame(){
        for(r = 0; r < rings.length; r++){
            var ring = rings[r];
            
            ring.sprite.body.allowGravity = false;
            
            ring.caught = false;
            
            ring.sprite.x = game.rnd.integerInRange(50, 750);
            ring.sprite.y = 0;
            
            ring.destination = -1;
        }
        
        for(t = 0; t < triggerCollisionCount.length; t++){
            triggerCollisionCount[t] = 0;   
        }
    }
    
    function collisionHandler(ring, trigger){
        ring.body.allowGravity = false;
        ring.body.velocity.y = 0;
        
        var triggerIndex = triggers.indexOf(trigger);
        
        var ringObj = getRingFromSprite(ring);
        ringObj.caught = true;
        ringObj.destination = triggerIndex;
        ringObj.offset = triggerCollisionCount[triggerIndex];
        
        trigger.body.velocity.y = 0;
        triggerCollisionCount[triggerIndex]++;
    }
    
    function getRingFromSprite(sprite){
        for(i = 0; i < rings.length; i++)
        {
            if(rings[i].sprite == sprite)
                return rings[i];
        }
    }
    
    function dropRings(){
        if(state == CATCH_RINGS)
        {
            if(delayCount < FRAME_DELAY)
            {
                delayCount++;
                return;
            }
            
            delayCount = 0;
            
            rings[ringIndex].sprite.body.allowGravity = true;
            
            ringIndex++;
            if(ringIndex >= rings.length)
            {
                game.time.events.remove(currentLoopingEvent);
            }
        }
    }

    function createTrigger(xPos, yPos, width, height) {
        var trigger = game.add.sprite(0,0, null);
        trigger.anchor.setTo(0.5, 0.5);
        game.physics.enable(trigger, Phaser.Physics.ARCADE);
        trigger.body.setSize(width, height, xPos, yPos);
        trigger.body.allowGravity = false;
        trigger.body.kinematic = false;
        
        triggers.push(trigger);
        triggerCollisionCount.push(0);
        
        hand.addChild(trigger);
    }
    
    function moveLeft(){
        hand.x += -moveSpeed;
    }

    function moveRight(){
        hand.x += moveSpeed;
    }
    
    function desktopInput(){
        if(cursors.left.isDown)
        {
            moveLeft();
        }
        else if (cursors.right.isDown)
        {
            moveRight();
        }
        else
        {

        }
    }
    
    function mobileInput(){
        
    }
    
    function update() {
        if(game.device.desktop)
            desktopInput();
        else
            mobileInput();
        
        hand.x = game.math.clamp(hand.x, 100, 700);
        for(i = 0; i < rings.length; i++)
        {
            rings[i].update();
        }
    }

    function render() {
        for(i = 0; i < triggers.length; i++)
        {
            //game.debug.body(triggers[i]);
        }
        
        for(r = 0; r < rings.length; r++)
        {
            //game.debug.body(rings[r].sprite);
        }
    }
};