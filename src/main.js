import Phaser from 'phaser';
import './style.css';  // Single CSS import

const size = {
  width: 900,
  height: 600,
};

const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  canvas: document.getElementById('gameCanvas'),
  scene: {
    preload: function() {
      // Load your assets here
      // this.load.image('key', 'path/to/image.png');
    },
    create: function() {
      this.add.text(100, 100, "Game Loaded!", { 
        font: "32px Arial", 
        fill: "#ffffff" 
      });
    }
  }
};

const game = new Phaser.Game(config);