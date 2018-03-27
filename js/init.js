var width = $(document).outerWidth();
var height = $(document).outerHeight();
var game = new Phaser.Game( width, height, Phaser.CANVAS, 'stage', { preload: preload, create: create, update: update });
var back;
var music;
var sounds;
var character;
var anim;
var speedText;
var multiplierText;
var cashText;
var player = JSON.parse(localStorage.getItem('player'));
if(!player) {
    player = {};
    player.runSpeed = 10;
    player.cash = 0;
    player.cashMultiplier = 1;
    player.character = 'scott';
    player.options = {};
    player.options.mute = false;
}
var setup = {};
switch(player.character) {
    case 'mummy':
        setup.scale = 4;
        setup.width = 2;
        setup.height = 4;
        setup.background = 10;
        setup.cash = 2;
        setup.sound = 'mummySFX';
        break;
    case 'scott':
        setup.scale = 2;
        setup.width = 1;
        setup.height = 2;
        setup.background = 4;
        setup.cash = 4;
        setup.sound = 'scottSFX';
        break;
}

function preload() {
    game.load.image('background', 'assets/backgrounds/landscape.jpg');
    game.load.spritesheet('mummy', 'assets/sprites/metalslug_mummy37x45.png', 37, 45, 18);
    game.load.spritesheet('scott', 'assets/sprites/scottpilgrim_multiple.png', 108, 120, 8);
    game.load.audio('mummySFX', 'assets/music/March-of-the-Spoons.mp3');
    game.load.audio('scottSFX', 'assets/music/Industrious-Ferret.mp3');
}

function create() {
    if(player.options.mute) {
        $('.option-buttons .btn[data-option=mute]').find('span').removeClass('oi-volume-high').addClass('oi-volume-off');
    }

    back = game.add.tileSprite(0, (height-1080), 1920, 1080,  'background');
    back.smoothed = false;

    music = game.add.audio(setup.sound);
    music.mute = player.options.mute;

    var characterData = game.cache.getImage(player.character, true);

    character = game.add.sprite( ( (width / 2 ) - ( characterData.frameWidth * setup.width ) ), ( height - ( characterData.frameHeight * setup.height ) ), player.character);
    character.scale.set(setup.scale);

    character.smoothed = false;
    anim = character.animations.add('run');

    speedText = game.add.text(15, 160, 'Your Speed: ' + ( player.runSpeed - 9), { fill: 'white' });
    multiplierText = game.add.text(15, 200, 'Cash per Step: ' + ( setup.cash * player.cashMultiplier), { fill: 'white' });
    cashText = game.add.text(15, 120, 'Your cash: ' + player.cash, { fill: 'white' });

    anim.onStart.add(animationStarted, this);
    anim.onLoop.add(animationLooped, this);
    anim.onComplete.add(animationStopped, this);

    anim.play(player.runSpeed, true);

    sounds = [ music ];

    //  Being mp3 files these take time to decode, so we can't play them instantly
    //  Using setDecodedCallback we can be notified when they're ALL ready for use.
    //  The audio files could decode in ANY order, we can never be sure which it'll be.

    game.sound.setDecodedCallback(sounds, start, this);
}

function start() {
    sounds.shift();
    music.loopFull(0.6);
}

function animationStarted(sprite, animation) {
    //game.add.text(32, 32, 'Animation started', { fill: 'white' });
}

function animationLooped() {
    player.cash += ( setup.cash * player.cashMultiplier );
    cashText.text = 'Your cash: ' + player.cash;
    updateData(player);
}

function animationStopped(sprite, animation) {
    game.add.text(32, 64+32, 'Animation stopped', { fill: 'white' });
}

function update() {
    if (anim.isPlaying) {
        back.tilePosition.x -= (player.runSpeed/setup.background);
    }
}

function updateData(data) {
    localStorage.setItem('player', JSON.stringify(data));
}

function updateValues(value, cost) {
    if(value === 'speed' && cost <= player.cash) {
        player.runSpeed++;
        speedText.text = 'Your Speed: ' + ( player.runSpeed - 9);
        anim.speed = player.runSpeed;
        player.cash -= cost;
    }
    if(value === 'money' && cost <= player.cash) {
        player.cashMultiplier++;
        multiplierText.text = 'Cash per Step: ' + ( setup.cash * player.cashMultiplier );
        player.cash -= cost;
    }
    updateData(player);
}

function updatePrices(b) {
    if(b.attr('data-action') === 'speed') {
        b.attr('data-cost', Math.floor(b.attr('data-cost')*1.10));
        b.find('.price').text(b.attr('data-cost'));
    }
    if(b.attr('data-action') === 'money') {
        b.attr('data-cost', Math.floor(b.attr('data-cost')*10.0));
        b.find('.price').text(b.attr('data-cost'));
    }
}

function updateOptions(b) {
    var value = b.attr('data-option');
    if(value === 'mute' && !music.mute) {
        music.mute = true;
        b.find('span').removeClass('oi-volume-high').addClass('oi-volume-off');
    } else if(value === 'menu') {
        player.character = player.character === 'mummy' ? 'scott' : 'mummy';
    } else {
        music.mute = false;
        b.find('span').removeClass('oi-volume-off').addClass('oi-volume-high');
    }

    player.options.mute = music.mute;
    updateData(player);
}

$('.action-buttons .btn').on('click', function() {
    if(!$(this).hasClass('disabled')) {
        updateValues($(this).attr('data-action'), parseInt($(this).attr('data-cost')));
        updatePrices($(this));
    } else {
        console.log('disabled');
    }
});

$('.option-buttons .btn').on('click', function () {
    updateOptions($(this));
});

setInterval(function() {
    $('.action-buttons .btn').each(function() {
        if(parseInt($(this).attr('data-cost')) <= player.cash) {
            $(this).removeClass('disabled');
        } else if(!$(this).hasClass('disabled')) {
            $(this).addClass('disabled');
        }
    });
}, 100);