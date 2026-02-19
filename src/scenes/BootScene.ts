import Phaser from 'phaser';
import { TextureGenerator } from '../utils/TextureGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const textureGenerator = new TextureGenerator(this);
    textureGenerator.generateAll();
    this.scene.start('TitleScene');
  }
}
