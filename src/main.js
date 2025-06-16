import Phaser from 'phaser';
import './style.css'; 
import { displayDialogue } from './utils.js';

const size = {
  width: 900,
  height: 600,
};

class GameScene extends Phaser.Scene {
  preload() {
    this.load.image('spawnPT64', '../public/spawnPT64.png');
    this.load.image('protagonist_64x64', '../public/protagonist_64x64.png');
    this.load.json('playerStatus', '../public/playerStatus.json');
    this.load.json('dialogue', '../public/dialogue.json');
    this.load.image('spreadsheet', '../public/spreadsheet64x64.png');
    this.load.tilemapTiledJSON('spawnMap', '../public/spawnPT64.json');
  }
  create() {
    //key
    this.keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    //map
    const map = this.add.tilemap('spawnMap');
    const tileset = map.addTilesetImage('spreadsheet64x64', 'spreadsheet');
    const spawnRM = map.createLayer('spawnRM', tileset, -125, -60).setScale(0.75);
    const border = map.createLayer('border', tileset, -125, -60).setScale(0.75);

    //player
    this.player = this.physics.add.image(size.width/2, size.height/2, 'protagonist_64x64').setScale(1).setDepth(1);
    this.player.setCollideWorldBounds(true);
    this.physics.add.existing(this.player, false);
    this.player.body.setAllowGravity(false);
    this.inDialogue = true;
    this.cursor = this.input.keyboard.createCursorKeys();

    //collision
    this.physics.add.collider(this.player, border);
    border.setCollisionBetween(1, 100, true, true);

    //dialogue
    displayDialogue(this.cache.json.get('dialogue').intro, () => {
      this.inDialogue = false;
});
  }
  update() { 
    const playerStatus = this.cache.json.get('playerStatus');
    this.player.setVelocity(0);
    if(!this.inDialogue) {
      if (this.cursor.left.isDown || this.keys.A.isDown) {
        //console.log('Left key pressed');
        this.player.setVelocityX(-playerStatus.playerSpeed);
      } else if (this.cursor.right.isDown || this.keys.D.isDown) {
        //console.log('Right key pressed');
        this.player.setVelocityX(playerStatus.playerSpeed);
      }
      if (this.cursor.up.isDown || this.keys.W.isDown) {
        //console.log('Up key pressed');
        this.player.setVelocityY(-playerStatus.playerSpeed);
      } else if (this.cursor.down.isDown || this.keys.S.isDown) {
        //console.log('Down key pressed');
        this.player.setVelocityY(playerStatus.playerSpeed);
      }
    }
  }
  
}

const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  canvas: document.getElementById('gameCanvas'),
  transparent: true,
  backgroundColor: '#FFFFFF',
  scene: [GameScene],
  physics: { 
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
};

const game = new Phaser.Game(config);