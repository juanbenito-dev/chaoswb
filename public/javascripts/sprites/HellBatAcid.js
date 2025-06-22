import Character from "./Character.js";
import globals from "../globals.js";
import { Sound, State } from "../constants.js";
import {
  initAcid,
  initPotionGreen,
  initPotionBlue,
  initEnemyDeathParticles,
} from "../initialize.js";

export default class HellBatAcid extends Character {
  constructor(
    id,
    state,
    xPos,
    yPos,
    imageSet,
    frames,
    physics,
    hitBox,
    collisions,
    lifePoints,
    afterAttackLeeway,
    nextAcidDropDelay,
  ) {
    super(
      id,
      state,
      xPos,
      yPos,
      imageSet,
      frames,
      physics,
      hitBox,
      collisions,
      lifePoints,
      afterAttackLeeway,
    );

    this.nextAcidDropDelay = nextAcidDropDelay; // TIMING OF THE DELAY BETWEEN SUCCESSIVE ACID DROPS
  }

  setPosition() {
    this.xPos =
      this.physics.xRotCenter +
      this.physics.aRadius * Math.cos(this.physics.angle);
    this.yPos =
      this.physics.yRotCenter +
      this.physics.bRadius * Math.sin(this.physics.angle);
  }

  updatePhysics() {
    // |||||||||||| UPDATE TURNING ANGLE
    this.physics.angle += this.physics.omega * globals.deltaTime;

    // |||||||||||| CALCULATE NEW POSITION
    this.setPosition();

    this.updateAnimationFrame();

    if (this.nextAcidDropDelay.value === 0) {
      initAcid(this);
      this.nextAcidDropDelay.value =
        this.nextAcidDropDelay.valueToStartCountingFrom;
    } else {
      this.nextAcidDropDelay.timeChangeCounter += globals.deltaTime;

      if (
        this.nextAcidDropDelay.timeChangeCounter >
        this.nextAcidDropDelay.timeChangeValue
      ) {
        this.nextAcidDropDelay.value--;

        this.nextAcidDropDelay.timeChangeCounter = 0;
      }
    }
  }

  updateLogic() {
    // |||||||||||| UPDATE LIFE POINTS
    if (this.collisions.isCollidingWithPlayer) {
      const player = globals.levelSprites[0];

      if (
        (player.isLeftwardsHandToHandAttackEffective ||
          player.isRightwardsHandToHandAttackEffective) &&
        this.afterAttackLeeway.value === 0
      ) {
        this.lifePoints--;

        globals.score += 150;

        if (this.lifePoints === 0) {
          globals.score += 150;

          this.state = State.OFF;
        } else {
          this.afterAttackLeeway.value = 4;
        }

        globals.currentSound = Sound.HAMMER_HIT;
      }
    }

    if (
      this.collisions.isCollidingWithMagicalOrb &&
      this.afterAttackLeeway.value === 0
    ) {
      this.lifePoints--;

      globals.score += 100;

      if (this.lifePoints === 0) {
        globals.score += 100;

        this.state = State.OFF;
      } else {
        this.afterAttackLeeway.value = 4;
      }
    }

    // |||||||||||| WHEN KILLED, DROP A GREEN OR A BLUE POTION
    if (this.lifePoints === 0) {
      const potionDropXPos = this.xPos + this.hitBox.xOffset;
      const potionDropYPos = this.yPos + this.hitBox.yOffset;

      const player = globals.levelSprites[0];

      let numToTweakProbabilityOfDroppingGreenPotion;
      let numToTweakProbabilityOfDroppingBluePotion;

      const randomNumBetween1And100 = Math.floor(Math.random() * 100) + 1;

      if (player.rageLevel > 75 && player.lifePoints > 2.5) {
        numToTweakProbabilityOfDroppingGreenPotion = 50;
        numToTweakProbabilityOfDroppingBluePotion = 75;

        if (
          randomNumBetween1And100 <= numToTweakProbabilityOfDroppingGreenPotion
        ) {
          initPotionGreen(potionDropXPos, potionDropYPos);
        } else if (
          randomNumBetween1And100 <= numToTweakProbabilityOfDroppingBluePotion
        ) {
          initPotionBlue(potionDropXPos, potionDropYPos);
        }
      } else if (
        player.lifePoints <= 2.5 ||
        (player.rageLevel > 25 && player.rageLevel <= 75)
      ) {
        numToTweakProbabilityOfDroppingGreenPotion = 75;
        numToTweakProbabilityOfDroppingBluePotion = 50;

        if (
          randomNumBetween1And100 <= numToTweakProbabilityOfDroppingBluePotion
        ) {
          initPotionBlue(potionDropXPos, potionDropYPos);
        } else if (
          randomNumBetween1And100 <= numToTweakProbabilityOfDroppingGreenPotion
        ) {
          initPotionGreen(potionDropXPos, potionDropYPos);
        }
      } else if (player.rageLevel <= 25) {
        numToTweakProbabilityOfDroppingBluePotion = 25;

        if (
          randomNumBetween1And100 <= numToTweakProbabilityOfDroppingBluePotion
        ) {
          initPotionBlue(potionDropXPos, potionDropYPos);
        }
      }

      initEnemyDeathParticles(this);
    }

    if (this.afterAttackLeeway.value > 0) {
      this.afterAttackLeeway.timeChangeCounter += globals.deltaTime;

      if (
        this.afterAttackLeeway.timeChangeCounter >=
        this.afterAttackLeeway.timeChangeValue
      ) {
        this.afterAttackLeeway.value--;
        this.afterAttackLeeway.timeChangeCounter = 0;
      }

      // |||||||||||| MAKE THE SPRITE BLINK DURING THE LEEWAY IT IS GIVEN JUST AFTER IT IS ATTACKED
      if (this.afterAttackLeeway.timeChangeCounter > 0.75) {
        this.isDrawn = false;
      } else if (this.afterAttackLeeway.timeChangeCounter > 0.5) {
        this.isDrawn = true;
      } else if (this.afterAttackLeeway.timeChangeCounter > 0.25) {
        this.isDrawn = false;
      } else {
        this.isDrawn = true;
      }
    }
  }
}
