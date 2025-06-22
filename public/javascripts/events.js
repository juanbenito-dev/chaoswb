import globals from "./globals.js";
import { Game, Sound, SpriteID, Key } from "./constants.js";
import { initHellBatHandToHand } from "./initialize.js";

function updateMusic() {
  if (globals.currentMusic !== Sound.NO_SOUND) {
    let buffer = 0.275;
    if (globals.currentMusic === Sound.GAME_WON_MUSIC) {
      buffer = 0;
    }

    const music = globals.sounds[globals.currentMusic];

    if (music.currentTime >= music.duration - buffer) {
      music.currentTime = 0;
      music.play();
    }
  }
}

function lowerPlayerLifePointsDueToRageBeing100() {
  const player = globals.levelSprites[0];

  if (
    player.rageLevel === 100 &&
    player.nextLifePointsReductionDelay.value === 0
  ) {
    player.lifePoints -= 0.25;
    player.nextLifePointsReductionDelay.value = 5;
  } else if (
    player.rageLevel === 100 &&
    player.nextLifePointsReductionDelay.value > 0
  ) {
    player.nextLifePointsReductionDelay.timeChangeCounter += globals.deltaTime;

    if (
      player.nextLifePointsReductionDelay.timeChangeCounter >=
      player.nextLifePointsReductionDelay.timeChangeValue
    ) {
      player.nextLifePointsReductionDelay.value--;
      player.nextLifePointsReductionDelay.timeChangeCounter = 0;
    }
  } else {
    player.nextLifePointsReductionDelay.value = 5;
    player.nextLifePointsReductionDelay.timeChangeCounter = 0;
  }
}

function speedUpHarmfulElementsThrow() {
  const player = globals.levelSprites[0];

  let valueToStartCountingFrom;
  if (player.rageLevel > 75) {
    valueToStartCountingFrom = 2;
  } else if (player.rageLevel > 50) {
    valueToStartCountingFrom = 3;
  } else if (player.rageLevel > 25) {
    valueToStartCountingFrom = 4;
  } else {
    valueToStartCountingFrom = 5;
  }

  // |||||||||||| ARROWS
  for (let i = 1; i < globals.levelSprites.length; i++) {
    if (globals.levelSprites[i].id === SpriteID.CHAOTIC_HUMAN_BOW) {
      const chaoticHumanBow = globals.levelSprites[i];

      chaoticHumanBow.nextArrowShotDelay.valueToStartCountingFrom =
        valueToStartCountingFrom;
    }
  }

  // |||||||||||| ACID
  for (let i = 1; i < globals.levelSprites.length; i++) {
    if (globals.levelSprites[i].id === SpriteID.HELL_BAT_ACID) {
      const hellBatAcid = globals.levelSprites[i];

      hellBatAcid.nextAcidDropDelay.valueToStartCountingFrom =
        valueToStartCountingFrom;
    }
  }
}

function doFastWormsFly() {
  const randomNumBetween1AndN = Math.floor(Math.random() * 100) + 1;

  // |||||||| IF A 1 IS GOTTEN & THE FAST WORMS ARE NOT CURRENTLY FLYING, MAKE THEM DO SO FOR A NUMBER OF SECONDS
  if (randomNumBetween1AndN === 1 && !globals.doFastWormsFly) {
    globals.doFastWormsFly = true;
  }

  if (globals.fastWormsFlyingStateTimer.value === 0) {
    globals.fastWormsFlyingStateTimer.value = 20;
    globals.doFastWormsFly = false;
  } else if (globals.doFastWormsFly) {
    globals.fastWormsFlyingStateTimer.timeChangeCounter += globals.deltaTime;

    if (
      globals.fastWormsFlyingStateTimer.timeChangeCounter >=
      globals.fastWormsFlyingStateTimer.timeChangeValue
    ) {
      globals.fastWormsFlyingStateTimer.value--;
      globals.fastWormsFlyingStateTimer.timeChangeCounter = 0;
    }
  }
}

function makeHellBatsAppearDueToRageBeingOver75() {
  const player = globals.levelSprites[0];

  if (player.rageLevel > 75) {
    if (globals.rageLevelToReachToMakeHellBatsAppear === 0) {
      globals.rageLevelToReachToMakeHellBatsAppear =
        Math.ceil(Math.random() * (100 - 76)) + 76;
    }

    // |||||||| MAKE TWO HELL BATS (HAND-TO-HAND) SPAWN NEAR THE PLAYER WHEN THE RANDOMLY CALCULATED RAGE LEVEL IS REACHED/EXCEEDED
    if (
      player.rageLevel >= globals.rageLevelToReachToMakeHellBatsAppear &&
      !globals.isHellBatsApparitionEventTakingPlace
    ) {
      globals.hellBatsApparitionEventSprites = [];
      globals.isHellBatsApparitionEventTakingPlace = true;

      const hellBatHandToHandXDestinationSize = 33;

      const hellBatHandToHandSpritesAttributes = [
        {
          xPos: player.xPos - hellBatHandToHandXDestinationSize,
          vLimit: -60,
          omega: 3,
          yRef: player.yPos + player.hitBox.yOffset,
          amplitude: 40,
        },
        {
          xPos: player.xPos + player.imageSet.xDestinationSize,
          vLimit: 60,
          omega: 3,
          yRef: player.yPos + player.hitBox.yOffset,
          amplitude: 40,
        },
      ];

      for (let i = 0; i < hellBatHandToHandSpritesAttributes.length; i++) {
        initHellBatHandToHand(
          true,
          hellBatHandToHandSpritesAttributes[i].xPos,
          hellBatHandToHandSpritesAttributes[i].vLimit,
          hellBatHandToHandSpritesAttributes[i].omega,
          hellBatHandToHandSpritesAttributes[i].yRef,
          hellBatHandToHandSpritesAttributes[i].amplitude,
        );
      }
    }
  }

  if (globals.hellBatsApparitionEventTimer.value === 0) {
    globals.rageLevelToReachToMakeHellBatsAppear = 0;
    globals.hellBatsApparitionEventTimer.value = 10;
    globals.isHellBatsApparitionEventTakingPlace = false;
  } else if (globals.isHellBatsApparitionEventTakingPlace) {
    globals.hellBatsApparitionEventTimer.timeChangeCounter += globals.deltaTime;

    if (
      globals.hellBatsApparitionEventTimer.timeChangeCounter >=
      globals.hellBatsApparitionEventTimer.timeChangeValue
    ) {
      globals.hellBatsApparitionEventTimer.value--;
      globals.hellBatsApparitionEventTimer.timeChangeCounter = 0;
    }
  }
}

function updateEvents() {
  lowerPlayerLifePointsDueToRageBeing100();

  if (globals.level.number === 1) {
    speedUpHarmfulElementsThrow();
  } else {
    doFastWormsFly();
    makeHellBatsAppearDueToRageBeingOver75();
  }
}

function isMagicalOrbThrowCanceledDueToRageBeing100() {
  const player = globals.levelSprites[0];

  let isMagicalOrbThrowCanceled = false;

  if (player.rageLevel === 100) {
    isMagicalOrbThrowCanceled = true;
  }

  return isMagicalOrbThrowCanceled;
}

function keydownHandler(event) {
  switch (event.keyCode) {
    case Key.ENTER:
      globals.action.confirmSelection = true;
      break;

    case Key.ESCAPE:
      globals.action.return = true;
      break;

    case Key.JUMP:
      globals.action.jump = true;
      break;

    case Key.LEFT:
      globals.action.moveLeft = true;
      break;

    case Key.UP:
      globals.action.moveUp = true;
      break;

    case Key.RIGHT:
      globals.action.moveRight = true;
      break;

    case Key.DOWN:
      globals.action.moveDown = true;
      break;

    case Key.A:
      globals.action.attackHandToHand = true;
      break;

    case Key.S:
      if (
        globals.gameState === Game.PLAYING &&
        !isMagicalOrbThrowCanceledDueToRageBeing100()
      ) {
        globals.action.throwMagicalOrb = true;
      }
      break;
  }
}

function keyupHandler(event) {
  switch (event.keyCode) {
    case Key.ENTER:
      globals.action.confirmSelection = false;
      break;

    case Key.ESCAPE:
      globals.action.return = false;
      break;

    case Key.JUMP:
      globals.action.jump = false;
      break;

    case Key.LEFT:
      globals.action.moveLeft = false;
      break;

    case Key.UP:
      globals.action.moveUp = false;
      break;

    case Key.RIGHT:
      globals.action.moveRight = false;
      break;

    case Key.DOWN:
      globals.action.moveDown = false;
      break;

    case Key.A:
      globals.action.attackHandToHand = false;
      break;

    case Key.S:
      globals.action.throwMagicalOrb = false;
      break;
  }
}

export { updateMusic, updateEvents, keydownHandler, keyupHandler };
