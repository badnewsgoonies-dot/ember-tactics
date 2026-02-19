import Phaser from 'phaser';
import { TEAM_COLORS, TERRAIN_COLORS, type TerrainName, type UnitClassName } from '../config';
import { darken, lighten } from './ColorUtils';

const UNIT_CLASSES: UnitClassName[] = ['Knight', 'Archer', 'Mage', 'Healer', 'Cavalier', 'Thief'];
const TERRAIN_TYPES: TerrainName[] = [
  'Plains',
  'Forest',
  'Hill',
  'Water',
  'Mountain',
  'Fort',
  'Bridge',
  'Fire'
];

export class TextureGenerator {
  constructor(private readonly scene: Phaser.Scene) {}

  generateAll(): void {
    this.generateUnitTextures();
    this.generateTerrainTextures();
    this.generateUITextures();
    this.generatePortraitTextures();
    this.generateParticleTextures();
  }

  generateUnitTextures(): void {
    const teams = Object.entries(TEAM_COLORS) as Array<[keyof typeof TEAM_COLORS, number]>;

    for (const unitClass of UNIT_CLASSES) {
      for (const [team, color] of teams) {
        const key = `unit_${unitClass.toLowerCase()}_${team}`;

        this.createTexture(key, 48, 48, (graphics) => {
          const stroke = darken(color, 0.45);

          graphics.fillStyle(color, 1);
          graphics.lineStyle(2, stroke, 1);

          switch (unitClass) {
            case 'Knight':
              graphics.beginPath();
              graphics.moveTo(8, 10);
              graphics.lineTo(40, 10);
              graphics.lineTo(44, 24);
              graphics.lineTo(24, 42);
              graphics.lineTo(4, 24);
              graphics.closePath();
              graphics.fillPath();
              graphics.strokePath();
              break;

            case 'Archer':
              graphics.fillRect(18, 14, 12, 22);
              graphics.fillCircle(24, 10, 6);
              graphics.lineStyle(3, stroke, 1);
              graphics.beginPath();
              graphics.arc(34, 24, 10, Phaser.Math.DegToRad(260), Phaser.Math.DegToRad(100), true);
              graphics.strokePath();
              break;

            case 'Mage':
              graphics.beginPath();
              graphics.moveTo(24, 8);
              graphics.lineTo(6, 40);
              graphics.lineTo(42, 40);
              graphics.closePath();
              graphics.fillPath();
              graphics.strokePath();
              graphics.fillStyle(lighten(color, 0.28), 1);
              graphics.fillCircle(36, 12, 4);
              break;

            case 'Healer':
              graphics.fillRect(18, 8, 12, 32);
              graphics.fillRect(8, 18, 32, 12);
              graphics.lineStyle(2, stroke, 1);
              graphics.strokeRect(18, 8, 12, 32);
              graphics.strokeRect(8, 18, 32, 12);
              break;

            case 'Cavalier':
              graphics.fillRect(6, 24, 36, 14);
              graphics.beginPath();
              graphics.moveTo(24, 8);
              graphics.lineTo(18, 24);
              graphics.lineTo(30, 24);
              graphics.closePath();
              graphics.fillPath();
              graphics.strokeRect(6, 24, 36, 14);
              graphics.strokeTriangle(24, 8, 18, 24, 30, 24);
              break;

            case 'Thief':
              graphics.beginPath();
              graphics.moveTo(24, 6);
              graphics.lineTo(38, 24);
              graphics.lineTo(24, 42);
              graphics.lineTo(10, 24);
              graphics.closePath();
              graphics.fillPath();
              graphics.strokePath();
              break;
          }
        });
      }
    }
  }

  generateTerrainTextures(): void {
    for (const terrain of TERRAIN_TYPES) {
      const key = `terrain_${terrain.toLowerCase()}`;
      this.createTexture(key, 64, 64, (graphics) => this.drawTerrainTile(graphics, terrain, 64));
    }
  }

  generateUITextures(): void {
    this.createTexture('ui_button', 220, 56, (graphics) => {
      graphics.fillStyle(0x2f3f6a, 1);
      graphics.fillRoundedRect(0, 0, 220, 56, 10);
      graphics.lineStyle(2, 0x5f7fba, 1);
      graphics.strokeRoundedRect(1, 1, 218, 54, 10);
    });

    this.createTexture('ui_button_hover', 220, 56, (graphics) => {
      graphics.fillStyle(0x415a93, 1);
      graphics.fillRoundedRect(0, 0, 220, 56, 10);
      graphics.lineStyle(2, 0x9eb6ff, 1);
      graphics.strokeRoundedRect(1, 1, 218, 54, 10);
    });

    this.createTexture('ui_panel', 320, 220, (graphics) => {
      graphics.fillStyle(0x1c2237, 0.92);
      graphics.fillRoundedRect(0, 0, 320, 220, 12);
      graphics.lineStyle(2, 0x41507a, 1);
      graphics.strokeRoundedRect(1, 1, 318, 218, 12);
    });

    this.createTexture('ui_portrait_placeholder', 64, 64, (graphics) => {
      graphics.fillStyle(0x2a2a2a, 1);
      graphics.fillRect(0, 0, 64, 64);
      graphics.lineStyle(2, 0x666666, 1);
      graphics.strokeRect(1, 1, 62, 62);
      graphics.lineBetween(12, 52, 52, 12);
    });
  }

  generatePortraitTextures(): void {
    for (const unitClass of UNIT_CLASSES) {
      const key = `portrait_${unitClass.toLowerCase()}`;

      this.createTexture(key, 64, 64, (graphics) => {
        graphics.fillStyle(0x2d3550, 1);
        graphics.fillRect(0, 0, 64, 64);

        graphics.fillStyle(0xf2d0a7, 1);
        graphics.fillCircle(32, 28, 16);

        graphics.fillStyle(0x1d1d1d, 1);
        graphics.fillCircle(26, 26, 2);
        graphics.fillCircle(38, 26, 2);
        graphics.fillRect(27, 35, 10, 2);

        graphics.fillStyle(0xd7b588, 1);
        switch (unitClass) {
          case 'Knight':
            graphics.fillRect(16, 8, 32, 8);
            break;
          case 'Archer':
            graphics.lineStyle(3, 0x785a30, 1);
            graphics.beginPath();
            graphics.arc(48, 30, 9, Phaser.Math.DegToRad(250), Phaser.Math.DegToRad(110), true);
            graphics.strokePath();
            break;
          case 'Mage':
            graphics.beginPath();
            graphics.moveTo(32, 4);
            graphics.lineTo(20, 16);
            graphics.lineTo(44, 16);
            graphics.closePath();
            graphics.fillPath();
            break;
          case 'Healer':
            graphics.fillRect(30, 6, 4, 16);
            graphics.fillRect(24, 12, 16, 4);
            break;
          case 'Cavalier':
            graphics.fillRect(12, 44, 40, 10);
            break;
          case 'Thief':
            graphics.beginPath();
            graphics.moveTo(32, 8);
            graphics.lineTo(44, 20);
            graphics.lineTo(32, 32);
            graphics.lineTo(20, 20);
            graphics.closePath();
            graphics.fillPath();
            break;
        }
      });
    }
  }

  generateParticleTextures(): void {
    const particleDefs: Array<{ key: string; color: number }> = [
      { key: 'particle_fire', color: 0xff6622 },
      { key: 'particle_ice', color: 0x77ccff },
      { key: 'particle_heal', color: 0x55ff88 },
      { key: 'particle_lightning', color: 0xfff266 },
      { key: 'particle_dust', color: 0xc2a57a }
    ];

    for (const particle of particleDefs) {
      this.createTexture(particle.key, 8, 8, (graphics) => {
        graphics.fillStyle(particle.color, 1);
        graphics.fillCircle(4, 4, 3);
      });
    }
  }

  private createTexture(
    key: string,
    width: number,
    height: number,
    drawFn: (graphics: Phaser.GameObjects.Graphics) => void
  ): void {
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }

    const graphics = this.scene.add.graphics();
    graphics.clear();
    drawFn(graphics);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  private drawTerrainTile(
    graphics: Phaser.GameObjects.Graphics,
    terrain: TerrainName,
    size: number
  ): void {
    const baseColor = TERRAIN_COLORS[terrain];
    graphics.fillStyle(baseColor, 1);
    graphics.fillRect(0, 0, size, size);

    switch (terrain) {
      case 'Forest': {
        graphics.fillStyle(darken(baseColor, 0.35), 0.7);
        const dots = [
          [11, 10],
          [24, 14],
          [40, 11],
          [16, 28],
          [33, 24],
          [48, 28],
          [10, 47],
          [26, 44],
          [43, 48]
        ];
        dots.forEach(([x, y]) => graphics.fillCircle(x, y, 3));
        break;
      }

      case 'Hill':
        graphics.lineStyle(2, darken(baseColor, 0.3), 0.65);
        graphics.strokeEllipse(size * 0.32, size * 0.58, size * 0.42, size * 0.24);
        graphics.strokeEllipse(size * 0.52, size * 0.45, size * 0.56, size * 0.34);
        graphics.strokeEllipse(size * 0.72, size * 0.34, size * 0.38, size * 0.2);
        break;

      case 'Water':
        graphics.lineStyle(2, lighten(baseColor, 0.24), 0.75);
        for (let y = 11; y <= 51; y += 13) {
          graphics.beginPath();
          graphics.moveTo(6, y);
          graphics.lineTo(18, y - 3);
          graphics.lineTo(30, y + 2);
          graphics.lineTo(42, y - 2);
          graphics.lineTo(58, y + 3);
          graphics.strokePath();
        }
        break;

      case 'Fort':
        graphics.fillStyle(darken(baseColor, 0.22), 0.95);
        graphics.fillRect(12, 28, 40, 24);
        graphics.fillRect(20, 20, 8, 8);
        graphics.fillRect(36, 20, 8, 8);
        graphics.fillStyle(0x6b4f2a, 1);
        graphics.fillRect(30, 10, 2, 18);
        graphics.fillStyle(0xcc2222, 1);
        graphics.beginPath();
        graphics.moveTo(32, 10);
        graphics.lineTo(45, 14);
        graphics.lineTo(32, 18);
        graphics.closePath();
        graphics.fillPath();
        break;

      case 'Bridge':
        graphics.fillStyle(darken(baseColor, 0.15), 0.65);
        for (let x = 4; x < 64; x += 10) {
          graphics.fillRect(x, 0, 3, 64);
        }
        graphics.lineStyle(2, darken(baseColor, 0.35), 0.8);
        graphics.lineBetween(0, 6, 64, 6);
        graphics.lineBetween(0, 58, 64, 58);
        break;

      case 'Fire': {
        graphics.fillStyle(0xffaa33, 0.68);
        const sparks = [
          [12, 17],
          [21, 10],
          [30, 22],
          [40, 14],
          [50, 24],
          [17, 39],
          [29, 42],
          [41, 33],
          [52, 45]
        ];
        sparks.forEach(([x, y]) => graphics.fillCircle(x, y, 2));
        break;
      }

      case 'Mountain':
        graphics.fillStyle(0x5f5f5f, 0.85);
        graphics.beginPath();
        graphics.moveTo(8, 56);
        graphics.lineTo(24, 20);
        graphics.lineTo(36, 38);
        graphics.lineTo(48, 14);
        graphics.lineTo(58, 56);
        graphics.closePath();
        graphics.fillPath();
        break;

      default:
        break;
    }
  }
}
