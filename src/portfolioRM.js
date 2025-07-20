import Phaser from 'phaser'; 
import { displayDialogue, displayHint, playerMovement } from './utils.js';
import GameScene from './main.js';

class portfolioRM extends Phaser.Scene {
    constructor() {
        super({ key: 'portfolioRM' });
        this.Cooldown = false;
        this.cooldownTime = 2000; 
        this.isHintVisible = false;
        this.currentHintObject = null;
    }

    preload() {
        this.load.image('protagonist_64x64', 'character/player/protagonist_64x64.png');
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
        this.load.tilemapTiledJSON('portfolioRM', 'map/portfolioRM/portfolioRM.json');
    }

    create() {
        //display hitbox
        //this.physics.world.createDebugGraphic();

        // Map setup
        const map = this.add.tilemap('portfolioRM');
        const tileset = map.addTilesetImage('spreadsheet64x64', 'spreadsheet');
        const portfolioRM = map.createLayer('portfolioRM', tileset, -125, -80).setScale(0.75);
        const border = map.createLayer('border', tileset, -125, -80).setScale(0.75);  
        const decoration = map.createLayer('decoration', tileset, -125, -80).setScale(0.75);
        const RMobj = map.getObjectLayer('obj').objects;

        // Player setup at spawnPT location from map
        const spawnPoint = RMobj.find(obj => obj.name === 'spawnPT');
        const spawnX = spawnPoint ? spawnPoint.x * 0.75 - 125 : size.width / 2;
        const spawnY = spawnPoint ? spawnPoint.y * 0.75 - 80 : size.height / 2;
        this.player = this.physics.add.sprite(spawnX, spawnY, 'protagonist_64x64')
        .setScale(1)
        .setDepth(1000)
        .setSize(45, 65)
        .setOffset(10, 0);
        this.player.setCollideWorldBounds(true);



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

        this.cursor = this.input.keyboard.createCursorKeys();

        // Tilemap collisions
        this.physics.add.collider(this.player, border);
        border.setCollisionBetween(1, 100, true, true);
        this.physics.add.collider(this.player, decoration);
        decoration.setCollisionBetween(1, 100, true, true);

        //obj collisions
        this.interactables = this.physics.add.staticGroup();
        this.academic = this.physics.add.staticGroup();
        this.spawnRM = this.physics.add.staticGroup();
        this.undeveloped = this.physics.add.staticGroup();

        RMobj.forEach(obj => {
        const x = obj.x * 0.75 - 125;
        const y = obj.y * 0.75 - 80;
        const width = obj.width * 0.75;
        const height = obj.height * 0.75;
        
            if (obj.name === 'academic') {
                // Add academic to its own group with collision
                const hitbox = this.academic.create(x + width / 2, y - height / 2 + 10, null)
                .setScale(1.5)
                .setData('type', obj.name)
                .setVisible(false)
                .refreshBody();


            } else if (obj.name === 'JRPGMap') {
               const hitbox = this.undeveloped.create(x + width / 2, y + 3.4*height , null)
                .setScale(10.5)
                .setData('type', obj.name)
                .setVisible(false)
                .refreshBody();
                
            
            }else if (obj.name === 'undevelop') {
               const hitbox = this.undeveloped.create(x + 1.5*width, y + height / 2, null)
                .setScale(4.5)
                .setData('type', obj.name)
                .setVisible(false)
                .refreshBody(); 
            } else if (obj.name === 'spawnRM') {
               const hitbox = this.spawnRM.create(x - 0.5 * width, y + height / 2, null)
                .setScale(4.5)
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

        this.physics.add.collider(this.player, this.academic, (player, obj) => {
            if (!this.Cooldown && !this.inDialogue && obj.getData('type') === 'academic') {
                console.log('Academic collision detected');
                displayHint("academic info", false);
                this.onAcademicCollision();
            }
        });

        this.physics.add.collider(this.player, this.undeveloped, (player, obj) => {
            if (!this.Cooldown && !this.inDialogue ) {
                console.log('undeveloped collision detected');
                this.onUndevelopedCollision();
            }
        });

        this.physics.add.collider(this.player, this.spawnRM, (player, obj) => {
            if (!this.Cooldown && !this.inDialogue ) {
                console.log('spawnRM collision detected');
                //displayHint("github info", false);
                this.onSpawnRMCollision();
            }
        });

        // Overlap for other interactables 
        this.physics.add.overlap(this.player, this.interactables, (player, obj) => {
            const type = obj.getData('type');
            if (type === 'academic_hint') {
                if (!this.isHintVisible) {
                    this.currentHintObject = obj;
                    displayHint("academic info", true);
                    this.isHintVisible = true;
                }
            }
        }, null, this);

        this.physics.add.overlap(this.player, this.interactables, (player, obj) => {
            const type = obj.getData('type');
            if (type === 'JRPG_hint') {
                if (!this.isHintVisible) {
                    this.currentHintObject = obj;
                    displayHint("Moving forward will start the JRPG(InDevelopment)", true);
                    this.isHintVisible = true;
                }
            }
        }, null, this);


    }

    update() {
        const Pstatus = this.registry.get('playerStatus');
        
        if (!this.inDialogue) {
            playerMovement(this, this.player, this.cursor, Pstatus.playerSpeed, 0.75);
        } else {
            this.player.setVelocity(0);
        }

        if (this.isHintVisible && !this.physics.world.overlap(this.player, this.currentHintObject)) {
            const type = this.currentHintObject.getData('type');
            if (type === 'academic_hint') {
                displayHint("academic info", false);
            } else if (type === 'JRPG_hint') {
                displayHint("Moving forward will start the JRPG(InDevelopment)", false);
            }
            this.isHintVisible = false;
            this.currentHintObject = null;
        }
    }

    onAcademicCollision() {
        if (this.Cooldown || this.inDialogue) return;
        displayHint("academic info", false);
        this.Cooldown = true;
        this.inDialogue = true;
        displayDialogue(this.cache.json.get('dialogue').academic, () => {
        this.inDialogue = false;
        });
        this.time.delayedCall(this.cooldownTime, () => {
        this.Cooldown = false;
        });
  }

  
  onUndevelopedCollision() {
    if (this.Cooldown || this.inDialogue) return;
    this.Cooldown = true;
    this.inDialogue = true;
    displayHint("Moving forward will start the JRPG(InDevelopment)", false);
    displayDialogue(this.cache.json.get('dialogue').inDevelopment, () => {
        this.inDialogue = false;
    });
    this.time.delayedCall(this.cooldownTime, () => {
        this.Cooldown = false;
    });
  }

  onSpawnRMCollision(){
    this.scene.start('GameScene');
  }
}

export default portfolioRM;

