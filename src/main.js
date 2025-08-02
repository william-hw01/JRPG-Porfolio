import Phaser from 'phaser';
import './style.css'; 
import { displayDialogue, displayHint, playerMovement } from './utils.js';
import portfolioRM from './portfolioRM.js';

const now = new Date();
const size = {
  width: 900,
  height: 600,
};

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.pcCooldown = false;
    this.cooldownTime = 2000; 
    this.isHintVisible = false;
    this.currentHintObject = null;
  }
  
  preload() {
    //protagonist
    this.load.image('protagonist_64x64', 'character/player/protagonist_64x64.png');
    this.load.image('protagonist_hurt','character/player/protagonist_hurt.png');
    this.load.image('protagonist_angry','character/player/protagonist_angry.png');
    this.load.image('protagonist_back_leftWalk','character/player/moveSet/protagonist_back_leftWalk.png');
    this.load.image('protagonist_back_rightWalk','character/player/moveSet/protagonist_back_rightWalk.png');
    this.load.image('protagonist_back','character/player/moveSet/protagonist_back.png');
    this.load.image('protagonist_front_leftWalk','character/player/moveSet/protagonist_front_leftWalk.png');
    this.load.image('protagonist_front_rightWalk','character/player/moveSet/protagonist_front_rightWalk.png');
    this.load.image('protagonist_left_walk','character/player/moveSet/protagonist_left_walk.png');
    this.load.image('protagonist_left','character/player/moveSet/protagonist_left.png');
    this.load.image('protagonist_right_walk','character/player/moveSet/protagonist_right_walk.png');
    this.load.image('protagonist_right','character/player/moveSet/protagonist_right.png');


    this.load.json('playerStatus', 'character/player/playerStatus.json');
    this.load.json('dialogue', 'character/player/dialogue.json');
    this.load.image('spreadsheet', 'spreadsheet64x64.png');
    this.load.tilemapTiledJSON('spawnMap', 'map/spawnPT/spawnPT64.json');
    
  }

  create() {
    //debug purpose
    //this.scene.start('portfolioRM');
    //this.physics.world.createDebugGraphic();

    // Set player status in registry to loaded JSON data
    const playerStatus = this.cache.json.get('playerStatus');
    this.registry.set('playerStatus', playerStatus);
    const Pstatus = this.registry.get('playerStatus');

    // Map setup
    const map = this.add.tilemap('spawnMap');
    const tileset = map.addTilesetImage('spreadsheet64x64', 'spreadsheet');
    const spawnRM = map.createLayer('spawnRM', tileset, -125, -80).setScale(0.75);
    const border = map.createLayer('border', tileset, -125, -80).setScale(0.75);  
    const decoration = map.createLayer('decoration', tileset, -125, -80).setScale(0.75);
    const decoration_u = map.createLayer('decoration_u', tileset, -125, -80).setScale(0.75);
    const spawnPTObj = map.getObjectLayer('spawnPT').objects;

    // Player setup at spawnPT location from map
    let spawnX, spawnY;
    if(Pstatus.intro) {
      spawnX = size.width / 2;
      spawnY = size.height / 2;
    } else {
      const spawnPoint = spawnPTObj.find(obj => obj.name === 'spawnPT');
      spawnX = spawnPoint ? spawnPoint.x * 0.75 - 125 : size.width / 2;
      spawnY = spawnPoint ? spawnPoint.y * 0.75 - 80 : size.height / 2;
    }
    this.player = this.physics.add.sprite(spawnX, spawnY, 'protagonist_64x64')
        .setScale(1)
        .setDepth(1000)
        .setSize(45, 65)
        .setOffset(10, 0);
    this.player.setCollideWorldBounds(true);
    this.player.setInteractive();
    this.player.on('pointerdown', (pointer) => {
      if(Pstatus.clickCount >= 49 && !this.inDialogue) {
        this.player.setTexture('protagonist_angry');
        this.inDialogue = true;
        displayDialogue(this.cache.json.get('dialogue').delete, () => {
          Pstatus.clickCount = 0;
          this.registry.set('playerStatus', Pstatus);
          this.player.destroy();
          this.player = null;
        });
      }
      if(!this.inDialogue) {
        this.player.setTexture('protagonist_hurt');
        Pstatus.clickCount++;
        this.inDialogue = true;
        displayDialogue(["*ouch*"], () => {
          this.inDialogue = false;
          this.player.setTexture('protagonist_64x64');
        });
        //console.log('Player clicked! Count:', Pstatus.clickCount);

      }
    });

    this.inDialogue = Pstatus.intro;
    this.cursor = this.input.keyboard.createCursorKeys();

    this.anims.create({
        key: 'right_walk',
        frames: [
            { key: 'protagonist_right_walk' },
            { key: 'protagonist_right' },
        ],
        frameRate: 7,
        repeat: -1
    });

    this.anims.create({
        key: 'left_walk',
        frames: [
            { key: 'protagonist_left_walk' },
            { key: 'protagonist_left' },
        ],
        frameRate: 7,
        repeat: -1
    });

    this.anims.create({
      key: 'back_walk',
      frames: [
          { key: 'protagonist_back_leftWalk' },
          { key: 'protagonist_back' },
          { key: 'protagonist_back_rightWalk' },
      ],
      frameRate: 7,
      repeat: -1
    });

      this.anims.create({
        key: 'front_walk',
        frames: [
            { key: 'protagonist_front_leftWalk' },
            { key: 'protagonist_front_rightWalk' },
        ],
        frameRate: 7,
        repeat: -1
      });

    // Tilemap collisions
    this.physics.add.collider(this.player, border);
    border.setCollisionBetween(1, 100, true, true);
    this.physics.add.collider(this.player, decoration);
    decoration.setCollisionBetween(1, 100, true, true);

    // PC object setup with scaled collision
    this.interactables = this.physics.add.staticGroup();
    this.pcGroup = this.physics.add.staticGroup(); // Separate group for PC
    this.portfolioRM = this.physics.add.staticGroup();
    spawnPTObj.forEach(obj => {
      const x = obj.x * 0.75 - 125;
      const y = obj.y * 0.75 - 80;
      const width = obj.width * 0.75;
      const height = obj.height * 0.75;
      
      if (obj.name === 'PC') {
        // Add PC to its own group with collision
        const hitbox = this.pcGroup.create(x + width / 2, y + height/4, null)
          .setScale(4.51)
          .setData('type', obj.name)
          .setVisible(false)
          .refreshBody();


      } else if (obj.name === 'portfolioRM') {
        // Add portfolioRM to its own group with collision
        const hitbox = this.portfolioRM.create(x + width + 0.9*width  , y + height / 2, null)
          .setScale(6)
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

    this.physics.add.collider(this.player, this.portfolioRM, (player, obj) => {
      if (!this.pcCooldown && !this.inDialogue && obj.getData('type') === 'portfolioRM') {
        //console.log('portfolioRM collision detected');
        //displayHint("github info", false);
        this.onPortfolioRMCollision();
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


    if (Pstatus.intro) {
      displayDialogue(this.cache.json.get('dialogue').intro, () => {
        this.inDialogue = false;
        Pstatus.intro = false;
        this.registry.set('playerStatus', Pstatus);
      });
    }

    if(now.getHours() > 6 && now.getHours() < 18) {
      document.body.style.backgroundColor = "#b0e2ff"; 
    }
    else if(now.getHours() >=18 && now.getHours() <= 19) {
      document.body.style.backgroundColor = "#d85f3aff"; 
    }
    else{
      document.body.style.backgroundColor = "#070058ff";
    }

  }

  update() { 
    const Pstatus = this.registry.get('playerStatus');

    if (!this.inDialogue) {
      playerMovement(this, this.player, this.cursor, Pstatus.playerSpeed, 0.75);
    } else {
      this.player.setVelocity(0);
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

  onPortfolioRMCollision() {
    this.scene.start('portfolioRM');
  }

  onPCHintCollision() {
    displayHint("github info");
  }
}
export default GameScene;

const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  canvas: document.getElementById('gameCanvas'),
  transparent: true,
  backgroundColor: '#ffffff',
  scene: [GameScene, portfolioRM],
  physics: { 
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    }
  },
};

const game = new Phaser.Game(config);