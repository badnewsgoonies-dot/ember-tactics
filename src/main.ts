import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { BootScene } from './scenes/BootScene';
import { BattleScene } from './scenes/BattleScene';
import { DefeatScene } from './scenes/DefeatScene';
import { DialogueScene } from './scenes/DialogueScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { TitleScene } from './scenes/TitleScene';
import { VictoryScene } from './scenes/VictoryScene';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: '#0a0a0a',
  scene: [
    BootScene,
    TitleScene,
    LevelSelectScene,
    DialogueScene,
    BattleScene,
    VictoryScene,
    DefeatScene,
    GameOverScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export const game = new Phaser.Game(gameConfig);
