import Phaser from 'phaser';
import './style.css'; 
import { displayDialogue, displayHint } from './utils.js';

const size = {
  width: 900,
  height: 600,
};

class GameScene extends Phaser.Scene {
  constructor() {
    super();
    this.pcCooldown = false;
    this.cooldownTime = 2000; 
    this.isHintVisible = false;
    this.currentHintObject = null;
  }

  preload() {
    this.load.image('spawnPT64', 'map/spawnPT/spawnPT64.png');
    this.load.image('protagonist_64x64', 'character/player/protagonist_64x64.png');
    this.load.json('playerStatus', 'character/player/playerStatus.json');
    this.load.json('dialogue', 'character/player/dialogue.json');
    this.load.image('spreadsheet', 'spreadsheet64x64.png');
    this.load.tilemapTiledJSON('spawnMap', 'map/spawnPT/spawnPT64.json');
  }

  create() {
    // Key bindings
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Map setup
    const map = this.add.tilemap('spawnMap');
    const tileset = map.addTilesetImage('spreadsheet64x64', 'spreadsheet');
    const spawnRM = map.createLayer('spawnRM', tileset, -125, -80).setScale(0.75);
    const border = map.createLayer('border', tileset, -125, -80).setScale(0.75);  
    const decoration = map.createLayer('decoration', tileset, -125, -80).setScale(0.75);
    const spawnPTObj = map.getObjectLayer('spawnPT').objects;

    // Player setup with scaled hitbox
    this.player = this.physics.add.image(size.width/2, size.height/2, 'protagonist_64x64')
      .setScale(1)
      .setDepth(1000)
      .setSize(55, 70) // Scaled hitbox (65 * 1, 70 * 1)
      .setOffset(5, 0); // Scaled offset (2 * 1)
    this.player.setCollideWorldBounds(true);

    this.inDialogue = true;
    this.cursor = this.input.keyboard.createCursorKeys();

    // Tilemap collisions
    this.physics.add.collider(this.player, border);
    border.setCollisionBetween(1, 100, true, true);
    this.physics.add.collider(this.player, decoration);
    decoration.setCollisionBetween(1, 100, true, true);

    // PC object setup with scaled collision
    this.interactables = this.physics.add.staticGroup();
    this.pcGroup = this.physics.add.staticGroup(); // Separate group for PC

    spawnPTObj.forEach(obj => {
      const x = obj.x * 0.75 - 125;
      const y = obj.y * 0.75 - 80;
      const width = obj.width * 0.75;
      const height = obj.height * 0.75;
      
      if (obj.name === 'PC') {
        // Add PC to its own group with collision
        const hitbox = this.pcGroup.create(x + width / 2, y + height / 4, null)
          .setScale(4.51)
          .setData('type', obj.name)
          .setVisible(false)
          .refreshBody();

          
      } else {
        // Add other interactables (e.g., PC_Hint) to the general group with overlap
        const hitbox = this.interactables.create(x + width / 2, y + height / 2, null)
          .setSize(width, height)
          .setData('type', obj.name)
          .setVisible(false);
        const debugGraphic = this.add.graphics()
          .lineStyle(2, 0x00ff00, 0.5) // Different color for non-PC debug
          .strokeRect(x, y, width, height)
          .setVisible(false);
      }
    });

    // Collision for PC only
    this.physics.add.collider(this.player, this.pcGroup, (player, obj) => {
      if (!this.pcCooldown && !this.inDialogue && obj.getData('type') === 'PC') {
        console.log('PC collision detected');
        displayHint("github info", false);
        this.onPCCollision();
      }
    });

    // Overlap for other interactables (e.g., PC_Hint)
    this.physics.add.overlap(this.player, this.interactables, (player, obj) => {
      const type = obj.getData('type');
      if (type === 'PC_Hint' && !this.inDialogue) {
        if (!this.isHintVisible) {
          this.currentHintObject = obj;
          displayHint("github info", true);
          this.isHintVisible = true;
        }
      }
    }, null, this);



    displayDialogue(this.cache.json.get('dialogue').intro, () => {
      this.inDialogue = false;
    });

    this.physics.world.createDebugGraphic();
  }

  update() { 
    const playerStatus = this.cache.json.get('playerStatus');
    this.player.setVelocity(0);
    
    if (!this.inDialogue) {
      if (this.cursor.left.isDown || this.keys.A.isDown) {
        this.player.setVelocityX(-playerStatus.playerSpeed * 0.75);
      } else if (this.cursor.right.isDown || this.keys.D.isDown) {
        this.player.setVelocityX(playerStatus.playerSpeed * 0.75);
      }
      if (this.cursor.up.isDown || this.keys.W.isDown) {
        this.player.setVelocityY(-playerStatus.playerSpeed * 0.75);
      } else if (this.cursor.down.isDown || this.keys.S.isDown) {
        this.player.setVelocityY(playerStatus.playerSpeed * 0.75);
      }
    }

    if (this.isHintVisible && !this.physics.world.overlap(this.player, this.currentHintObject)) {
      if(this.currentHintObject.getData('type') === 'PC_Hint' && !this.inDialogue) {
        displayHint("github info", false);
        this.isHintVisible = false;
        this.currentHintObject = null;
      }
    }
  }

  onPCCollision() {
    
    if (this.pcCooldown || this.inDialogue) return;
    
    this.pcCooldown = true;
    this.inDialogue = true;
    
    displayDialogue(this.cache.json.get('dialogue').PC, () => {
      this.inDialogue = false;
    });

    this.time.delayedCall(this.cooldownTime, () => {
      this.pcCooldown = false;
    });
    
  }

  onPCHintCollision() {
    displayHint("github info");
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
    }
  },
};

const game = new Phaser.Game(config);