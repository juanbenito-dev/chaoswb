import Character from "./Character.js";
import globals from "../globals.js";
import { Sound, State, GRAVITY } from "../constants.js";
import {
  initPotionGreen,
  initPotionBlue,
  initEnemyDeathParticles,
} from "../initialize.js";

export default class ChaoticHumanSword extends Character {
  constructor(
    id,
    state,
    xPos,
    yPos,
    imageSet,
    frames,
    physics,
    maxTimeToChangeDirection,
    hitBox,
    collisions,
    lifePoints,
    afterAttackLeeway,
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

    this.directionChangeCounter = 0; // COUNTER FOR DIRECTION CHANGE (SECONDS)
    this.maxTimeToChangeDirection = maxTimeToChangeDirection; // MAXIMUM TIME FOR DIRECTION CHANGE (SECONDS)
  }

  swapDirection() {
    this.state = this.state === State.LEFT_3 ? State.RIGHT_3 : State.LEFT_3;
  }

  updateDirection() {
    // |||||||||||| INCREMENT TIME FOR DIRECTION CHANGE
    this.directionChangeCounter += globals.deltaTime;

    if (this.directionChangeCounter > this.maxTimeToChangeDirection) {
      // |||||||||||| RESET THE COUNTER
      this.directionChangeCounter = 0;

      this.swapDirection();
    }
  }

  updatePhysics() {
    // |||||||||||| STATES MACHINE
    switch (this.state) {
      case State.LEFT_3:
        this.physics.vx = -this.physics.vLimit;
        break;

      case State.RIGHT_3:
        this.physics.vx = this.physics.vLimit;
        break;
    }

    // |||||||||||| CALCULATE THE DISTANCE IT MOVES (X AXIS)
    this.xPos += this.physics.vx * globals.deltaTime;

    // |||||||||||| ACCELERATION IN THE Y AXIS IS THE GRAVITY
    this.physics.ay = GRAVITY;

    this.physics.vy += this.physics.ay * globals.deltaTime;

    // |||||||||||| CALCULATE THE DISTANCE IT MOVES (Y AXIS)
    if (this.physics.vy > 0) {
      this.yPos += Math.max(this.physics.vy * globals.deltaTime, 1);
    } else {
      this.yPos += this.physics.vy * globals.deltaTime;
    }

    this.updateAnimationFrame();

    // |||||||||||| DIRECTION CHANGE
    if (
      this.collisions.isCollidingWithObstacleOnTheLeft ||
      this.collisions.isCollidingWithObstacleOnTheRight
    ) {
      this.directionChangeCounter = 0;
      this.swapDirection();
    } else {
      this.updateDirection();
    }

    if (this.state === State.RIGHT_3) {
      this.hitBox.xSize = 25;
      this.hitBox.xOffset = 17;
    } else {
      this.hitBox.xSize = 26;
      this.hitBox.xOffset = 2;
    }
  }

  updateLogic() {
    // |||||||||||| UPDATE LIFE POINTS & SCORE

    // |||||||| COLLISION WITH HARMFUL TILES
    if (this.collisions.isCollidingWithLava) {
      this.state = State.OFF;
    }

    // |||||||| COLLISION WITH PLAYER & THEIR MAGICAL ORBS
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
