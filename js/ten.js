unlock = unlockDates[9];

function mainGame() {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

    var GAME_OVER = 0;
    var NOT_PLAYING = 1;
    var PLAYING = 2;
    var RESTARTING = 3;
    var state = NOT_PLAYING;

    var win;
    var lose;
    var tween;

    var canRestart = false;

    var sfx_bells;
    var sfx_thump;
    var sfx_jump;

    var endSoundCount = 0;
    var END_SOUND_MAX = 3;

    var prevY;
    var testPos = false;

    var winCount = 0;

    var background;
    var WORLD_WIDTH = 5500;

    var lords = [];
    var LORD_DIST = 40;
    var runSpeed = 300;

    var gravity = 1200;
    var jumpVelocity = 600;

    var trees = [];
    var treeDist = [
        1000,
        2100,
        3300,
        3350,
        4400,
        4500
    ];

    var allSprites;

    var canJump = true;
    var jumpCount = 0;

    function preload () {
        this.load.image('nice', 'img/nice.png');
        this.load.image('naughty', 'img/naughty.png');

        this.load.image('background', 'img/ten/background.png');

        this.load.image('tree', 'img/ten/tree.png');
        this.load.atlasJSONHash('lord', 'img/ten/lord.png', 'img/ten/lord_anim.json');

        this.load.audio('sfx_bells', 'sfx/bells.wav');
        this.load.audio('sfx_thump', 'sfx/thump.wav');

        this.load.audio('sfx_jump', 'sfx/ten/jump.wav');
    }

    function create () {
        setupGameScaling();
        updateSize();

        game.stage.backgroundColor = '#F3DAF0';
        game.world.setBounds(0, 0, WORLD_WIDTH, 450);

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = gravity;
        
        sfx_bells = game.add.audio('sfx_bells');
        sfx_bells.addMarker('bells', 0.0, 1.0);

        sfx_thump = game.add.audio('sfx_thump');
        sfx_thump.addMarker('thump', 0.0, 1.0);

        sfx_jump = game.add.audio('sfx_jump');
        sfx_jump.addMarker('jump', 0.0, 1.0);

        background = game.add.sprite(game.world.centerX, game.world.centerY, 'background');
        background.anchor.setTo(0.5, 0.5);

        //remove flickering at edges
        background.scale.x = 1.02;
        background.scale.y = 1.02;
        
        var onTouch = function(pointer) {
            if(state == PLAYING)
            {
                playerJump();
            }

            if(state == NOT_PLAYING)
            {
                startRunning();
                state = PLAYING;
            }

            if(state == GAME_OVER && canRestart)
            {
                canRestart = false;
                state = RESTARTING;

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

        allSprites = game.add.group();

        for(i = 0; i < 10; i++)
        {
            var lord = game.add.sprite((GAME_WIDTH/2) - (i * LORD_DIST), game.world.centerY, 'lord');
            lord.anchor.setTo(0.5, 0.2);
            lord.animations.add('run', [0, 1]);
            lord.animations.add('jump', [2]);

            game.physics.enable(lord, Phaser.Physics.ARCADE);
                
            lord.body.width *= 0.6;
            lord.body.height *= 0.8;

            //alternate depths
            lord.z = (i % 2 == 0) ? -i : i;

            lords.push(lord);

            allSprites.addChild(lord);
        }

        for(i = 0; i < treeDist.length; i++){
            var tree = game.add.sprite(treeDist[i], game.world.centerY + 50, 'tree');
            tree.anchor.setTo(0.5, 0.5);

            game.physics.enable(tree, Phaser.Physics.ARCADE);
            tree.body.allowGravity = false;

            trees.push(tree);
        }

        win = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'nice');
        win.anchor.setTo(0.5, 0.5);
        win.visible = false;
        
        lose = game.add.sprite(game.world.centerX, -GAME_HEIGHT/2, 'naughty');
        lose.anchor.setTo(0.5, 0.5);
        lose.visible = false;

        allSprites.sort('z', Phaser.Group.SORT_DESCENDING);
        game.camera.follow(lords[0]);
    }

    function playerJump(){
        if(canJump){
            sfx_jump.play('jump', 0, 0.3);
            canJump = false;
            game.time.events.repeat(Phaser.Timer.SECOND / 7, 10, lordJump, this);
        }
    }

    function lordJump(){
        lords[jumpCount].body.allowGravity = true;
        lords[jumpCount].body.velocity.y = -jumpVelocity;

        lords[jumpCount].animations.play('jump', 5, true);
        jumpCount++;
    }

    function initGame(){ 
        endSoundCount = 0;
        winCount = 0;

        jumpCount = 0;
        canJump = true;
        
        for(i = 0; i < lords.length; i++)
        {
            var lord = lords[i];
            lord.body.allowGravity = false;
            lord.x = (GAME_WIDTH/2) - (i * LORD_DIST);
            lord.y = game.world.centerY;
            lord.body.velocity.y = 0;

            lord.animations.play('run', 5, false);
            lord.animations.stop();
        }
    }

    function startRunning(){
        for(i = 0; i < lords.length; i++)
        {
            var lord = lords[i];
            lord.body.velocity.x = runSpeed;
            lord.animations.play('run', 5, true);
        }
    }

    function update() {
        for(i = 0; i < lords.length; i++)
        {
            var lord = lords[i];

            if(state == PLAYING || state == NOT_PLAYING)
            {
                if(lord.y > game.world.centerY)
                {
                    lord.body.velocity.y = 0;
                    lord.y = game.world.centerY;
                    lord.body.allowGravity = false;

                    if(state == PLAYING)
                        lord.animations.play('run', 5, true);
                    else
                        lord.animations.stop();

                    if(i == (lords.length - 1)){
                        canJump = true;
                        jumpCount = 0;
                    }
                }

                if(i == lords.length - 1)
                    if(lord.x > WORLD_WIDTH + 20)
                        playerWin();

                for(t = 0; t < trees.length; t++)
                    game.physics.arcade.overlap(lord, trees[t], treeHit, null, this);
            }
            else if(state == GAME_OVER)
            {
                lord.body.velocity.x = 0;
                lord.body.allowGravity = true;
            }
        }

        background.x = lords[0].x + 4;
        if(background.x > WORLD_WIDTH - (GAME_WIDTH/2))
            background.x = WORLD_WIDTH - (GAME_WIDTH/2);

        win.x = background.x - 2;
        lose.x = win.x;
    }

    function treeHit(lord, tree){
        if(state == PLAYING)
        {
            lord.body.velocity.x = 0;
            playerLose();
        }
    }

    function playerWin(){
        state = GAME_OVER;

        win.visible = true;

        tween = game.add.tween(win).to( {y: GAME_HEIGHT/2}, 2000, Phaser.Easing.Bounce.Out, true);
        tween.onComplete.add(dropInComplete, this);
        tween.onUpdateCallback(tweenUpdate, this);
    }

    function playerLose(){
        state = GAME_OVER;

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
        //for(i = 0; i < lords.length; i++)
        //{
        //     game.debug.body(lords[i]);
        //}

        //for(i = 0; i < trees.length; i++)
        //{
        //     game.debug.body(trees[i]);
        //}
    }
};