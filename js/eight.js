unlock = unlockDates[7];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYING = 2;
    var state = NOT_PLAYING;

    var currentLoopingEvent;

    var win;
    var lose;
    var tween;

    var canRestart = false;

    var sfx_ring;
    var sfx_bells;
    var sfx_thump;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    var originalScale;
    var mooveSpeed = 5; //lol

    var cow;
    var maids = [];
    var NUM_MAIDS = 8;

    var cursors;
    var milkButton;

    var milks;
    var chicken;

    function Milk () {
        this.sprite = game.add.sprite(cow.x, cow.y, 'milk');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = -1;

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;
        this.sprite.body.velocity.y = 250;

        this.hit = false;

        milks.addChild(this.sprite);
    }

    function Maid(xPos, yPos, moveSpeed) {
        this.sprite = game.add.sprite(xPos, yPos, 'maid');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.animations.add('walk');
        this.sprite.animations.play('walk', 10, true);

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;

        if(xPos > GAME_WIDTH/2)
            this.sprite.body.velocity.x = -moveSpeed;
        else
            this.sprite.body.velocity.x = moveSpeed;

        this.sprite.body.bounce = 1;
        this.hasMilk = false;
    }

    Maid.prototype.update() function(){
        if(this.hasMilk)
        {
            this.sprite.body.collideWorldBounds = true;
        }
        else
        {
            if(this.sprite.x > 50 && this.sprite.y < 750)
            {
                this.sprite.body.collideWorldBounds = true;
            }
        }
    }

    function Chicken(xPos, yPos){
        this.sprite = game.add.sprite(xPos, yPos, 'chicken');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.animations.add('walk');
        this.sprite.animations.play('walk', 10, true);

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;
    }

    function milkHitOther(milk, other){
        if(other == chicken)
        {
            log('hit chicken');
        }
        else
        {
            log('hit maid');
            other.hasMilk = true;
        }

        milk.hit = true;
    }

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/eight/background.png');

        this.load.atlasJSONHash('chicken', 'img/eight/chicken.png', 'img/eight/chicken_anim.json');
        this.load.atlasJSONHash('maid', 'img/eight/maid.png', 'img/eight/maid_anim.json');

        this.load.image('milk', 'img/eight/milk.png');
        this.load.image('cow', 'img/eight/cow.png');

        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();
        
        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

        var background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        milks = game.add.group();

        cow = game.add.sprite(game.world.centerX, 60, 'cow');
        cow.anchor.setTo(0.5, 0.5);

        originalScale = cow.scale.x;

        for(i = 0; i < NUM_MAIDS; i++)
        {
            var maidPosX = 100 + (50 * i);
            var maidPosY = 370;

            var maid = new Maid(maidPosX, maidPosY, 200);
            maids.push(maid);
        }

        milks.sort('z', Phaser.Group.SORT_DESCENDING);
        
        cursors = game.input.keyboard.createCursorKeys();
        
        if(game.device.desktop)
        {
            milkButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        }
        else
        {

        }

        var onTouch = function(pointer) {
            if(state == NOT_PLAYING)
            {
                state = PLAYING
            }

            if(state == GAME_OVER && canRestart)
            {
                canRestart = false;

                if(lose.visible)
                {
                    tween = game.add.tween(lose).to( {y: -GAME_HEIGHT/2}, 500, Phaser.Easing.Quadratic.In, true);
                    tween.onComplete.add(dropOutComplete, this);
                }
                else if(win.visible)
                {
                    tween = game.add.tween(win).to( {y: -GAME_HEIGHT/2}, 500, Phaser.Easing.Quadratic.In, true);
                    tween.onComplete.add(dropOutComplete, this);   
                }

                initGame();
            }
        }
        
        game.input.onDown.add(onTouch, this);

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;
    }

    function mooveLeft(){
        cow.x -= mooveSpeed;
        cow.scale.x = originalScale;
    }

    function mooveRight(){
        cow.x += mooveSpeed;
        cow.scale.x = -originalScale;
    }

    function dropMilk(){
        var milk = new Milk();
    }

    function initGame(){ 
        
    }
    
    function desktopInput(){
        if(milkButton.justPressed(0.05)) {
            dropMilk();
        }

        if(cursors.left.isDown)
        {
            mooveLeft();
        }
        else if (cursors.right.isDown)
        {
            mooveRight();
        }
    }
    
    function mobileInput(){
        if(game.input.activePointer.isDown)
        {
            if(game.input.activePointer.x > GAME_WIDTH/2)
            {

            }
            else
            {

            }
        }
    }

    function update() {
        if(game.device.desktop)
            desktopInput();
        else
            mobileInput();

        cow.x = game.math.clamp(cow.x, 80, 720);

        for(i = milks.length; i >= 0; i--)
        {
            var milk = milks.getAt(i);
            if(milk.y > 410 || milk.hit)
            {
                milks.remove(milk);
                milk.destroy();
            }
            else
            {
                for(m = 0; m < maids.length; m++)
                    if(!milk.hit && !maids[m].hasMilk)
                        game.physics.arcade.overlap(milk, maids[m].sprite, milkHitOther, null, this);

                if(!milk.hit)
                    game.physics.arcade.overlap(milk, chicken, milkHitOther, null, this);
            }
        }
    }

    function playerWin(){
        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        lose.visible = true;

        tween = game.add.tween(lose).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function dropInComplete(){
        canRestart = true;
    }

    function dropOutComplete(){
        state = NOT_PLAYING;

        lose.visible = false;
        win.visible = false;
    }

    function tweenUpdate(){
        var sprite;
        var playerWins = false;
        if(win.visible)
        {
            sprite = win;
            playerWins = true;
        }
        else if (lose.visible)
            sprite = lose;
        else
            return;

        if(sprite.visible){
            if(testPos)
            {
                if(prevY > sprite.position.y)
                {
                    if(endSoundCount < END_SOUND_MAX)
                    {
                        if(playerWins)
                            sfx_bells.play('bells', 0, 0.3);
                        else
                            sfx_thump.play('thump', 0, 0.5);

                        endSoundCount++;
                        testPos = false;
                    }
                }
            }
            else
            {
                if(endSoundCount < END_SOUND_MAX)
                {
                    if(prevY < sprite.position.y)
                        testPos = true;
                }
            }
            
            prevY = sprite.position.y;
        }
    }

    function render() {
        for(i = 0; i < maids.length; i++)
        {
            game.debug.body(maids[i].sprite);
        }

        for(i = 0; i < milks.length; i++)
        {
            game.debug.body(milks.getAt(i));
        }
    }
};