let gameScene = new Phaser.Scene('Game');
let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: 0x444444,
  scene: gameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 320 },
      debug: false,
    },
  },
};
let game = new Phaser.Game(config);
let player, cursors, platforms, coins, coronas, gameOver, score, scoreText;
gameScene.preload = function preload() {
  this.load.spritesheet('player', 'assets/sprite/char.png', {
    frameWidth: 40,
    frameHeight: 45,
  });
  this.load.spritesheet('coin', 'assets/sprite/coin.png', {
    frameWidth: 30,
    frameHeight: 30,
  });
  this.load.image('platform', 'assets/sprite/platform.png');
  this.load.image('corona', 'assets/sprite/corona.png');
  this.load.audioSprite('sfx', 'assets/audio/fx_mixdown.json', [
    'assets/audio/fx_mixdown.ogg',
    'assets/audio/fx_mixdown.mp3',
  ]);
};
gameScene.create = function create() {
  // scoreText = this.add.text(300, 200, "Hello Phaser", { fontSize: '32px', fill: "white" });
  player = this.physics.add.sprite(250, 200, 'player');
  player.setFrame(4);
  // ***********************static group*****************
  platforms = this.physics.add.staticGroup();
  platforms.create(50, 580, 'platform').setScale(2, 0.7).refreshBody();
  platforms.create(215, 110, 'platform').setScale(0.2, 0.3).refreshBody();
  platforms.create(555, 200, 'platform').setScale(0.2, 0.3).refreshBody();
  platforms.create(260, 370, 'platform').setScale(0.2, 0.3).refreshBody();
  coins = this.physics.add.group({
    key: 'coin',
    repeat: 10,
    setXY: { x: 20, y: 0, stepX: 70 },
  });
  coronas = this.physics.add.group();
  createCorona();
  // **************************Animations***********************
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 10, end: 19 }),
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 9 }),
    frameRate: 20,
    repeat: -1,
  });
  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 4 }],
    frameRate: 20,
  });
  this.anims.create({
    key: 'rJump',
    frames: [{ key: 'player', frame: 1 }],
    frameRate: 20,
  });
  this.anims.create({
    key: 'lJump',
    frames: [{ key: 'player', frame: 19 }],
    frameRate: 20,
  });
  this.anims.create({
    key: 'shine',
    frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 9 }),
    frameRate: 7,
    repeat: -1,
  });
  coins.playAnimation('shine');
  // player.anims.play("left");
  // *************************Collision*****************
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(coins, platforms);
  this.physics.add.collider(coronas, platforms);
  this.physics.add.overlap(player, coronas, hitCorona, null, this);
  this.physics.add.overlap(player, coins, collectCoin, null, this);
  cursors = this.input.keyboard.createCursorKeys();

  // adding score
  score = 0;
  scoreText = this.add.text(16, 16, 'SCORE:0', {
    fontSize: '16px',
    fill: 'white',
  });
};
gameScene.update = function update() {
  if (gameOver == true) return;
  if (cursors.left.isDown) {
    player.setVelocityX(-120);
    // ke liye collider add kar na padta hai
    if (player.body.touching.down) {
      player.anims.play('left', true);
    } else {
      player.anims.play('lJump', true);
    }
  } else if (cursors.right.isDown) {
    player.setVelocityX(120);
    if (player.body.touching.down) {
      player.anims.play('right', true);
    } else {
      player.anims.play('RJump', true);
    }
  } else {
    player.setVelocityX(0);
    player.anims.play('idle', true);
  }
  if (cursors.space.isDown && player.body.touching.down) {
    this.sound.playAudioSprite('sfx', 'numkey');
    player.setVelocityY(-350);
  }
};
function collectCoin(player, coin) {
  // disable ,hide
  coin.disableBody(true, true);
  this.sound.playAudioSprite('sfx', 'ping');
  score += 100;
  scoreText.setText('Score: ' + score);
  if (coins.countActive(true) === 0) {
    coins.children.iterate((coin) => {
      coin.enableBody(true, coin.x, 0, true, true);
      createCorona();
    });
  }
}
function createCorona() {
  let x =
    player.x < 400
      ? Phaser.Math.Between(400, 800)
      : Phaser.Math.Between(0, 400);
  let corona = coronas.create(x, 16, 'corona');
  corona.setBounce(0.99);
  corona.setCollideWorldBounds(true);
  corona.setVelocity(Phaser.Math.Between(-200, 200), 20);
}
function hitCorona() {
  this.physics.pause();
  player.setTint(0xff0000);
  gameOver = true;
}
