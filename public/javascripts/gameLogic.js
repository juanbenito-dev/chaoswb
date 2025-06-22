import HighScore from "./HighScore.js";
import globals from "./globals.js";
import detectCollisions from "./collisionsLogic.js";
import {
  Game,
  Sound,
  SpriteID,
  State,
  ParticleID,
  ParticleState,
} from "./constants.js";
import {
  checkIfMusicIsPlayingAndIfSoResetIt,
  initMainMenu,
  initStoryMenu,
  initHighScoresMenu,
  initControlsMenu,
  initLevel,
  initGameOver,
  initGameWon,
  initRageSymbolParticles,
  createControlsMenuSparkle,
  createLavaParticle,
} from "./initialize.js";
import { updateEvents } from "./events.js";

export default function update() {
  // |||||||||||| CHANGE WHAT THE GAME IS DOING BASED ON THE GAME STATE
  switch (globals.gameState) {
    case Game.LOADING:
      updateLoading();
      playSound();
      break;

    case Game.LOADING_MAIN_MENU:
      initMainMenu();
      break;

    case Game.MAIN_MENU:
      updateMainMenu();
      break;

    case Game.LOADING_STORY_MENU:
      initStoryMenu();
      break;

    case Game.STORY_MENU:
      updateStoryMenu();
      break;

    case Game.LOADING_HIGH_SCORES_MENU:
      initHighScoresMenu();
      break;

    case Game.HIGH_SCORES_MENU:
      updateHighScoresMenu();
      break;

    case Game.LOADING_CONTROLS_MENU:
      initControlsMenu();
      break;

    case Game.CONTROLS_MENU:
      updateControlsMenu();
      break;

    case Game.LOADING_LEVEL:
      updateLoadingLevel();
      break;

    case Game.PLAYING:
      playLevel();
      break;

    case Game.LOADING_GAME_OVER:
      initGameOver();
      break;

    case Game.OVER:
      updateGameOver();
      break;

    case Game.LOADING_GAME_WON:
      initGameWon();
      break;

    case Game.WON:
      updateGameWon();
      break;
  }
}

function updateLoading() {
  if (
    globals.assetsLoadProgressAsPercentage === 100 &&
    globals.action.confirmSelection
  ) {
    globals.action.confirmSelection = false;
    globals.currentSound = Sound.CONFIRM_SELECTION;
    globals.gameState = Game.LOADING_MAIN_MENU;
  }
}

function playSound() {
  if (globals.currentSound !== Sound.NO_SOUND) {
    // |||||||||||| PLAY THE SOUND THAT HAS BEEN INVOKED
    globals.sounds[globals.currentSound].currentTime = 0;
    globals.sounds[globals.currentSound].play();

    // |||||||||||| RESET "currentSound"
    globals.currentSound = Sound.NO_SOUND;
  }
}

function updateMainMenu() {
  updateMainMenuSprites();
  updateCurrentMainMenuSelection();
  updateCurrentScreenFromMainMenu();
  playSound();
}

function updateMainMenuSprites() {
  for (let i = 0; i < globals.mainMenuSprites.length; i++) {
    const sprite = globals.mainMenuSprites[i];

    updateMainMenuSprite(sprite);
  }
}

function updateMainMenuSprite(sprite) {
  const type = sprite.id;

  switch (type) {
    // |||||||||||| SUN
    case SpriteID.SUN:
      updateSun(sprite);
      break;
  }
}

function updateSun(sprite) {
  if (sprite.nextAngleChangeDelay.value === 0) {
    sprite.angle += 45;
    sprite.nextAngleChangeDelay.value = 1;
  } else {
    sprite.nextAngleChangeDelay.timeChangeCounter += globals.deltaTime;

    if (
      sprite.nextAngleChangeDelay.timeChangeCounter >=
      sprite.nextAngleChangeDelay.timeChangeValue
    ) {
      sprite.nextAngleChangeDelay.value -= 1;
      sprite.nextAngleChangeDelay.timeChangeCounter = 0;
    }
  }
}

function updateCurrentMainMenuSelection() {
  if (globals.action.moveLeft) {
    switch (globals.currentMainMenuSelection) {
      case "HIGH SCORES":
        globals.currentMainMenuSelection = "NEW GAME";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;

      case "CONTROLS":
        globals.currentMainMenuSelection = "STORY";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;
    }
  } else if (globals.action.moveRight) {
    switch (globals.currentMainMenuSelection) {
      case "NEW GAME":
        globals.currentMainMenuSelection = "HIGH SCORES";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;

      case "STORY":
        globals.currentMainMenuSelection = "CONTROLS";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;
    }
  } else if (globals.action.moveDown) {
    switch (globals.currentMainMenuSelection) {
      case "NEW GAME":
        globals.currentMainMenuSelection = "STORY";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;

      case "HIGH SCORES":
        globals.currentMainMenuSelection = "CONTROLS";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;
    }
  } else if (globals.action.moveUp) {
    switch (globals.currentMainMenuSelection) {
      case "STORY":
        globals.currentMainMenuSelection = "NEW GAME";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;

      case "CONTROLS":
        globals.currentMainMenuSelection = "HIGH SCORES";
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;
    }
  }
}

function updateCurrentScreenFromMainMenu() {
  if (globals.action.confirmSelection) {
    globals.currentSound = Sound.CONFIRM_SELECTION;

    switch (globals.currentMainMenuSelection) {
      case "NEW GAME":
        globals.gameState = Game.LOADING_LEVEL;
        break;

      case "STORY":
        globals.gameState = Game.LOADING_STORY_MENU;
        break;

      case "HIGH SCORES":
        globals.didPlayerEnterHighScoresMenuFromMainMenu = true;
        globals.gameState = Game.LOADING_HIGH_SCORES_MENU;
        break;

      case "CONTROLS":
        globals.gameState = Game.LOADING_CONTROLS_MENU;
        break;
    }
  }
}

function returnToTheMainMenu() {
  if (globals.action.return) {
    globals.gameState = Game.LOADING_MAIN_MENU;
  }
}

function updateStoryMenu() {
  returnToTheMainMenu();
}

function updateHighScoresMenu() {
  if (globals.didPlayerEnterHighScoresMenuFromMainMenu) {
    updateCurrentScoresPage();
    playSound();
  }
  updateCurrentScreenFromHighScores();
}

function updateCurrentScoresPage() {
  if (globals.action.moveRight && globals.currentScoresPage === 1) {
    globals.currentScoresPage = 2;

    globals.currentSound = Sound.CHANGE_MENU_SELECTION;

    globals.horizontalSkewForEvenDataRecords = 0.5;
    globals.verticalSkewForEvenDataRecords = 0.5;
    globals.horizontalSkewForOddDataRecords = -0.5;
    globals.verticalSkewForOddDataRecords = -0.5;

    globals.action.moveRight = false;
  } else if (globals.action.moveLeft && globals.currentScoresPage === 2) {
    globals.currentScoresPage = 1;

    globals.currentSound = Sound.CHANGE_MENU_SELECTION;

    globals.horizontalSkewForEvenDataRecords = 0.5;
    globals.verticalSkewForEvenDataRecords = 0.5;
    globals.horizontalSkewForOddDataRecords = -0.5;
    globals.verticalSkewForOddDataRecords = -0.5;

    globals.action.moveLeft = false;
  }
}

function updateCurrentScreenFromHighScores() {
  if (
    globals.action.return &&
    globals.highScoresMenuNoticeOnTheBottomData.noticeFontSize === 8
  ) {
    globals.gameState = Game.LOADING_MAIN_MENU;
  } else if (
    globals.action.return &&
    globals.highScoresMenuNoticeOnTheBottomData.noticeFontSize === 6.185
  ) {
    globals.didPlayerEnterHighScoresMenuFromMainMenu = true;

    globals.gameState = Game.LOADING_HIGH_SCORES_MENU;

    globals.action.return = false;
  }
}

function updateControlsMenu() {
  updateControlsMenuParticles();
  returnToTheMainMenu();
}

function updateControlsMenuParticles() {
  for (let i = 0; i < globals.controlsMenuParticles.length; i++) {
    const particle = globals.controlsMenuParticles[i];

    if (particle.state === ParticleState.OFF) {
      globals.controlsMenuParticles.splice(i, 1);
      i--;
      createControlsMenuSparkle();
    } else {
      updateControlsMenuParticle(particle);
    }
  }
}

function updateControlsMenuParticle(particle) {
  const type = particle.id;

  switch (type) {
    case ParticleID.CONTROLS_MENU_SPARKLE:
      updateControlsMenuSparkle(particle);
      break;
  }
}

function updateControlsMenuSparkle(particle) {
  particle.alpha -= 0.01;
  if (particle.alpha <= 0) {
    particle.state = ParticleState.OFF;
  }
}

function updateLoadingLevel() {
  checkIfMusicIsPlayingAndIfSoResetIt();

  if (globals.levelInitializationTimer.value === 0) {
    globals.levelInitializationTimer.value =
      globals.levelInitializationTimer.valueToStartCountingFrom;

    initLevel();
  } else {
    globals.levelInitializationTimer.timeChangeCounter += globals.deltaTime;

    if (
      globals.levelInitializationTimer.timeChangeCounter >=
      globals.levelInitializationTimer.timeChangeValue
    ) {
      globals.levelInitializationTimer.value--;
      globals.levelInitializationTimer.timeChangeCounter = 0;
    }
  }
}

function playLevel() {
  // |||||||||||| UPDATE PHYSICS
  updateSpritesPhysics();

  // |||||||||||| UPDATE PARTICLES
  updateLevelParticles();

  // |||||||||||| DETECT COLLISIONS
  detectCollisions();

  // |||||||||||| UPDATE CAMERA
  updateCamera();

  // |||||||||||| UPDATE LOGIC
  updateSpritesLogic();

  playSound();

  // |||||||||||| UPDATE EVENTS
  updateEvents();

  checkIfGameOver();

  checkIfLvlChangesOrPlayerWon();
}

function updateSpritesPhysics() {
  for (let i = 0; i < globals.levelSprites.length; i++) {
    const sprite = globals.levelSprites[i];

    if (sprite.state === State.OFF) {
      globals.levelSprites.splice(i, 1);
      i--;
    } else {
      sprite.updatePhysics();
    }
  }
}

function updateLevelParticles() {
  for (let i = 0; i < globals.levelParticles.length; i++) {
    let particle = globals.levelParticles[i];

    if (
      particle.id !== ParticleID.RAGE_SYMBOL &&
      particle.state === ParticleState.OFF
    ) {
      globals.levelParticles.splice(i, 1);
      i--;

      if (particle.id === ParticleID.LAVA) {
        createLavaParticle(particle.xInit, particle.yInit);
      }
    } else {
      updateLevelParticle(particle);

      if (globals.numOfRageSymbolParticlesOFF === 10) {
        for (let j = 0; j < globals.levelParticles.length; j++) {
          particle = globals.levelParticles[j];

          if (particle.id === ParticleID.RAGE_SYMBOL) {
            globals.levelParticles.splice(j, 1);
            j--;
          }
        }

        initRageSymbolParticles();

        globals.numOfRageSymbolParticlesOFF = 0;
      }
    }
  }
}

function updateLevelParticle(particle) {
  const type = particle.id;

  switch (type) {
    case ParticleID.RAGE_SYMBOL:
      updateRageSymbolParticle(particle);
      break;

    case ParticleID.CHECKPOINT:
      updateCheckpointParticle(particle);
      break;

    case ParticleID.LAVA:
      updateLavaParticle(particle);
      break;

    case ParticleID.ENEMY_DEATH:
      updateEnemyDeathParticle(particle);
      break;

    case ParticleID.HAMMER_HIT:
      updateHammerHitParticle(particle);
      break;
  }
}

function updateRageSymbolParticle(particle) {
  particle.fadeCounter += globals.deltaTime;

  switch (particle.state) {
    case ParticleState.ON:
      if (particle.fadeCounter >= particle.timeToFade) {
        particle.fadeCounter = 0;
        particle.state = ParticleState.FADE;
      }
      break;

    case ParticleState.FADE:
      particle.alpha -= 0.05;
      if (particle.alpha <= 0) {
        particle.state = ParticleState.OFF;
      }
      break;

    case ParticleState.OFF:
      globals.numOfRageSymbolParticlesOFF++;
      break;
  }

  particle.xPos += particle.physics.vx * globals.deltaTime;
  particle.yPos += particle.physics.vy * globals.deltaTime;
}

function updateCheckpointParticle(particle) {
  particle.fadeCounter += globals.deltaTime;

  switch (particle.state) {
    case ParticleState.ON:
      if (particle.fadeCounter >= particle.timeToFade) {
        particle.fadeCounter = 0;
        particle.state = ParticleState.FADE;
      }
      break;

    case ParticleState.FADE:
      particle.alpha -= 0.05;
      if (particle.alpha <= 0) {
        particle.state = ParticleState.OFF;
      }
      break;
  }

  particle.xPos += particle.physics.vx * globals.deltaTime;
  particle.yPos += particle.physics.vy * globals.deltaTime;
}

function updateLavaParticle(particle) {
  particle.fadeCounter += globals.deltaTime;

  switch (particle.state) {
    case ParticleState.ON:
      if (particle.fadeCounter >= particle.timeToFade) {
        particle.fadeCounter = 0;
        particle.state = ParticleState.FADE;
      }
      break;

    case ParticleState.FADE:
      particle.alpha -= 0.05;
      if (particle.alpha <= 0) {
        particle.state = ParticleState.OFF;
      }
      break;
  }

  particle.yPos += particle.physics.vy * globals.deltaTime;
}

function updateEnemyDeathParticle(particle) {
  particle.fadeCounter += globals.deltaTime;

  switch (particle.state) {
    case ParticleState.ON:
      if (particle.fadeCounter >= particle.timeToFade) {
        particle.fadeCounter = 0;
        particle.state = ParticleState.FADE;
      }
      break;

    case ParticleState.FADE:
      particle.alpha -= 0.05;
      if (particle.alpha <= 0) {
        particle.state = ParticleState.OFF;
      }
      break;
  }

  particle.physics.vx += particle.physics.ax * globals.deltaTime;
  particle.physics.vy += particle.physics.ay * globals.deltaTime;

  particle.xPos += particle.physics.vx * globals.deltaTime;
  particle.yPos += particle.physics.vy * globals.deltaTime;
}

function updateHammerHitParticle(particle) {
  particle.disappearanceTimer.timeChangeCounter += globals.deltaTime;
  if (
    particle.disappearanceTimer.timeChangeCounter >=
    particle.disappearanceTimer.timeChangeValue
  ) {
    particle.state = ParticleState.OFF;
  }

  particle.physics.vx += particle.physics.ax * globals.deltaTime;
  particle.physics.vy += particle.physics.ay * globals.deltaTime;

  // |||||||||||| LIMIT THE VELOCITIES TO 1, IN ORDER TO AVOID DIRECTION CHANGES

  const velModule = Math.sqrt(
    particle.physics.vx ** 2 + particle.physics.vy ** 2
  );

  if (velModule < 1) {
    particle.physics.vx = 0;
    particle.physics.vy = 0;
  }

  particle.xPos += particle.physics.vx * globals.deltaTime;
  particle.yPos += particle.physics.vy * globals.deltaTime;
}

function updateCamera() {
  // |||||||||||| FOCUS THE CAMERA ON THE PLAYER

  const player = globals.levelSprites[0];

  const levelWidth = globals.level.data[0].length * 16;
  const levelHeight = globals.level.data.length * 16;

  const cameraX = Math.max(
    Math.floor(player.xPos) +
      Math.floor((player.imageSet.xDestinationSize - globals.canvas.width) / 2),
    0
  );
  globals.camera.x = Math.min(cameraX, levelWidth - globals.canvas.width);

  const cameraY = Math.max(
    Math.floor(player.yPos) +
      Math.floor(
        (player.imageSet.yDestinationSize - globals.canvas.height) / 2
      ),
    0
  );
  globals.camera.y = Math.min(cameraY, levelHeight - globals.canvas.height);
}

function updateSpritesLogic() {
  for (let i = 0; i < globals.levelSprites.length; i++) {
    const sprite = globals.levelSprites[i];
    sprite.updateLogic();
  }
}

function checkIfGameOver() {
  const player = globals.levelSprites[0];

  if (player.lifePoints <= 0) {
    globals.level.number = 1;

    globals.gameState = Game.LOADING_GAME_OVER;
  }
}

function checkIfLvlChangesOrPlayerWon() {
  const player = globals.levelSprites[0];

  if (player.collisions.isCollidingWithOpenDoor) {
    if (globals.level.number === 1) {
      globals.level.number = 2;

      globals.gameState = Game.LOADING_LEVEL;
    } else {
      globals.level.number = 1;

      globals.gameState = Game.LOADING_GAME_WON;
    }
  }
}

function updateGameOver() {
  if (!globals.wasLastGamePlayerNameEntered) {
    updateLastGamePlayerNameInsertion();
  } else {
    updateCurrentGameOverSelection();
    updateCurrentScreenFromGameOver();
  }

  playSound();
}

function updateLastGamePlayerNameInsertion() {
  const alphabet = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  if (globals.action.moveUp) {
    for (let i = 0; i < alphabet.length; i++) {
      if (
        globals.lastGamePlayerName[
          globals.lastGamePlayerNameCurrentLetterIndex
        ] === alphabet[i] &&
        i !== 0
      ) {
        globals.lastGamePlayerName[
          globals.lastGamePlayerNameCurrentLetterIndex
        ] = alphabet[i - 1];
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;
      }
    }

    globals.action.moveUp = false;
  } else if (globals.action.moveDown) {
    for (let i = 0; i < alphabet.length; i++) {
      if (
        globals.lastGamePlayerName[
          globals.lastGamePlayerNameCurrentLetterIndex
        ] === alphabet[i] &&
        i !== alphabet.length - 1
      ) {
        globals.lastGamePlayerName[
          globals.lastGamePlayerNameCurrentLetterIndex
        ] = alphabet[i + 1];
        globals.currentSound = Sound.CHANGE_MENU_SELECTION;
        break;
      }
    }

    globals.action.moveDown = false;
  } else if (
    globals.action.moveLeft &&
    globals.lastGamePlayerNameCurrentLetterIndex !== 0
  ) {
    globals.lastGamePlayerNameCurrentLetterIndex--;
    globals.currentSound = Sound.CHANGE_MENU_SELECTION;
    globals.action.moveLeft = false;
  } else if (
    globals.action.moveRight &&
    globals.lastGamePlayerNameCurrentLetterIndex !== 2
  ) {
    globals.lastGamePlayerNameCurrentLetterIndex++;
    globals.currentSound = Sound.CHANGE_MENU_SELECTION;
    globals.action.moveRight = false;
  } else if (globals.action.confirmSelection) {
    globals.action.confirmSelection = false;

    globals.currentSound = Sound.CONFIRM_SELECTION;

    globals.wasLastGamePlayerNameEntered = true;

    const lastGamePlayerName = globals.lastGamePlayerName.join("");

    const lastGamePlayerData = new HighScore(
      -1,
      lastGamePlayerName,
      globals.score
    );
    lastGamePlayerData.isLastGamePlayer = true;

    globals.highScores.push(lastGamePlayerData);

    insertNewScoreIntoDB(lastGamePlayerData);
  }
}

async function insertNewScoreIntoDB(lastGamePlayerData) {
  // |||||||||||| RELATIVE PATH TO THE FILE MAKING THE REQUEST
  const url = "/scores";

  // |||||||||||| STRING DATA TO SEND
  const dataToSend = `name=${lastGamePlayerData.name}&score=${lastGamePlayerData.score}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: dataToSend,
  });

  if (!response.ok) {
    alert(`Communication error: ${response.statusText}`);
  }
}

function updateCurrentGameOverSelection() {
  if (
    globals.action.moveDown &&
    globals.currentGameOverSelection === "CHECK HIGH SCORES TABLE"
  ) {
    globals.currentGameOverSelection = "RETURN TO THE MAIN MENU";
    globals.currentSound = Sound.CHANGE_MENU_SELECTION;
  } else if (
    globals.action.moveUp &&
    globals.currentGameOverSelection === "RETURN TO THE MAIN MENU"
  ) {
    globals.currentGameOverSelection = "CHECK HIGH SCORES TABLE";
    globals.currentSound = Sound.CHANGE_MENU_SELECTION;
  }
}

function updateCurrentScreenFromGameOver() {
  if (
    globals.action.confirmSelection &&
    globals.currentGameOverSelection === "CHECK HIGH SCORES TABLE"
  ) {
    globals.didPlayerEnterHighScoresMenuFromMainMenu = false;
    globals.currentSound = Sound.CONFIRM_SELECTION;
    globals.gameState = Game.LOADING_HIGH_SCORES_MENU;
  } else if (
    globals.action.confirmSelection &&
    globals.currentGameOverSelection === "RETURN TO THE MAIN MENU"
  ) {
    globals.currentSound = Sound.CONFIRM_SELECTION;
    globals.gameState = Game.LOADING_MAIN_MENU;

    // |||||||||||| AVOID STARTING NEW GAME JUST AFTER CONFIRMING THE CURRENT SELECTION
    globals.action.confirmSelection = false;
  }
}

function updateGameWon() {
  updateGameWonToGameOverTimer();
}

function updateGameWonToGameOverTimer() {
  if (globals.gameWonToGameOverTimer.value === 0) {
    globals.gameState = Game.LOADING_GAME_OVER;
  } else {
    globals.gameWonToGameOverTimer.timeChangeCounter += globals.deltaTime;

    if (
      globals.gameWonToGameOverTimer.timeChangeCounter >=
      globals.gameWonToGameOverTimer.timeChangeValue
    ) {
      globals.gameWonToGameOverTimer.value--;
      globals.gameWonToGameOverTimer.timeChangeCounter = 0;
    }
  }
}
