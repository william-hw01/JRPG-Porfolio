import './style.css';
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
};

const game = new Phaser.Game(config);