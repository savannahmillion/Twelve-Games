unlock = unlockDates[7];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYING = 2;
    var state = NOT_PLAYING;

    var spawnMaidEvent;
    var spawnChickenEvent;

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

    var allSprites;
    var milkObjs = [];
    var chickens = [];

    var winCount = 0;

    var mobileMovement = 0;

    function Milk () {
        this.sprite = game.add.sprite(cow.x, cow.y, 'milk');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = -1;

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;
        this.sprite.body.velocity.y = 400;

        this.hit = false;

        allSprites.addChild(this.sprite);
        milkObjs.push(this);
    }

    function Maid(xPos, yPos, moveSpeed) {
        this.sprite = game.add.sprite(xPos, yPos, 'maid');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.z = -1;

        this.sprite.animations.add('walk');
        this.sprite.animations.play('walk', 10, true);

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;

        if(xPos > GAME_WIDTH/2)
            this.sprite.body.velocity.x = -moveSpeed;
        else
            this.sprite.body.velocity.x = moveSpeed;

        this.sprite.body.bounce.x = 1;
        this.hasMilk = false;

        allSprites.addChild(this.sprite);
        maids.push(this);
    }

    Maid.prototype.update = function(){
        if(this.hasMilk || state == GAME_OVER)
        {
            this.sprite.body.collideWorldBounds = false;
            if(this.sprite.x < 0 || this.sprite.x > GAME_WIDTH)
            {
                this.sprite.destroy();
                maids.splice(maids.indexOf(this), 1);
            }
        }
        else
        {
            if(this.sprite.x > 50 && this.sprite.y < 750)
            {
                this.sprite.body.collideWorldBounds = true;
            }
        }
    }

    function Chicken(){
        this.sprite = game.add.sprite(-50, 390, 'chicken');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.animations.add('walk');
        this.sprite.animations.play('walk', 10, true);

        game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.allowGravity = false;

        this.sprite.body.collideWorldBounds = false;
        this.sprite.body.bounce.x = 1;

        this.sprite.body.velocity.x = 300;

        allSprites.addChild(this.sprite);
        chickens.push(this);
    }

    Chicken.prototype.update = function() {
        if(this.sprite.body.velocity.x > 0)
            this.sprite.scale.x = 1;
        else
            this.sprite.scale.x = -1;

        if(this.sprite.x > 50)
        {
            this.sprite.body.collideWorldBounds = true;
        }

        if(state == GAME_OVER)
        {
            this.sprite.body.collideWorldBounds = false; 
        }
    }

    function milkHitChicken(milk, chicken){
        state = GAME_OVER;
        playerLose();
    }

    function milkHitMaid(milk, maid){
        if(state == PLAYING)
        {
            for(i = 0; i < maids.length; i++)
                if(maid == maids[i].sprite)
                    maids[i].hasMilk = true;

            for(i = 0; i < milkObjs.length; i++)
            {
                if(milk == milkObjs[i].sprite)
                    milkObjs[i].hit = true;
            }

            winCount++;
            if(winCount >= NUM_MAIDS)
            {
                playerWin();
                state = GAME_OVER;
            }
        }
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

        allSprites = game.add.group();
        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);
        
        cow = game.add.sprite(game.world.centerX, 60, 'cow');
        cow.anchor.setTo(0.5, 0.5);
        originalScale = cow.scale.x;
        
        cursors = game.input.keyboard.createCursorKeys();
        
        if(game.device.desktop)
        {
            milkButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        }
        else
        {
             var handleOrientation = function(e) {
                var val = 0;
                var orientation = window.orientation;

                if(orientation == 0)
                {
                    val = e.gamma;
                }
                else if(orientation == 90)
                {
                    val = e.beta;
                }
                else if(orientation == -90)
                {
                    val = -e.beta;
                }

                //log(Number(val));

                var THRESHOLD = 5;
                if(val > THRESHOLD)
                    mobileMovement = 1;//mooveRight();
                else if (val < -THRESHOLD)
                    mobileMovement = -1;//mooveLeft();
                else
                    mobileMovement = 0;//stopMoving();
            };

            window.addEventListener('deviceorientation', handleOrientation);
        }

        var onTouch = function(pointer) {
            if(state == PLAYING)
            {
                if(!game.device.desktop)
                    dropMilk();
            }

            if(state == NOT_PLAYING)
            {
                state = PLAYING;
                initGame();
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

                clearData();
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
        winCount = 0;
        endSoundCount = 0;

        spawnMaidEvent = game.time.events.repeat(Phaser.Timer.SECOND, NUM_MAIDS, spawnMaid, this);
        spawnChickenEvent = game.time.events.repeat(Phaser.Timer.SECOND, 3, spawnChicken, this);
    }

    function clearData(){
        for(i = 0; i < maids.length; i++)
        {
            maids[i].sprite.destroy();
        }

        maids = [];

        for(i = 0; i < chickens.length; i++)
        {
            chickens[i].sprite.destroy();
        }

        chickens = [];
    }

    function spawnMaid(){
        var xPos = (game.rnd.integerInRange(0, 1) == 1) ? -50 : 840;
        new Maid(xPos, 370, 200);
    }

    function spawnChicken(){
        new Chicken();
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
        // if(game.input.activePointer.isDown)
        // {
        //     if(game.input.activePointer.x > GAME_WIDTH/2)
        //     {

        //     }
        //     else
        //     {

        //     }
        // }
        if(mobileMovement == 1)
            mooveRight();
        else if(mobileMovement == -1)
            mooveLeft();
    }

    function update() {
        for(c = 0; c < chickens.length; c++)
            chickens[c].update();

        for(m = maids.length - 1; m >= 0; m--)
            maids[m].update();

        if(state == PLAYING)
        {
            if(game.device.desktop)
                desktopInput();
            else
                mobileInput();

            cow.x = game.math.clamp(cow.x, 80, 720);

            for(i = milkObjs.length - 1; i >= 0; i--)
            {
                var milk = milkObjs[i];
                if(milk.sprite.y > 410 || milk.hit)
                {
                    milkObjs.splice(i, 1);
                    allSprites.remove(milk.sprite);
                    milk.sprite.destroy();
                }
                else
                {
                    for(m = 0; m < maids.length; m++)
                        if(!milk.hit && !maids[m].hasMilk)
                            game.physics.arcade.overlap(milk.sprite, maids[m].sprite, milkHitMaid, null, this);

                    for(c = 0; c < chickens.length; c++)
                        if(!milk.hit)
                            game.physics.arcade.overlap(milk.sprite, chickens[c].sprite, milkHitChicken, null, this);
                }
            }
        }
    }

    function playerWin(){
        game.time.events.remove(spawnMaidEvent);
        game.time.events.remove(spawnChickenEvent);

        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        game.time.events.remove(spawnMaidEvent);
        game.time.events.remove(spawnChickenEvent);

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
        // for(i = 0; i < maids.length; i++)
        // {
        //     game.debug.body(maids[i].sprite);
        // }

        // for(i = 0; i < milkObjs.length; i++)
        // {
        //     game.debug.body(milkObjs[i]);
        // }

        // for(i = 0; i < chickens.length; i++)
        //     game.debug.body(chickens[i].sprite);
    }
};