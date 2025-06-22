import Character from "./Character.js";
import globals from "../globals.js";
import { Sound, State } from "../constants.js";
import {
  initPotionGreen,
  initPotionBlue,
  initEnemyDeathParticles,
} from "../initialize.js";

export default class HellBatHandToHand extends Character {
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
    wasInitializedFromEvent,
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

    this.wasInitializedFromEvent = wasInitializedFromEvent;
  }

  updatePhysics() {
    if (
      this.collisions.isCollidingWithObstacleOnTheLeft ||
      this.collisions.isCollidingWithObstacleOnTheRight
    ) {
      this.physics.vx = -this.physics.vx;
    }

    this.physics.angle += this.physics.omega * globals.deltaTime;

    this.xPos += this.physics.vx * globals.deltaTime;
    this.yPos =
      this.physics.yRef + this.physics.amplitude * Math.sin(this.physics.angle);

    this.updateAnimationFrame();
  }

  updateLogic() {
    // |||||||||||| IF THE EVENT OF TWO HELL BATS' APPARITION NEAR TO PLAYER HAS FINISHED WITHOUT THE PLAYER HAVING KILLED BOTH OF THESE ENEMIES, NO REWARD WILL BE PROVIDED
    if (
      globals.hellBatsApparitionEventTimer.value === 0 &&
      this.lifePoints > 0
    ) {
      this.state = State.OFF;
    }

    // |||||||||||| UPDATE LIFE POINTS
    if (this.collisions.isCollidingWithPlayer) {
      const player = globals.levelSprites[0];

      if (
        (player.isLeftwardsHandToHandAttackEffective ||
          player.isRightwardsHandToHandAttackEffective) &&
        this.afterAttackLeeway.value === 0
      ) {
        this.lifePoints--;

        globals.score += 200;

        if (this.lifePoints === 0) {
          globals.score += 200;

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

      globals.score += 150;

      if (this.lifePoints === 0) {
        globals.score += 150;

        this.state = State.OFF;
      } else {
        this.afterAttackLeeway.value = 4;
      }
    }

    // |||||||||||| WHEN KILLED, DROP A GREEN OR A BLUE POTION
    if (this.lifePoints === 0) {
      let potionDropXPos;
      let potionDropYPos;

      const player = globals.levelSprites[0];

      if (this.wasInitializedFromEvent) {
        globals.hellBatsApparitionEventSprites.splice(
          globals.hellBatsApparitionEventSprites.indexOf(this),
          1,
        );

        if (
          globals.hellBatsApparitionEventTimer.value > 0 &&
          globals.hellBatsApparitionEventSprites.length === 0
        ) {
          potionDropXPos = player.xPos + player.hitBox.xOffset;
          potionDropYPos = player.yPos - 25;
          initPotionGreen(potionDropXPos, potionDropYPos);

          potionDropXPos =
            player.xPos + player.hitBox.xOffset + player.hitBox.xSize;
          initPotionGreen(potionDropXPos, potionDropYPos);
        }
      } else if (!this.wasInitializedFromEvent) {
        potionDropXPos = this.xPos + this.hitBox.xOffset;
        potionDropYPos = this.yPos + this.hitBox.yOffset;

        let numToTweakProbabilityOfDroppingGreenPotion;
        let numToTweakProbabilityOfDroppingBluePotion;

        const randomNumBetween1And100 = Math.floor(Math.random() * 100) + 1;

        if (player.rageLevel > 75 && player.lifePoints > 2.5) {
          numToTweakProbabilityOfDroppingGreenPotion = 50;
          numToTweakProbabilityOfDroppingBluePotion = 75;

          if (
            randomNumBetween1And100 <=
            numToTweakProbabilityOfDroppingGreenPotion
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
            randomNumBetween1And100 <=
            numToTweakProbabilityOfDroppingGreenPotion
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
