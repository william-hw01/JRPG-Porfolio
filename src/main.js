// Remove this import since we're linking CSS directly in HTML
// import './style.css';
import Phaser from 'phaser';

const size = {
  width: 900,
  height: 600,
};

const config = {
  type: Phaser.WEBGL,
  width: size.width,
  height: size.height,
  canvas: document.getElementById('gameCanvas'),
  // Add basic scene configuration
  scene: {
    preload: function() {},
    create: function() {
      this.add.text(100, 100, "Game Loaded!", { 
        font: "32px Arial", 
        fill: "#ffffff" 
      });
    }
  }
};

const game = new Phaser.Game(config);