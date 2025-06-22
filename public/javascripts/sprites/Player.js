import Character from "./Character.js";
import Timer from "../Timer.js";
import globals from "../globals.js";
import { Sound, SpriteID, State, GRAVITY } from "../constants.js";
import {
  initMagicalOrb,
  initCheckpointParticles,
  initHammerHitParticles,
} from "../initialize.js";

export default class Player extends Character {
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
    checkpoints,
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

    this.isLeftwardsHandToHandAttackEffective = false;
    this.isRightwardsHandToHandAttackEffective = false;
    this.rageLevel = 0; // RAGE LEVEL, STARTING IN 0 AND RANGING FROM 0 TO 100
    this.nextOrbThrowDelay = new Timer(0, 1); // TIMING OF THE DELAY BETWEEN SUCCESSIVE MAGICAL ORB THROWS (THE INITIAL VALUE OF THE TIMER IS 0 AS THE PLAYER HAS TO BE ALLOWED TO THROW A MAGICAL ORB FROM THE START OF THE GAME)
    this.nextRagePtUpDelay = new Timer(2, 1);
    this.nextLifePointsReductionDelay = new Timer(5, 1);
    this.checkpoints = checkpoints;
    this.lastCheckpoint = {
      xPos: xPos,
      yPos: yPos,
    };
  }

  readKeyboardAndAssignState() {
    const isStateAnyLeft =
      this.state === State.LEFT_STILL ||
      this.state === State.LEFT ||
      this.state === State.LEFT_ATTACK_HAND_TO_HAND ||
      this.state === State.LEFT_ATTACK_MAGICAL_ORB ||
      this.state === State.LEFT_ATTACK_MAGICAL_ORB_JUMP;
    const isStateAnyRight =
      this.state === State.RIGHT_STILL ||
      this.state === State.RIGHT ||
      this.state === State.RIGHT_ATTACK_HAND_TO_HAND ||
      this.state === State.RIGHT_ATTACK_MAGICAL_ORB ||
      this.state === State.RIGHT_ATTACK_MAGICAL_ORB_JUMP;

    const isStateLeftOrLeftStill =
      this.state === State.LEFT || this.state === State.LEFT_STILL;
    const isStateRightOrRightStill =
      this.state === State.RIGHT || this.state === State.RIGHT_STILL;

    const isStateLeftOrLeftJump =
      this.state === State.LEFT || this.state === State.LEFT_JUMP;
    const isStateRightOrRightJump =
      this.state === State.RIGHT || this.state === State.RIGHT_JUMP;

    if (this.physics.isOnGround) {
      this.state =
        globals.action.jump && isStateAnyLeft
          ? State.LEFT_JUMP
          : globals.action.jump && isStateAnyRight
            ? State.RIGHT_JUMP
            : globals.action.moveLeft
              ? State.LEFT
              : globals.action.moveRight
                ? State.RIGHT
                : globals.action.attackHandToHand && isStateLeftOrLeftStill
                  ? State.LEFT_ATTACK_HAND_TO_HAND
                  : globals.action.attackHandToHand && isStateRightOrRightStill
                    ? State.RIGHT_ATTACK_HAND_TO_HAND
                    : globals.action.throwMagicalOrb && isStateLeftOrLeftStill
                      ? State.LEFT_ATTACK_MAGICAL_ORB
                      : globals.action.throwMagicalOrb &&
                          isStateRightOrRightStill
                        ? State.RIGHT_ATTACK_MAGICAL_ORB
                        : isStateLeftOrLeftJump
                          ? State.LEFT_STILL
                          : isStateRightOrRightJump
                            ? State.RIGHT_STILL
                            : this.state;
    } else {
      this.state =
        globals.action.moveLeft || isStateLeftOrLeftStill
          ? State.LEFT_JUMP
          : globals.action.moveRight || isStateRightOrRightStill
            ? State.RIGHT_JUMP
            : globals.action.throwMagicalOrb && this.state === State.LEFT_JUMP
              ? State.LEFT_ATTACK_MAGICAL_ORB_JUMP
              : globals.action.throwMagicalOrb &&
                  this.state === State.RIGHT_JUMP
                ? State.RIGHT_ATTACK_MAGICAL_ORB_JUMP
                : this.state;
    }
  }

  updateRageLevel() {
    if (this.nextRagePtUpDelay.value === 0) {
      this.rageLevel += 2;

      if (this.rageLevel > 100) {
        this.rageLevel = 100;
      }

      this.nextRagePtUpDelay.value = 2;
    } else {
      this.nextRagePtUpDelay.timeChangeCounter += globals.deltaTime;

      if (
        this.nextRagePtUpDelay.timeChangeCounter >=
        this.nextRagePtUpDelay.timeChangeValue
      ) {
        this.nextRagePtUpDelay.value--;
        this.nextRagePtUpDelay.timeChangeCounter = 0;
      }
    }
  }

  updatePhysics() {
    this.readKeyboardAndAssignState();

    // |||||||||||| HORIZONTAL MOVEMENT

    const isStateLeftOrLeftJump =
      this.state === State.LEFT || this.state === State.LEFT_JUMP;
    const isStateRightOrRightJump =
      this.state === State.RIGHT || this.state === State.RIGHT_JUMP;

    if (isStateLeftOrLeftJump && globals.action.moveLeft) {
      this.physics.vx = -this.physics.vLimit;
    } else if (isStateRightOrRightJump && globals.action.moveRight) {
      this.physics.vx = this.physics.vLimit;
    } else {
      this.physics.vx = 0;
    }

    // |||||||| CALCULATE THE DISTANCE IT MOVES
    this.xPos += this.physics.vx * globals.deltaTime;

    // |||||||||||| VERTICAL MOVEMENT

    // |||||||| ACCELERATION IN THE Y AXIS IS THE GRAVITY
    this.physics.ay = GRAVITY;

    if (this.collisions.isCollidingWithObstacleOnTheBottom) {
      this.physics.isOnGround = true;
    } else {
      this.physics.isOnGround = false;
    }

    this.physics.vy += this.physics.ay * globals.deltaTime;

    if (this.physics.isOnGround && globals.action.jump) {
      this.physics.isOnGround = false;

      // |||||||| ASSIGN INITIAL JUMP VELOCITY
      this.physics.vy += this.physics.jumpForce;

      globals.currentSound = Sound.JUMP;
    }

    // |||||||| CALCULATE THE DISTANCE IT MOVES
    if (this.physics.vy > 0) {
      this.yPos += Math.max(this.physics.vy * globals.deltaTime, 2);
    } else {
      this.yPos += this.physics.vy * globals.deltaTime;
    }

    // |||||||||||| IF A NEW CHECKPOINT IS REACHED, UPDATE THE VARIABLE THAT HOLDS THE COORDINATES OF THE LAST ONE
    for (let i = 0; i < this.checkpoints.length; i++) {
      if (
        this.xPos >= this.checkpoints[i].xPosLowerLimit &&
        this.xPos <= this.checkpoints[i].xPosUpperLimit &&
        this.yPos >= this.checkpoints[i].yPosLowerLimit &&
        this.yPos <= this.checkpoints[i].yPosUpperLimit &&
        this.lastCheckpoint.xPos !== this.checkpoints[i].xPosUpperLimit
      ) {
        this.lastCheckpoint.xPos = this.checkpoints[i].xPosUpperLimit;
        this.lastCheckpoint.yPos = this.checkpoints[i].yPosUpperLimit;

        initCheckpointParticles(this);

        globals.currentSound = Sound.CHECKPOINT_REACHED;

        globals.score += 200;
      }
    }

    this.updateAnimationFrame();

    if (
      (this.state === State.LEFT_ATTACK_MAGICAL_ORB ||
        this.state === State.RIGHT_ATTACK_MAGICAL_ORB ||
        this.state === State.LEFT_ATTACK_MAGICAL_ORB_JUMP ||
        this.state === State.RIGHT_ATTACK_MAGICAL_ORB_JUMP) &&
      this.frames.frameCounter === 3 &&
      this.nextOrbThrowDelay.value === 0
    ) {
      initMagicalOrb();
      this.nextOrbThrowDelay.timeChangeCounter = 0;
      this.nextOrbThrowDelay.value = 5;

      globals.currentSound = Sound.ORB_THROW;

      if (this.rageLevel > 50) {
        this.rageLevel += 5;

        if (this.rageLevel > 100) {
          this.rageLevel = 100;
        }
      }
    }

    if (this.nextOrbThrowDelay.value > 0) {
      this.nextOrbThrowDelay.timeChangeCounter += globals.deltaTime;

      if (
        this.nextOrbThrowDelay.timeChangeCounter >=
        this.nextOrbThrowDelay.timeChangeValue
      ) {
        this.nextOrbThrowDelay.value--;

        this.nextOrbThrowDelay.timeChangeCounter = 0;
      }
    }

    if (this.state === State.RIGHT_ATTACK_HAND_TO_HAND) {
      this.hitBox.xSize = 28;
      this.hitBox.xOffset = 15;
    } else if (this.state === State.LEFT_ATTACK_HAND_TO_HAND) {
      this.hitBox.xSize = 28;
      this.hitBox.xOffset = 0;
    } else {
      this.hitBox.xSize = 12;
      this.hitBox.xOffset = 16;
    }

    if (
      (this.state === State.LEFT_ATTACK_HAND_TO_HAND ||
        this.state === State.RIGHT_ATTACK_HAND_TO_HAND) &&
      this.frames.frameCounter === 3 &&
      this.frames.frameChangeCounter === 1
    ) {
      initHammerHitParticles(this);
    }
  }

  updateLogic() {
    // |||||||||||| UPDATE LIFE POINTS, SCORE & RAGE LEVEL

    // |||||||| CONDITIONS THAT MAKE THE PLAYER LOSE LIFE POINTS

    // |||| COLLISION WITH HARMFUL TILES

    if (
      this.collisions.isCollidingWithSpikes &&
      this.afterAttackLeeway.value === 0
    ) {
      this.lifePoints--;
      this.afterAttackLeeway.value = 4;

      globals.currentSound = Sound.LIFE_POINT_LOST;
    }

    if (this.collisions.isCollidingWithLava) {
      this.lifePoints--;
      this.xPos = this.lastCheckpoint.xPos;
      this.yPos = this.lastCheckpoint.yPos;

      globals.currentSound = Sound.LIFE_POINT_LOST;
    }

    // |||| COLLISION WITH ENEMIES

    const enemies = [
      SpriteID.CHAOTIC_HUMAN_BOW,
      SpriteID.CHAOTIC_HUMAN_SWORD,
      SpriteID.FAST_WORM,
      SpriteID.HELL_BAT_ACID,
      SpriteID.HELL_BAT_HAND_TO_HAND,
    ];

    for (let i = 1; i < globals.levelSprites.length; i++) {
      const sprite = globals.levelSprites[i];

      if (
        sprite.collisions.isCollidingWithPlayer &&
        enemies.includes(sprite.id)
      ) {
        this.isLeftwardsHandToHandAttackEffective =
          this.state === State.LEFT_ATTACK_HAND_TO_HAND &&
          sprite.xPos + sprite.hitBox.xOffset + sprite.hitBox.xSize <=
            this.xPos + this.hitBox.xOffset + this.hitBox.xSize / 2;

        this.isRightwardsHandToHandAttackEffective =
          this.state === State.RIGHT_ATTACK_HAND_TO_HAND &&
          sprite.xPos + sprite.hitBox.xOffset >=
            this.xPos + this.hitBox.xOffset + this.hitBox.xSize / 2;

        if (
          !this.isLeftwardsHandToHandAttackEffective &&
          !this.isRightwardsHandToHandAttackEffective &&
          this.afterAttackLeeway.value === 0
        ) {
          this.lifePoints--;
          this.afterAttackLeeway.value = 4;

          globals.currentSound = Sound.LIFE_POINT_LOST;
        }
      }
    }

    // |||| COLLISION WITH HARMFUL ELEMENTS

    if (
      this.collisions.isCollidingWithAcid &&
      this.afterAttackLeeway.value === 0
    ) {
      this.lifePoints--;
      this.afterAttackLeeway.value = 4;

      globals.currentSound = Sound.LIFE_POINT_LOST;
    }

    if (
      this.collisions.isCollidingWithArrow &&
      this.afterAttackLeeway.value === 0
    ) {
      this.lifePoints--;
      this.afterAttackLeeway.value = 4;

      globals.currentSound = Sound.LIFE_POINT_LOST;
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

      // |||| MAKE THE SPRITE BLINK DURING THE LEEWAY IT IS GIVEN JUST AFTER IT IS ATTACKED
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

    // |||||||| CONDITIONS THAT MAKE THE PLAYER EARN LIFE POINTS & SCORE & LOSE RAGE
    if (this.hitBox.xSize !== 28) {
      if (this.collisions.isCollidingWithGreenPotion) {
        this.lifePoints++;
        if (this.lifePoints > 5) {
          this.lifePoints = 5;
        }

        globals.score += 50;

        this.rageLevel -= 20;
        if (this.rageLevel < 0) {
          this.rageLevel = 0;
        }

        globals.currentSound = Sound.POTION_COLLECTION;
      }

      if (this.collisions.isCollidingWithBluePotion) {
        this.lifePoints += 2;
        if (this.lifePoints > 5) {
          this.lifePoints = 5;
        }

        globals.score += 100;

        globals.currentSound = Sound.POTION_COLLECTION;
      }
    }

    this.updateRageLevel();

    if (
      this.collisions.isCollidingWithClosedDoor &&
      globals.closedDoorsNoticeTimer.value ===
        globals.closedDoorsNoticeTimer.valueToStartCountingFrom &&
      globals.closedDoorsNoticeTimer.timeChangeCounter === 0
    ) {
      globals.closedDoorsNotice = "LOCKED";

      if (globals.level.number === 1) {
        globals.currentSound = Sound.WITCH_LAUGH;
      }
    }

    if (globals.closedDoorsNotice === "LOCKED") {
      if (globals.closedDoorsNoticeTimer.value === 0) {
        globals.closedDoorsNotice = "";
        globals.closedDoorsNoticeTimer.value =
          globals.closedDoorsNoticeTimer.valueToStartCountingFrom;
      } else {
        globals.closedDoorsNoticeTimer.timeChangeCounter += globals.deltaTime;

        if (
          globals.closedDoorsNoticeTimer.timeChangeCounter >=
          globals.closedDoorsNoticeTimer.timeChangeValue
        ) {
          globals.closedDoorsNoticeTimer.value--;
          globals.closedDoorsNoticeTimer.timeChangeCounter = 0;
        }
      }
    }
  }
}
