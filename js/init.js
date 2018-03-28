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
function setupChar() {
    switch (player.character) {
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
            setup.background = 1;
            setup.cash = 4;
            setup.sound = 'scottSFX';
            break;
    }
}
setupChar();

function preload() {
    game.load.image('background', 'assets/backgrounds/landscape.jpg');
    game.load.spritesheet('mummy', 'assets/sprites/metalslug_mummy37x45.png', 37, 45, 18);
    game.load.spritesheet('scott', 'assets/sprites/scottpilgrim_multiple.png', 108, 120, 8);
    game.load.spritesheet('button', 'assets/sprites/button_sprite_sheet.png', 193, 71);
    game.load.audio('mummySFX', 'assets/music/March-of-the-Spoons.mp3');
    game.load.audio('scottSFX', 'assets/music/Industrious-Ferret.mp3');
}

function create() {
    if(player.options.mute) {
        $('.option-buttons .btn[data-option=mute]').find('span').removeClass('oi-volume-high').addClass('oi-volume-off');
    }

    game.stage.backgroundColor = '#4b0049';

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

    speedButton = game.add.button( ( ( ( ( 193 / 2 ) * 0 ) + 15) ), 15, 'button', buySpeed, this, 2, 1, 0);
    speedButtonLabel = game.add.text( ( ( ( ( 193 / 2 ) * 0 ) + 15) ), 45, 'Speed',  {font:"20px Arial", fill: 'white'});
    speedButton.scale.set(.5);
    speedButton.inputEnabled = true;

    multiButton = game.add.button( ( ( ( ( 193 / 2 ) * 1 ) + 15) ), 15, 'button', buyMultiplier, this, 2, 1, 0);
    multiButtonLabel = game.add.text( ( ( ( ( 193 / 2 ) * 1 ) + 15) ), 45, 'Multi',  {font:"20px Arial", fill: 'white'});
    multiButton.scale.set(.5);
    multiButton.inputEnabled = true;

    changeCharacterButton = game.add.button( ( game.world.width - ( ( ( 193 / 2 ) * 3 ) + 15) ), 15, 'button', changeChar, this, 2, 1, 0);
    changeCharacterButtonLabel = game.add.text( ( game.world.width - ( ( ( 193 / 2 ) * 3 ) + 15) ), 45, 'Change',  {font:"20px Arial", fill: 'white'});
    changeCharacterButton.scale.set(.5);
    changeCharacterButton.inputEnabled = true;

    muteButton = game.add.button( ( game.world.width - ( ( ( 193 / 2 ) * 2 ) + 15) ), 15, 'button', muteMusic, this, 2, 1, 0);
    muteButtonLabel = game.add.text( ( game.world.width - ( ( ( 193 / 2 ) * 2 ) + 15) ), 45, 'Mute',  {font:"20px Arial", fill: 'white'});
    muteButton.scale.set(.5);
    muteButton.inputEnabled = true;

    resetButton = game.add.button( ( game.world.width - ( ( ( 193 / 2 ) * 1 ) + 15) ), 15, 'button', resetGame, this, 2, 1, 0);
    resetButtonLabel = game.add.text( ( game.world.width - ( ( ( 193 / 2 ) * 1 ) + 15) ), 45, 'Reset',  {font:"20px Arial", fill: 'white'});
    resetButton.scale.set(.5);
    resetButton.inputEnabled = true;

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

function buySpeed() {
    if((player.runSpeed*1.10) <= player.cash) {
        player.runSpeed++;
        speedText.text = 'Your Speed: ' + (player.runSpeed - 9) + ' Cost: ' + Math.floor(player.runSpeed*1.10);
        anim.speed = player.runSpeed;
        player.cash -= Math.floor(player.runSpeed*1.10);
        updateData(player);
    }
}

function buyMultiplier() {
    if((player.cashMultiplier*10.10) <= player.cash) {
        player.cashMultiplier++;
        multiplierText.text = 'Cash per Step: ' + (setup.cash * player.cashMultiplier) + ' Cost: ' + Math.floor(player.cashMultiplier*10.10);
        player.cash -= Math.floor(player.cashMultiplier*10.10);
        updateData(player);
    }
}

function changeChar(sprite,pointer){
    player.character = player.character === 'mummy' ? 'scott' : 'mummy';
    updateCharacter();
}

function resetGame() {
    player.runSpeed = 10;
    player.cash = 0;
    player.cashMultiplier = 1;
    player.character = 'scott';
    updateCharacter();
    updateData(player);
}

function muteMusic() {
    if(!music.mute) {
        music.mute = true;
    } else {
        music.mute = false;
    }
    player.options.mute = music.mute;
    updateData(player);
}

function updateCharacter() {
    setupChar();
    character.destroy();
    var characterData = game.cache.getImage(player.character, true);
    character = game.add.sprite( ( (width / 2 ) - ( characterData.frameWidth * setup.width ) ), ( height - ( characterData.frameHeight * setup.height ) ), player.character);
    character.scale.set(setup.scale);
    character.smoothed = false;
    anim = character.animations.add('run');
    anim.onStart.add(animationStarted, this);
    anim.onLoop.add(animationLooped, this);
    anim.onComplete.add(animationStopped, this);
    speedText.text = 'Your Speed: ' + ( player.runSpeed - 9);
    multiplierText.text = 'Cash per Step: ' + ( setup.cash * player.cashMultiplier );
    anim.play(player.runSpeed, true);
    music.destroy();
    music = game.add.audio(setup.sound);
    music.mute = player.options.mute;
    start();
}