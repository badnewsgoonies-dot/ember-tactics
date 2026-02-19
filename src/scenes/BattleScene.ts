import Phaser from 'phaser';
import { planAITurn } from '../ai/AIController';
import { getAbility } from '../combat/AbilityDefs';
import { applyAbilityCost, canUseAbility, getAoETiles } from '../combat/AbilitySystem';
import { resolveCombat } from '../combat/CombatSystem';
import { calcDamage } from '../combat/DamageCalculation';
import { checkLevelUp, xpForKill } from '../combat/ExperienceSystem';
import { GRID_COLS, GRID_ROWS, TILE_SIZE, TEAM_COLORS } from '../config';
import { CombatAnimation } from '../effects/CombatAnimation';
import { ParticleManager } from '../effects/ParticleManager';
import { ProjectileRenderer } from '../effects/ProjectileRenderer';
import { ScreenEffects } from '../effects/ScreenEffects';
import { TileEffects } from '../effects/TileEffects';
import { GridHighlight } from '../grid/GridHighlight';
import { GridManager } from '../grid/GridManager';
import { GridRenderer } from '../grid/GridRenderer';
import { getAttackRange, getMovementRange } from '../grid/Pathfinding';
import { applyTerrainToRange } from '../grid/TerrainEffects';
import type { TerrainType } from '../grid/TileTypes';
import type { DialogueLine } from '../levels/DialogueData';
import { getLevelDialogue } from '../levels/DialogueData';
import type { LevelDef, LevelUnitDef } from '../levels/LevelDefs';
import { checkDefeat, checkObjective } from '../levels/ObjectiveSystem';
import { checkReinforcements, spawnReinforcements, type ReinforcementWave } from '../levels/ReinforcementSystem';
import { getLevelDef, initLevel } from '../levels/LevelManager';
import { ActionMenu } from '../turn/ActionMenu';
import { InputHandler } from '../turn/InputHandler';
import { PhaseTransition } from '../turn/PhaseTransition';
import {
  allUnitsActed,
  applyEnvironmentEffects,
  createTurnState,
  isEnemyPhase,
  isPlayerPhase,
  markUnitDone,
  nextPhase,
  type TurnState
} from '../turn/TurnManager';
import { TurnOrderBar } from '../turn/TurnOrderBar';
import { createStatus } from '../units/StatusEffects';
import { UnitAnimations } from '../units/UnitAnimations';
import type { UnitData } from '../units/Unit';
import { damageUnit, healUnit } from '../units/Unit';
import type { UnitClass } from '../units/UnitClasses';
import { createAllyUnit, createEnemyUnit, createPlayerUnit } from '../units/UnitFactory';
import { DamagePopup } from '../ui/DamagePopup';
import { HUD } from '../ui/HUD';
import { MinimapOverlay } from '../ui/MinimapOverlay';
import { TerrainInfoPanel } from '../ui/TerrainInfoPanel';
import { UnitInfoPanel } from '../ui/UnitInfoPanel';
import { gridDistance } from '../utils/MathUtils';

interface UnitSeed {
  name: string;
  class: UnitClass;
  level: number;
  x: number;
  y: number;
}

interface BattleResumeState {
  units: UnitData[];
  turnState: TurnState;
  reinforcementWaves: ReinforcementWave[];
  initialPlayerUnitIds: string[];
  unitsLost: number;
  xpGained: number;
  midDialogueShown: boolean;
}

interface BattleInitData {
  levelId?: number;
  mapData?: TerrainType[][];
  playerUnits?: UnitSeed[];
  enemyUnits?: UnitSeed[];
  allyUnits?: UnitSeed[];
  skipPreBattleDialogue?: boolean;
  resumeState?: BattleResumeState;
}

export class BattleScene extends Phaser.Scene {
  gridManager!: GridManager;
  gridRenderer!: GridRenderer;
  gridHighlight!: GridHighlight;
  inputHandler!: InputHandler;
  turnState!: TurnState;
  turnOrderBar!: TurnOrderBar;
  actionMenu!: ActionMenu;
  phaseTransition!: PhaseTransition;
  unitAnimations!: UnitAnimations;
  hud!: HUD;
  unitInfoPanel!: UnitInfoPanel;
  terrainInfoPanel!: TerrainInfoPanel;
  damagePopup!: DamagePopup;
  particleManager!: ParticleManager;
  screenEffects!: ScreenEffects;
  combatAnimation!: CombatAnimation;
  projectileRenderer!: ProjectileRenderer;
  tileEffects!: TileEffects;
  minimapOverlay!: MinimapOverlay;
  units: UnitData[] = [];
  unitSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  selectedUnit: UnitData | null = null;
  currentAction: 'idle' | 'selectingMove' | 'selectingAttack' | 'selectingAbility' | 'enemyTurn' | 'animating' = 'idle';

  private levelId = 1;
  private levelName = 'Skirmish';
  private objectiveLabel = 'Defeat all enemies';
  private objectiveType = 'defeat_all';
  private objectiveTarget: string | undefined;
  private surviveTurns: number | undefined;
  private hoveredTile: { x: number; y: number } | null = null;
  private mapData: TerrainType[][] = [];
  private playerSeeds: UnitSeed[] = [];
  private enemySeeds: UnitSeed[] = [];
  private allySeeds: UnitSeed[] = [];
  private initialUnits: UnitData[] = [];
  private initialPlayerUnitIds: string[] = [];
  private restoredTurnState: TurnState | null = null;
  private reinforcementWaves: ReinforcementWave[] = [];
  private preBattleDialogue: DialogueLine[] = [];
  private midBattleDialogue: DialogueLine[] = [];
  private postBattleDialogue: DialogueLine[] = [];
  private midTriggerTurn: number | undefined;
  private midDialogueShown = false;
  private skipPreBattleDialogue = false;
  private unitsLost = 0;
  private xpGained = 0;
  private battleEnded = false;

  private movementTiles: Array<{ x: number; y: number }> = [];
  private attackTiles: Array<{ x: number; y: number }> = [];
  private abilityTiles: Array<{ x: number; y: number }> = [];

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: BattleInitData): void {
    const incoming: BattleInitData = data ?? {};

    this.levelId = incoming.levelId ?? 1;
    this.battleEnded = false;
    this.midDialogueShown = false;
    this.skipPreBattleDialogue = incoming.skipPreBattleDialogue ?? false;
    this.unitsLost = 0;
    this.xpGained = 0;
    this.restoredTurnState = null;
    this.selectedUnit = null;
    this.currentAction = 'idle';

    const levelDef = getLevelDef(this.levelId);
    this.levelName = levelDef?.name ?? `Skirmish ${this.levelId}`;
    this.objectiveLabel = this.getObjectiveLabel(levelDef);
    this.objectiveType = levelDef?.objectiveType ?? 'defeat_all';
    this.objectiveTarget = levelDef?.objectiveTarget;
    this.surviveTurns = levelDef?.objectiveType === 'survive' ? levelDef.starCriteria.turns : undefined;

    this.mapData = incoming.mapData ?? levelDef?.mapGetter() ?? this.createDefaultMap();

    const dialogue = getLevelDialogue(this.levelId);
    this.preBattleDialogue = [...dialogue.pre];
    this.midBattleDialogue = [...(dialogue.mid ?? [])];
    this.postBattleDialogue = [...dialogue.post];
    this.midTriggerTurn = dialogue.midTriggerTurn;

    this.reinforcementWaves = levelDef?.reinforcements
      ? [
          {
            turn: levelDef.reinforcements.turn,
            units: levelDef.reinforcements.units,
            spawned: false
          }
        ]
      : [];

    if (incoming.resumeState) {
      this.applyResumeState(incoming.resumeState);
      this.skipPreBattleDialogue = true;
      return;
    }

    if (levelDef) {
      const levelState = initLevel(this.levelId);
      this.objectiveType = levelState.objectiveType;
      this.objectiveTarget = levelState.objectiveTarget;
      this.reinforcementWaves = levelState.reinforcementWaves.map((wave) => ({
        ...wave,
        units: [...wave.units]
      }));
      this.preBattleDialogue = [...levelState.dialogue.pre];
      this.midBattleDialogue = [...(levelState.dialogue.mid ?? [])];
      this.postBattleDialogue = [...levelState.dialogue.post];
      this.midTriggerTurn = levelState.dialogue.midTriggerTurn;
      this.initialUnits = levelState.units.map((unit) => this.cloneUnit(unit));
      this.initialPlayerUnitIds = this.initialUnits
        .filter((unit) => unit.team === 'player')
        .map((unit) => unit.id);
    }

    this.playerSeeds = incoming.playerUnits ?? this.playerSeedsFromDefs(levelDef?.playerUnits);
    this.enemySeeds = incoming.enemyUnits ?? this.playerSeedsFromDefs(levelDef?.enemyUnits);
    this.allySeeds = incoming.allyUnits ?? this.playerSeedsFromDefs(levelDef?.allyUnits);

    if (incoming.playerUnits || incoming.enemyUnits || incoming.allyUnits || this.initialUnits.length === 0) {
      this.initialUnits = this.createUnitsFromSeeds();
      this.initialPlayerUnitIds = this.initialUnits
        .filter((unit) => unit.team === 'player')
        .map((unit) => unit.id);
    }
  }

  create(): void {
    if (!this.skipPreBattleDialogue && this.preBattleDialogue.length > 0) {
      this.scene.start('DialogueScene', {
        lines: this.preBattleDialogue,
        nextScene: 'BattleScene',
        nextSceneData: {
          levelId: this.levelId,
          skipPreBattleDialogue: true
        }
      });
      return;
    }

    this.gridManager = new GridManager(GRID_COLS, GRID_ROWS, TILE_SIZE);
    this.gridManager.loadMap(this.mapData.length > 0 ? this.mapData : this.createDefaultMap());

    this.gridRenderer = new GridRenderer(this, this.gridManager);
    this.gridRenderer.renderGrid();
    this.tileEffects = new TileEffects(this, this.gridManager);
    this.tileEffects.initAllEffects();

    this.gridHighlight = new GridHighlight(this, this.gridManager);

    this.units = this.initialUnits.map((unit) => this.cloneUnit(unit));
    this.unitSprites.clear();
    for (const unit of this.units) {
      this.createUnitSprite(unit);
    }

    this.inputHandler = new InputHandler(this, this.gridManager);
    this.inputHandler.onTileClick = (gridX, gridY) => {
      void this.handleTileClick(gridX, gridY);
    };
    this.inputHandler.onTileHover = (gridX, gridY) => {
      this.hoveredTile = { x: gridX, y: gridY };
      this.gridHighlight.showHoverTile(gridX, gridY);
      this.terrainInfoPanel.show(this.gridManager.getTerrain(gridX, gridY), gridX, gridY);

      const hoveredUnit = this.getAliveUnitAt(gridX, gridY);
      if (hoveredUnit) {
        this.unitInfoPanel.show(hoveredUnit);
      } else if (this.selectedUnit) {
        this.unitInfoPanel.show(this.selectedUnit);
      } else {
        this.unitInfoPanel.hide();
      }
    };
    this.inputHandler.onRightClick = () => {
      this.cancelCurrentSelection();
    };

    this.turnState = this.restoredTurnState
      ? this.cloneTurnState(this.restoredTurnState, this.units)
      : createTurnState(this.units);

    this.turnOrderBar = new TurnOrderBar(this);
    this.actionMenu = new ActionMenu(this);
    this.phaseTransition = new PhaseTransition(this);
    this.unitAnimations = new UnitAnimations(this);
    this.hud = new HUD(this);
    this.unitInfoPanel = new UnitInfoPanel(this);
    this.terrainInfoPanel = new TerrainInfoPanel(this);
    this.damagePopup = new DamagePopup(this);
    this.particleManager = new ParticleManager(this);
    this.screenEffects = new ScreenEffects(this);
    this.combatAnimation = new CombatAnimation(this, this.particleManager, this.screenEffects);
    this.projectileRenderer = new ProjectileRenderer(this);
    this.minimapOverlay = new MinimapOverlay(this, this.gridManager);

    this.actionMenu.onAction = (action) => {
      void this.handleMenuAction(action);
    };

    this.turnOrderBar.update(this.turnState);
    this.updateUnitsLost();
    this.inputHandler.disable();
    void this.enterCurrentPhase();
  }

  createUnitSprite(unit: UnitData): Phaser.GameObjects.Sprite {
    const key = `unit_${unit.unitClass.toLowerCase()}_${unit.team}`;
    const textureKey = this.ensureUnitTexture(key, unit.team);
    const pixel = this.gridManager.gridToPixel(unit.gridX, unit.gridY);
    const sprite = this.add.sprite(pixel.x, pixel.y, textureKey);
    sprite.setDepth(20);
    sprite.setScale(1);
    sprite.setFlipX(unit.facing === 'left');

    this.unitAnimations?.idleBob(sprite);
    this.unitSprites.set(unit.id, sprite);
    return sprite;
  }

  moveUnitSprite(unit: UnitData, toX: number, toY: number): Promise<void> {
    return new Promise((resolve) => {
      const sprite = this.unitSprites.get(unit.id);
      if (!sprite) {
        resolve();
        return;
      }

      const pixel = this.gridManager.gridToPixel(toX, toY);
      this.tweens.add({
        targets: sprite,
        x: pixel.x,
        y: pixel.y,
        duration: 220,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          this.unitAnimations.idleBob(sprite);
          resolve();
        }
      });
    });
  }

  removeUnitSprite(unitId: string): void {
    const sprite = this.unitSprites.get(unitId);
    if (!sprite) {
      return;
    }

    sprite.destroy();
    this.unitSprites.delete(unitId);
  }

  private async handleTileClick(gridX: number, gridY: number): Promise<void> {
    if (this.battleEnded) {
      return;
    }

    if (!isPlayerPhase(this.turnState) || this.currentAction === 'enemyTurn' || this.currentAction === 'animating') {
      return;
    }

    if (this.currentAction === 'selectingMove') {
      await this.tryMoveSelectedUnit(gridX, gridY);
      return;
    }

    if (this.currentAction === 'selectingAttack') {
      await this.tryAttackAtTile(gridX, gridY);
      return;
    }

    if (this.currentAction === 'selectingAbility') {
      await this.tryAbilityAtTile(gridX, gridY);
      return;
    }

    const clicked = this.getAliveUnitAt(gridX, gridY);
    if (!clicked) {
      this.cancelCurrentSelection();
      this.unitInfoPanel.hide();
      return;
    }

    if ((clicked.team === 'player' || clicked.team === 'ally') && !clicked.hasActed) {
      this.selectedUnit = clicked;
      this.gridHighlight.clearAll();
      this.unitInfoPanel.show(clicked);
      this.showActionMenuForUnit(clicked);
    }
  }

  private async handleMenuAction(action: 'move' | 'attack' | 'ability' | 'wait'): Promise<void> {
    const selected = this.getSelectedAliveUnit();
    if (!selected || !isPlayerPhase(this.turnState) || this.battleEnded) {
      return;
    }

    this.gridHighlight.clearAll();

    if (action === 'move') {
      this.actionMenu.hide();
      this.prepareMoveSelection(selected);
      return;
    }

    if (action === 'attack') {
      this.actionMenu.hide();
      this.prepareAttackSelection(selected);
      return;
    }

    if (action === 'ability') {
      this.actionMenu.hide();
      this.prepareAbilitySelection(selected);
      return;
    }

    this.actionMenu.hide();
    await this.finishUnitTurn(selected.id);
  }

  private prepareMoveSelection(unit: UnitData): void {
    const occupied = new Set(
      this.units
        .filter((other) => other.isAlive && other.id !== unit.id)
        .map((other) => `${other.gridX},${other.gridY}`)
    );

    this.movementTiles = getMovementRange(unit.gridX, unit.gridY, unit.mov, this.gridManager.grid, (x, y) => {
      return occupied.has(`${x},${y}`);
    });

    this.gridHighlight.showMovementRange(this.movementTiles);
    this.currentAction = 'selectingMove';
  }

  private prepareAttackSelection(unit: UnitData): void {
    const attackerTerrain = this.gridManager.getTerrain(unit.gridX, unit.gridY);
    const [minRange, maxRange] = applyTerrainToRange(
      attackerTerrain,
      unit.range[0],
      unit.range[1],
      unit.unitClass
    );

    this.attackTiles = getAttackRange(
      [{ x: unit.gridX, y: unit.gridY }],
      minRange,
      maxRange,
      this.gridManager.cols,
      this.gridManager.rows
    );

    this.gridHighlight.showAttackRange(this.attackTiles);
    this.currentAction = 'selectingAttack';
  }

  private prepareAbilitySelection(unit: UnitData): void {
    const ability = getAbility(unit.ability);
    if (!ability || !canUseAbility(unit, ability)) {
      this.currentAction = 'idle';
      return;
    }

    this.abilityTiles = getAttackRange(
      [{ x: unit.gridX, y: unit.gridY }],
      0,
      ability.range,
      this.gridManager.cols,
      this.gridManager.rows
    );

    this.gridHighlight.showAbilityRange(this.abilityTiles);
    this.currentAction = 'selectingAbility';
  }

  private async tryMoveSelectedUnit(gridX: number, gridY: number): Promise<void> {
    const selected = this.getSelectedAliveUnit();
    if (!selected) {
      return;
    }

    if (!this.containsTile(this.movementTiles, gridX, gridY)) {
      return;
    }

    const occupant = this.getAliveUnitAt(gridX, gridY);
    if (occupant && occupant.id !== selected.id) {
      return;
    }

    this.currentAction = 'animating';
    await this.moveUnitSprite(selected, gridX, gridY);
    const movedPixel = this.gridManager.gridToPixel(gridX, gridY);
    this.particleManager.dustCloud(movedPixel.x, movedPixel.y);

    const moved: UnitData = {
      ...selected,
      gridX,
      gridY,
      hasMoved: true,
      facing: 'right'
    };

    this.replaceUnit(moved);
    this.selectedUnit = moved;

    this.gridHighlight.clearAll();
    this.currentAction = 'idle';
    this.unitInfoPanel.show(moved);
    this.showActionMenuForUnit(moved);
    this.turnOrderBar.update(this.turnState);
  }

  private async tryAttackAtTile(gridX: number, gridY: number): Promise<void> {
    const attacker = this.getSelectedAliveUnit();
    if (!attacker) {
      return;
    }

    if (!this.containsTile(this.attackTiles, gridX, gridY)) {
      return;
    }

    const defender = this.getAliveUnitAt(gridX, gridY);
    if (!defender || defender.team === attacker.team) {
      return;
    }

    this.currentAction = 'animating';
    this.gridHighlight.clearAll();

    await this.performAttack(attacker.id, defender.id);
    if (await this.evaluateBattleState()) {
      return;
    }

    await this.finishUnitTurn(attacker.id);
  }

  private async tryAbilityAtTile(gridX: number, gridY: number): Promise<void> {
    const caster = this.getSelectedAliveUnit();
    if (!caster) {
      return;
    }

    if (!this.containsTile(this.abilityTiles, gridX, gridY)) {
      return;
    }

    this.currentAction = 'animating';
    this.gridHighlight.clearAll();

    await this.performAbility(caster.id, caster.ability, gridX, gridY);
    if (await this.evaluateBattleState()) {
      return;
    }

    await this.finishUnitTurn(caster.id);
  }

  private async performAttack(attackerId: string, defenderId: string): Promise<void> {
    const attacker = this.getUnitById(attackerId);
    const defender = this.getUnitById(defenderId);
    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return;
    }

    const attackerSprite = this.unitSprites.get(attacker.id);
    const defenderSprite = this.unitSprites.get(defender.id);
    const attackerTerrain = this.gridManager.getTerrain(attacker.gridX, attacker.gridY);
    const defenderTerrain = this.gridManager.getTerrain(defender.gridX, defender.gridY);
    const combat = resolveCombat(attacker, defender, attackerTerrain, defenderTerrain);

    if (attackerSprite && defenderSprite) {
      await this.playProjectileForAttack(attacker, attackerSprite, defenderSprite);
      await this.combatAnimation.playAttackSequence(attackerSprite, defenderSprite, combat.result);
    }

    let nextDefender = defender;
    if (combat.result.hit && combat.result.damage > 0) {
      nextDefender = damageUnit(nextDefender, combat.result.damage);
      const popupPixel = defenderSprite ?? this.gridManager.gridToPixel(defender.gridX, defender.gridY);
      this.damagePopup.showDamage(popupPixel.x, popupPixel.y, combat.result.damage, combat.result.crit);
    } else {
      const popupPixel = defenderSprite ?? this.gridManager.gridToPixel(defender.gridX, defender.gridY);
      this.damagePopup.showMiss(popupPixel.x, popupPixel.y);
    }

    this.replaceUnit(nextDefender);
    if (!nextDefender.isAlive) {
      this.awardKillXp(attacker.id, defender.level);
      if (defenderSprite) {
        await this.unitAnimations.deathFade(defenderSprite);
      }
      this.removeUnitSprite(nextDefender.id);
      await this.screenEffects.dimScreen(260);
    }

    const attackerAfterPrimary = this.getUnitById(attacker.id);
    if (
      combat.counterResult &&
      attackerAfterPrimary &&
      attackerAfterPrimary.isAlive &&
      nextDefender.isAlive
    ) {
      const refreshedAttacker = attackerAfterPrimary;
      const refreshedDefender = this.getUnitById(nextDefender.id);
      const attackerRefSprite = refreshedDefender ? this.unitSprites.get(refreshedDefender.id) : undefined;
      const defenderRefSprite = this.unitSprites.get(refreshedAttacker.id);

      if (attackerRefSprite && defenderRefSprite) {
        await this.playProjectileForAttack(nextDefender, attackerRefSprite, defenderRefSprite);
        await this.combatAnimation.playAttackSequence(attackerRefSprite, defenderRefSprite, combat.counterResult);
      }

      let nextAttacker = refreshedAttacker;
      if (combat.counterResult.hit && combat.counterResult.damage > 0) {
        nextAttacker = damageUnit(nextAttacker, combat.counterResult.damage);
        const popupPixel = defenderRefSprite ?? this.gridManager.gridToPixel(refreshedAttacker.gridX, refreshedAttacker.gridY);
        this.damagePopup.showDamage(
          popupPixel.x,
          popupPixel.y,
          combat.counterResult.damage,
          combat.counterResult.crit
        );
      } else {
        const popupPixel = defenderRefSprite ?? this.gridManager.gridToPixel(refreshedAttacker.gridX, refreshedAttacker.gridY);
        this.damagePopup.showMiss(popupPixel.x, popupPixel.y);
      }

      this.replaceUnit(nextAttacker);
      if (!nextAttacker.isAlive) {
        this.awardKillXp(nextDefender.id, refreshedAttacker.level);
        if (defenderRefSprite) {
          await this.unitAnimations.deathFade(defenderRefSprite);
        }
        this.removeUnitSprite(nextAttacker.id);
        await this.screenEffects.dimScreen(260);
      }
    }

    this.refreshStateAndUi();
  }

  private async performAbility(
    casterId: string,
    abilityName: string,
    targetX: number,
    targetY: number
  ): Promise<void> {
    const caster = this.getUnitById(casterId);
    if (!caster || !caster.isAlive) {
      return;
    }

    const ability = getAbility(abilityName);
    if (!ability || !canUseAbility(caster, ability)) {
      return;
    }

    const updatedCaster = applyAbilityCost(caster, ability);
    this.replaceUnit(updatedCaster);

    const casterSprite = this.unitSprites.get(caster.id);
    const targetPixel = this.gridManager.gridToPixel(targetX, targetY);
    if (casterSprite) {
      await this.playProjectileForAbility(ability.name, casterSprite.x, casterSprite.y, targetPixel.x, targetPixel.y);
      await this.unitAnimations.attackAnimation(casterSprite, targetPixel.x, targetPixel.y);
    }

    const aoeTiles = getAoETiles(
      targetX,
      targetY,
      ability.aoeShape,
      ability.aoeSize,
      this.gridManager.cols,
      this.gridManager.rows
    );

    const affected = this.units.filter((unit) => {
      if (!unit.isAlive) {
        return false;
      }

      const inAoe = this.containsTile(aoeTiles, unit.gridX, unit.gridY);
      if (!inAoe) {
        return false;
      }

      if (ability.targetType === 'self') {
        return unit.id === casterId;
      }

      if (ability.targetType === 'ally') {
        return unit.team === updatedCaster.team;
      }

      if (ability.targetType === 'enemy') {
        return unit.team !== updatedCaster.team;
      }

      return true;
    });

    for (const target of affected) {
      const targetSprite = this.unitSprites.get(target.id);
      const popupPixel = targetSprite ?? this.gridManager.gridToPixel(target.gridX, target.gridY);

      if (ability.healAmount > 0) {
        const healed = healUnit(target, ability.healAmount);
        if (healed.currentHp !== target.currentHp) {
          this.damagePopup.showHeal(popupPixel.x, popupPixel.y, ability.healAmount);
          if (casterSprite && targetSprite) {
            await this.combatAnimation.playHealSequence(casterSprite, targetSprite);
          }
        }
        this.replaceUnit(healed);
      } else if (ability.damageMultiplier > 0 && target.team !== updatedCaster.team) {
        const terrain = this.gridManager.getTerrain(target.gridX, target.gridY);
        const result = calcDamage(
          updatedCaster,
          target,
          terrain,
          ability.damageMultiplier,
          ability.ignoreTerrainDef
        );

        if (result.hit && result.damage > 0) {
          const damaged = damageUnit(target, result.damage);
          this.replaceUnit(damaged);
          this.damagePopup.showDamage(popupPixel.x, popupPixel.y, result.damage, result.crit);
          this.particleManager.fireExplosion(popupPixel.x, popupPixel.y);
          if (targetSprite) {
            await this.unitAnimations.damageFlash(targetSprite);
          }

          if (!damaged.isAlive) {
            this.awardKillXp(updatedCaster.id, target.level);
            if (targetSprite) {
              await this.unitAnimations.deathFade(targetSprite);
            }
            this.removeUnitSprite(target.id);
            await this.screenEffects.dimScreen(260);
          }
        } else {
          this.damagePopup.showMiss(popupPixel.x, popupPixel.y);
        }
      }

      if (ability.statusApplied && ability.statusDuration && ability.statusDuration > 0) {
        const refreshed = this.getUnitById(target.id);
        if (refreshed && refreshed.isAlive) {
          this.replaceUnit({
            ...refreshed,
            statusEffects: [...refreshed.statusEffects, createStatus(ability.statusApplied, ability.statusDuration)]
          });
        }
      }
    }

    this.refreshStateAndUi();
  }

  private async finishUnitTurn(unitId: string): Promise<void> {
    this.turnState = markUnitDone(this.turnState, unitId);
    this.syncUnitsFromTurnState();
    this.turnOrderBar.update(this.turnState);

    this.selectedUnit = null;
    this.currentAction = 'idle';
    this.actionMenu.hide();
    this.unitInfoPanel.hide();

    this.refreshStateAndUi();

    if (await this.evaluateBattleState()) {
      return;
    }

    if (allUnitsActed(this.turnState)) {
      this.inputHandler.disable();
      await this.advancePhase();
    }
  }

  private async advancePhase(): Promise<void> {
    if (this.battleEnded) {
      return;
    }

    this.turnState = nextPhase(this.turnState);
    this.syncUnitsFromTurnState();
    this.refreshStateAndUi();
    await this.enterCurrentPhase();
  }

  private async enterCurrentPhase(): Promise<void> {
    if (this.battleEnded) {
      return;
    }

    this.cancelCurrentSelection();

    if (await this.evaluateBattleState()) {
      return;
    }

    if (isPlayerPhase(this.turnState)) {
      await this.phaseTransition.showPhaseTransition('player');

      if (this.tryStartMidBattleDialogue()) {
        return;
      }

      this.currentAction = 'idle';
      this.inputHandler.enable();
      this.turnOrderBar.update(this.turnState);
      return;
    }

    this.inputHandler.disable();

    if (isEnemyPhase(this.turnState)) {
      this.currentAction = 'enemyTurn';
      await this.phaseTransition.showPhaseTransition('enemy');
      await this.executeEnemyPhase();
      if (!this.battleEnded) {
        await this.advancePhase();
      }
      return;
    }

    this.currentAction = 'animating';
    this.turnState = applyEnvironmentEffects(this.turnState, this.gridManager.grid);
    this.syncUnitsFromTurnState();
    this.cleanupDeadUnits();

    const reinforcementResult = checkReinforcements(this.reinforcementWaves, this.turnState.turnNumber);
    this.reinforcementWaves = reinforcementResult.updatedWaves.map((wave) => ({
      ...wave,
      units: [...wave.units]
    }));

    if (reinforcementResult.unitsToSpawn.length > 0) {
      const reinforcements = spawnReinforcements(
        reinforcementResult.unitsToSpawn,
        this.units.map((unit) => unit.id)
      );
      this.addReinforcements(reinforcements);
    }

    this.turnOrderBar.update(this.turnState);

    if (await this.evaluateBattleState()) {
      return;
    }

    await this.delay(280);

    if (this.battleEnded) {
      return;
    }

    this.turnState = nextPhase(this.turnState);
    this.syncUnitsFromTurnState();
    this.refreshStateAndUi();
    await this.enterCurrentPhase();
  }

  private async executeEnemyPhase(): Promise<void> {
    const aiUnits = this.units.filter((unit) => unit.isAlive && unit.team === 'enemy');
    const opposingUnits = this.units.filter(
      (unit) => unit.isAlive && (unit.team === 'player' || unit.team === 'ally')
    );

    const actions = planAITurn(aiUnits, opposingUnits, this.units, this.gridManager.grid);

    for (const action of actions) {
      if (this.battleEnded) {
        return;
      }

      const actor = this.getUnitById(action.unitId);
      if (!actor || !actor.isAlive) {
        continue;
      }

      if (actor.gridX !== action.moveToX || actor.gridY !== action.moveToY) {
        await this.moveUnitSprite(actor, action.moveToX, action.moveToY);
        const movedPixel = this.gridManager.gridToPixel(action.moveToX, action.moveToY);
        this.particleManager.dustCloud(movedPixel.x, movedPixel.y);
        this.replaceUnit({
          ...actor,
          gridX: action.moveToX,
          gridY: action.moveToY,
          hasMoved: true,
          facing: 'left'
        });
      }

      if (action.actionType === 'attack' && action.targetUnitId) {
        await this.performAttack(action.unitId, action.targetUnitId);
      } else if (
        action.actionType === 'ability' &&
        action.abilityName &&
        typeof action.abilityTargetX === 'number' &&
        typeof action.abilityTargetY === 'number'
      ) {
        await this.performAbility(action.unitId, action.abilityName, action.abilityTargetX, action.abilityTargetY);
      }

      this.turnState = markUnitDone(this.turnState, action.unitId);
      this.syncUnitsFromTurnState();
      this.turnOrderBar.update(this.turnState);

      if (await this.evaluateBattleState()) {
        return;
      }

      await this.delay(260);
    }

    this.refreshStateAndUi();
  }

  private showActionMenuForUnit(unit: UnitData): void {
    const ability = getAbility(unit.ability);

    this.actionMenu.show(unit, {
      canMove: !unit.hasMoved,
      canAttack: !unit.hasActed,
      canAbility: !unit.hasActed && Boolean(ability && canUseAbility(unit, ability)),
      canWait: true
    });
  }

  private cancelCurrentSelection(): void {
    this.selectedUnit = null;
    this.currentAction = isPlayerPhase(this.turnState) ? 'idle' : this.currentAction;
    this.movementTiles = [];
    this.attackTiles = [];
    this.abilityTiles = [];
    this.actionMenu.hide();
    this.gridHighlight.clearAll();
    this.unitInfoPanel.hide();
  }

  private createUnitsFromSeeds(): UnitData[] {
    const players = this.playerSeeds.map((seed, idx) => {
      return createPlayerUnit(`p-${idx + 1}`, seed.name, seed.class, seed.level, seed.x, seed.y);
    });

    const enemies = this.enemySeeds.map((seed, idx) => {
      return createEnemyUnit(`e-${idx + 1}`, seed.name, seed.class, seed.level, seed.x, seed.y);
    });

    const allies = this.allySeeds.map((seed, idx) => {
      return createAllyUnit(`a-${idx + 1}`, seed.name, seed.class, seed.level, seed.x, seed.y);
    });

    return [...players, ...allies, ...enemies];
  }

  private playerSeedsFromDefs(defs?: LevelUnitDef[]): UnitSeed[] {
    if (!defs) {
      return [];
    }

    return defs.map((def) => ({
      name: def.name,
      class: def.unitClass,
      level: def.level,
      x: def.gridX,
      y: def.gridY
    }));
  }

  private createDefaultMap(): TerrainType[][] {
    const map: TerrainType[][] = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => 'Plains' as TerrainType)
    );

    for (let y = 2; y <= 7; y += 1) {
      map[y][7] = 'Forest';
    }

    map[4][8] = 'Water';
    map[5][8] = 'Water';
    map[4][9] = 'Water';
    map[5][9] = 'Water';

    map[3][5] = 'Forest';
    map[6][5] = 'Forest';
    map[2][11] = 'Forest';
    map[7][11] = 'Forest';

    map[5][10] = 'Fire';

    return map;
  }

  private getAliveUnitAt(gridX: number, gridY: number): UnitData | undefined {
    return this.units.find((unit) => unit.isAlive && unit.gridX === gridX && unit.gridY === gridY);
  }

  private getUnitById(id: string): UnitData | undefined {
    return this.units.find((unit) => unit.id === id);
  }

  private getSelectedAliveUnit(): UnitData | null {
    if (!this.selectedUnit) {
      return null;
    }

    const refreshed = this.getUnitById(this.selectedUnit.id);
    if (!refreshed || !refreshed.isAlive) {
      this.selectedUnit = null;
      return null;
    }

    this.selectedUnit = refreshed;
    return refreshed;
  }

  private replaceUnit(nextUnit: UnitData): void {
    this.units = this.units.map((unit) => (unit.id === nextUnit.id ? nextUnit : unit));
    this.turnState = {
      ...this.turnState,
      units: this.units
    };

    if (this.selectedUnit?.id === nextUnit.id) {
      this.selectedUnit = nextUnit;
    }
  }

  private syncUnitsFromTurnState(): void {
    this.units = this.turnState.units;

    if (this.selectedUnit) {
      this.selectedUnit = this.getUnitById(this.selectedUnit.id) ?? null;
    }
  }

  private containsTile(tiles: Array<{ x: number; y: number }>, x: number, y: number): boolean {
    return tiles.some((tile) => tile.x === x && tile.y === y);
  }

  private refreshStateAndUi(): void {
    this.cleanupDeadUnits();
    this.updateUnitsLost();
    this.turnOrderBar.update(this.turnState);
  }

  private cleanupDeadUnits(): void {
    for (const unit of this.units) {
      if (!unit.isAlive) {
        this.removeUnitSprite(unit.id);
      }
    }
  }

  private updateUnitsLost(): void {
    const alivePlayers = this.units.filter(
      (unit) => unit.isAlive && unit.team === 'player' && this.initialPlayerUnitIds.includes(unit.id)
    ).length;

    this.unitsLost = Math.max(0, this.initialPlayerUnitIds.length - alivePlayers);
  }

  private addReinforcements(reinforcements: UnitData[]): void {
    if (reinforcements.length === 0) {
      return;
    }

    for (const unit of reinforcements) {
      this.units.push(unit);
      this.createUnitSprite(unit);
      const px = this.gridManager.gridToPixel(unit.gridX, unit.gridY);
      this.particleManager.lightningEffect(px.x, px.y);
    }

    this.turnState = {
      ...this.turnState,
      units: this.units
    };
  }

  private awardKillXp(killerId: string, defeatedLevel: number): void {
    const killer = this.getUnitById(killerId);
    if (!killer || !killer.isAlive || (killer.team !== 'player' && killer.team !== 'ally')) {
      return;
    }

    const gained = xpForKill(defeatedLevel, killer.level);
    this.xpGained += gained;

    const withXp: UnitData = {
      ...killer,
      xp: killer.xp + gained
    };

    const leveled = checkLevelUp(withXp).newUnit;
    this.replaceUnit(leveled);
  }

  private getObjectiveLabel(levelDef?: LevelDef): string {
    if (!levelDef) {
      return 'Defeat all enemies';
    }

    if (levelDef.objectiveType === 'defeat_all') {
      return 'Defeat all enemies';
    }

    if (levelDef.objectiveType === 'defeat_boss') {
      return `Defeat ${levelDef.objectiveTarget ?? 'the boss'}`;
    }

    if (levelDef.objectiveType === 'survive') {
      return `Survive for ${levelDef.starCriteria.turns} turns`;
    }

    if (levelDef.objectiveType === 'escort') {
      return `Escort ${levelDef.objectiveTarget ?? 'the ally'} to safety`;
    }

    return 'Complete the mission';
  }

  private async evaluateBattleState(): Promise<boolean> {
    if (this.battleEnded) {
      return true;
    }

    this.updateUnitsLost();

    if (checkDefeat(this.units)) {
      this.battleEnded = true;
      this.scene.start('DefeatScene', { levelId: this.levelId });
      return true;
    }

    const objectiveStatus = checkObjective(
      this.objectiveType,
      this.units,
      this.objectiveTarget,
      this.turnState.turnNumber,
      this.surviveTurns
    );

    if (objectiveStatus === 'failed') {
      this.battleEnded = true;
      this.scene.start('DefeatScene', { levelId: this.levelId });
      return true;
    }

    if (objectiveStatus === 'completed') {
      await this.handleVictory();
      return true;
    }

    return false;
  }

  private async handleVictory(): Promise<void> {
    if (this.battleEnded) {
      return;
    }

    this.battleEnded = true;
    this.inputHandler.disable();
    this.currentAction = 'idle';

    const payload = {
      levelId: this.levelId,
      turnsTaken: this.turnState.turnNumber,
      unitsLost: this.unitsLost,
      xpGained: this.xpGained,
      unitRoster: this.buildUnitRoster()
    };

    if (this.postBattleDialogue.length > 0) {
      this.scene.start('DialogueScene', {
        lines: this.postBattleDialogue,
        nextScene: 'VictoryScene',
        nextSceneData: payload
      });
      return;
    }

    this.scene.start('VictoryScene', payload);
  }

  private tryStartMidBattleDialogue(): boolean {
    if (this.midDialogueShown || this.battleEnded) {
      return false;
    }

    if (!this.midTriggerTurn || this.midBattleDialogue.length === 0) {
      return false;
    }

    if (this.turnState.turnNumber < this.midTriggerTurn || !isPlayerPhase(this.turnState)) {
      return false;
    }

    this.midDialogueShown = true;
    this.inputHandler.disable();

    this.scene.start('DialogueScene', {
      lines: this.midBattleDialogue,
      nextScene: 'BattleScene',
      nextSceneData: {
        levelId: this.levelId,
        skipPreBattleDialogue: true,
        resumeState: this.createResumeState()
      }
    });

    return true;
  }

  private createResumeState(): BattleResumeState {
    return {
      units: this.units.map((unit) => this.cloneUnit(unit)),
      turnState: this.cloneTurnState(this.turnState),
      reinforcementWaves: this.reinforcementWaves.map((wave) => ({
        ...wave,
        units: [...wave.units]
      })),
      initialPlayerUnitIds: [...this.initialPlayerUnitIds],
      unitsLost: this.unitsLost,
      xpGained: this.xpGained,
      midDialogueShown: this.midDialogueShown
    };
  }

  private applyResumeState(state: BattleResumeState): void {
    this.initialUnits = state.units.map((unit) => this.cloneUnit(unit));
    this.restoredTurnState = this.cloneTurnState(state.turnState, this.initialUnits);
    this.reinforcementWaves = state.reinforcementWaves.map((wave) => ({
      ...wave,
      units: [...wave.units]
    }));
    this.initialPlayerUnitIds = [...state.initialPlayerUnitIds];
    this.unitsLost = state.unitsLost;
    this.xpGained = state.xpGained;
    this.midDialogueShown = state.midDialogueShown;
  }

  private cloneUnit(unit: UnitData): UnitData {
    return {
      ...unit,
      statusEffects: [...unit.statusEffects],
      items: [...unit.items],
      range: [...unit.range] as [number, number]
    };
  }

  private cloneTurnState(state: TurnState, unitsOverride?: UnitData[]): TurnState {
    const units = unitsOverride
      ? unitsOverride.map((unit) => this.cloneUnit(unit))
      : state.units.map((unit) => this.cloneUnit(unit));

    return {
      ...state,
      units,
      phaseOrder: [...state.phaseOrder]
    };
  }

  private buildUnitRoster(): Array<{ name: string; unitClass: string; level: number; xp: number }> {
    return this.units
      .filter((unit) => unit.team === 'player')
      .map((unit) => ({
        name: unit.name,
        unitClass: unit.unitClass,
        level: unit.level,
        xp: unit.xp
      }));
  }

  private async playProjectileForAttack(
    attacker: UnitData,
    attackerSprite: Phaser.GameObjects.Sprite,
    defenderSprite: Phaser.GameObjects.Sprite
  ): Promise<void> {
    const distance = Phaser.Math.Distance.Between(
      attackerSprite.x,
      attackerSprite.y,
      defenderSprite.x,
      defenderSprite.y
    );
    if (distance <= TILE_SIZE * 1.2) {
      return;
    }

    if (attacker.unitClass === 'Archer') {
      await this.projectileRenderer.fireArrow(attackerSprite.x, attackerSprite.y, defenderSprite.x, defenderSprite.y);
      return;
    }

    if (attacker.unitClass === 'Mage') {
      await this.projectileRenderer.fireFireball(attackerSprite.x, attackerSprite.y, defenderSprite.x, defenderSprite.y);
      return;
    }

    await this.projectileRenderer.fireLightning(attackerSprite.x, attackerSprite.y, defenderSprite.x, defenderSprite.y);
  }

  private async playProjectileForAbility(
    abilityName: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Promise<void> {
    if (abilityName === 'Fireball') {
      await this.projectileRenderer.fireFireball(fromX, fromY, toX, toY);
      return;
    }

    if (abilityName === 'RainOfArrows') {
      await this.projectileRenderer.fireArrow(fromX, fromY, toX, toY);
      return;
    }

    if (abilityName === 'Heal' || abilityName === 'MassHeal') {
      await this.projectileRenderer.fireHealBeam(fromX, fromY, toX, toY);
      return;
    }

    if (abilityName === 'Taunt') {
      this.particleManager.lightningEffect(toX, toY);
      return;
    }

    await this.projectileRenderer.fireLightning(fromX, fromY, toX, toY);
  }

  private ensureUnitTexture(requestedKey: string, team: UnitData['team']): string {
    if (this.textures.exists(requestedKey)) {
      return requestedKey;
    }

    const fallback = `unit_fallback_${team}`;
    if (!this.textures.exists(fallback)) {
      const g = this.add.graphics();
      g.fillStyle(TEAM_COLORS[team], 1);
      g.fillCircle(24, 24, 22);
      g.lineStyle(2, 0x1a1a1a, 1);
      g.strokeCircle(24, 24, 22);
      g.generateTexture(fallback, 48, 48);
      g.destroy();
    }

    return fallback;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.time.delayedCall(ms, () => resolve());
    });
  }

  update(): void {
    if (!this.hud || !this.turnState || !this.minimapOverlay || !this.unitInfoPanel) {
      return;
    }

    const selected = this.getSelectedAliveUnit();
    this.hud.update(this.levelName, this.turnState.turnNumber, this.objectiveLabel);
    this.minimapOverlay.update(this.units);

    const hoveredUnit = this.hoveredTile ? this.getAliveUnitAt(this.hoveredTile.x, this.hoveredTile.y) : undefined;
    if (selected) {
      this.unitInfoPanel.show(selected);
    } else if (hoveredUnit) {
      this.unitInfoPanel.show(hoveredUnit);
    } else {
      this.unitInfoPanel.hide();
    }

    if (selected) {
      const enemyUnits = this.units.filter((unit) => {
        return (
          unit.isAlive &&
          unit.team !== selected.team &&
          gridDistance(selected.gridX, selected.gridY, unit.gridX, unit.gridY) <= 6
        );
      });

      enemyUnits.forEach((enemy) => {
        const sprite = this.unitSprites.get(enemy.id);
        if (sprite) {
          sprite.setFlipX(true);
        }
      });
    }
  }
}
