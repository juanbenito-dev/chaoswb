import Sprite from "./sprites/Sprite.js";
import Sun from "./sprites/Sun.js";
import Player from "./sprites/Player.js";
import MagicalOrb from "./sprites/MagicalOrb.js";
import ChaoticHumanBow from "./sprites/ChaoticHumanBow.js";
import Arrow from "./sprites/Arrow.js";
import ChaoticHumanSword from "./sprites/ChaoticHumanSword.js";
import FastWorm from "./sprites/FastWorm.js";
import HellBatAcid from "./sprites/HellBatAcid.js";
import Acid from "./sprites/Acid.js";
import HellBatHandToHand from "./sprites/HellBatHandToHand.js";
import Potion from "./sprites/Potion.js";
import ImageSet from "./ImageSet.js";
import Frames from "./Frames.js";
import Physics from "./Physics.js";
import HitBox from "./HitBox.js";
import Collisions from "./Collisions.js";
import Timer from "./Timer.js";
import Camera from "./Camera.js";
import HighScore from "./HighScore.js";
import globals from "./globals.js";
import {
  RageSymbolParticle,
  ControlsMenuSparkle,
  CheckpointParticle,
  LavaParticle,
  EnemyDeathParticle,
  HammerHitParticle,
} from "./Particle.js";
import { Level, level1, level2 } from "./Level.js";
import {
  Game,
  FPS,
  Sound,
  Block,
  SpriteID,
  State,
  GRAVITY,
  ParticleID,
  ParticleState,
} from "./constants.js";
import { updateMusic, keydownHandler, keyupHandler } from "./events.js";

function initVars() {
  // |||||||| INITIALIZE TIME MANAGEMENT VARIABLES
  globals.previousCycleMilliseconds = 0;
  globals.deltaTime = 0;
  globals.frameTimeObj = 1 / FPS;

  // |||||||| INITIALIZE GAME STATE
  globals.gameState = Game.LOADING;

  // |||||||| INITIALIZE STATE OF ACTIONS
  globals.action = {
    confirmSelection: false,
    return: false,
    jump: false,
    moveLeft: false,
    moveUp: false,
    moveRight: false,
    moveDown: false,
    attackHandToHand: false,
    throwMagicalOrb: false,
  };

  globals.currentMusic = Sound.NO_SOUND;
  globals.currentSound = Sound.NO_SOUND;

  globals.levelInitializationTimer = new Timer(8, 1, 8);
  initLoadingLevel1BackgroundImg();
  initLoadingLevel2BackgroundImg();
  initMap();
}

function initHTMLElements() {
  // |||||||| CANVAS, CONTEXT (SCREEN)
  globals.canvas = document.getElementById("gameScreen");
  globals.ctx = globals.canvas.getContext("2d");

  // |||||||| CANVAS, CONTEXT (HUD)
  globals.canvasHUD = document.getElementById("gameHUD");
  globals.ctxHUD = globals.canvasHUD.getContext("2d");

  // |||||||| ANTI-ALIASING DELETION
  globals.ctx.imageSmoothingEnabled = false;
  globals.ctxHUD.imageSmoothingEnabled = false;
}

async function loadDBDataAndInitEssentials() {
  const url = "/scores";

  const response = await fetch(url);

  if (response.ok) {
    const responseJSON = await response.json();

    initHighScores(responseJSON);

    initEvents();

    // |||||||||||| LOAD ASSETS SUCH AS TILEMAPS, IMAGES & SOUNDS
    loadAssets();

    globals.assetsLoadProgressAsPercentage =
      100 / (globals.assetsToLoad.length + 1);
  } else {
    alert(`Communication error: ${response.statusText}`);
  }
}

function initHighScores(responseJSON) {
  for (let i = 0; i < responseJSON.length; i++) {
    globals.highScores[i] = new HighScore(
      -1,
      responseJSON[i].name,
      responseJSON[i].score
    );
    globals.highScores[i].score = parseInt(globals.highScores[i].score);
  }
}

function initEvents() {
  // |||||||||||| ADD KEYBOARD EVENT LISTENERS
  window.addEventListener("keydown", keydownHandler, false);
  window.addEventListener("keyup", keyupHandler, false);
}

function loadAssets() {
  let tileSet;

  // |||||||||||| LOAD SPRITE SHEET
  tileSet = new Image();
  tileSet.addEventListener("load", loadHandler, false);
  tileSet.src = "./images/sprite-sheet.png";
  globals.tileSets.push(tileSet);
  globals.assetsToLoad.push(tileSet);

  // |||||||||||| LOAD MAP TILESET
  tileSet = new Image();
  tileSet.addEventListener("load", loadHandler, false);
  tileSet.src = "./images/map-tileset.png";
  globals.tileSets.push(tileSet);
  globals.assetsToLoad.push(tileSet);

  // |||||||||||| LOAD MUSIC

  const musicArray = [];

  const mainMenuMusic = document.querySelector("#mainMenuMusic");
  const storyMusic = document.querySelector("#storyMusic");
  const highScoresMusic = document.querySelector("#highScoresMusic");
  const levelMusic = document.querySelector("#levelMusic");
  const gameOverMusic = document.querySelector("#gameOverMusic");
  const gameWonMusic = document.querySelector("#gameWonMusic");

  musicArray.push(
    mainMenuMusic,
    storyMusic,
    highScoresMusic,
    levelMusic,
    gameOverMusic,
    gameWonMusic
  );

  for (let i = 0; i < musicArray.length; i++) {
    musicArray[i].addEventListener("canplaythrough", loadHandler, false);
    musicArray[i].addEventListener("timeupdate", updateMusic, false);
    musicArray[i].load();
    globals.sounds.push(musicArray[i]);
    globals.assetsToLoad.push(musicArray[i]);
  }

  // |||||||||||| LOAD SOUNDS

  const soundsArray = [];

  const orbThrowSound = document.querySelector("#orbThrowSound");
  const jumpSound = document.querySelector("#jumpSound");
  const potionCollectionSound = document.querySelector(
    "#potionCollectionSound"
  );
  const hammerHitSound = document.querySelector("#hammerHitSound");
  const lifePointLostSound = document.querySelector("#lifePointLostSound");
  const checkpointReachedSound = document.querySelector(
    "#checkpointReachedSound"
  );
  const orbExplosionSound = document.querySelector("#orbExplosionSound");
  const changeMenuSelectionSound = document.querySelector(
    "#changeMenuSelectionSound"
  );
  const confirmSelectionSound = document.querySelector(
    "#confirmSelectionSound"
  );
  const witchLaughSound = document.querySelector("#witchLaughSound");

  soundsArray.push(
    orbThrowSound,
    jumpSound,
    potionCollectionSound,
    hammerHitSound,
    lifePointLostSound,
    checkpointReachedSound,
    orbExplosionSound,
    changeMenuSelectionSound,
    confirmSelectionSound,
    witchLaughSound
  );

  for (let i = 0; i < soundsArray.length; i++) {
    soundsArray[i].addEventListener("canplaythrough", loadHandler, false);
    soundsArray[i].load();
    globals.sounds.push(soundsArray[i]);
    globals.assetsToLoad.push(soundsArray[i]);
  }
}

// |||||||||||| CODE BLOCK TO CALL EACH TIME AN ASSET IS LOADED
function loadHandler() {
  globals.assetsLoaded++;

  globals.assetsLoadProgressAsPercentage +=
    100 / (globals.assetsToLoad.length + 1);

  if (globals.assetsLoadProgressAsPercentage > 100) {
    globals.assetsLoadProgressAsPercentage = Math.floor(
      globals.assetsLoadProgressAsPercentage
    );
  }

  if (globals.assetsLoaded === globals.assetsToLoad.length) {
    for (let i = 0; i < globals.tileSets.length; i++) {
      globals.tileSets[i].removeEventListener("load", loadHandler, false);
    }

    for (let i = 0; i < globals.sounds.length; i++) {
      globals.sounds[i].removeEventListener(
        "canplaythrough",
        loadHandler,
        false
      );
    }
  }
}

function initLoadingLevel1BackgroundImg() {
  const imageSet = new ImageSet(0, 2148, 597, 341, 597, 358, 75, 0, -1, -1);

  const frames = new Frames(1);

  const loadingLevel1BackgroundImg = new Sprite(
    SpriteID.BACKGROUND_IMG_LOADING_LEVEL_1,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.loadingLevel1BackgroundImg = loadingLevel1BackgroundImg;
}

function initLoadingLevel2BackgroundImg() {
  const imageSet = new ImageSet(1194, 2148, 597, 341, 597, 358, 80, 0, -1, -1);

  const frames = new Frames(1);

  const loadingLevel2BackgroundImg = new Sprite(
    SpriteID.BACKGROUND_IMG_LOADING_LEVEL_2,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.loadingLevel2BackgroundImg = loadingLevel2BackgroundImg;
}

function checkIfMusicIsPlayingAndIfSoResetIt() {
  if (globals.currentMusic !== Sound.NO_SOUND) {
    const music = globals.sounds[globals.currentMusic];
    music.pause();
    music.currentTime = 0;
  }
}

function setMusic(musicID) {
  globals.currentMusic = musicID;
  globals.sounds[globals.currentMusic].play();
  globals.sounds[globals.currentMusic].volume = 0.5;
}

function initMainMenu() {
  // |||||||||||| RESET GLOBAL VARIABLES USED ON THE MAIN MENU
  globals.mainMenuSprites = [];
  globals.currentMainMenuSelection = "NEW GAME";

  initMainMenuSprites();

  // |||||||||||| CHANGE GAME STATE
  globals.gameState = Game.MAIN_MENU;

  checkIfMusicIsPlayingAndIfSoResetIt();
  setMusic(Sound.MAIN_MENU_MUSIC);
}

function initMainMenuSprites() {
  // |||||||||||| INITIALIZE BACKGROUND IMAGE
  initMainMenuBackgroundImg();

  // |||||||||||| INITIALIZE THE REST OF THE SPRITES
  initNewGameIcon();
  initStoryIcon();
  initHighScoresIcon();
  initControlsIcon();
  initSun();
}

function initMainMenuBackgroundImg() {
  const imageSet = new ImageSet(0, 1432, 597, 341, 597, 358, 77, 0, -1, -1);

  const frames = new Frames(1);

  const mainMenuBackgroundImg = new Sprite(
    SpriteID.BACKGROUND_IMG_MAIN_MENU,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.mainMenuBackgroundImg = mainMenuBackgroundImg;
}

function initNewGameIcon() {
  const imageSet = new ImageSet(96, 1941, 64, 80, 96, 102.15, 0, 0, 28, 35);

  const frames = new Frames(1);

  const newGameIcon = new Sprite(
    SpriteID.NEW_GAME_ICON,
    State.STILL,
    114.5,
    133,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "NEW GAME" ICON TO ITS CORRESPONDING SPRITES ARRAY
  globals.mainMenuSprites.push(newGameIcon);
}

function initStoryIcon() {
  const imageSet = new ImageSet(0, 1846, 104, 88, 104, 97.15, 0, 7, 34, 34);

  const frames = new Frames(1);

  const storyIcon = new Sprite(
    SpriteID.STORY_ICON,
    State.STILL,
    109,
    234.5,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "STORY" ICON TO ITS CORRESPONDING SPRITES ARRAY
  globals.mainMenuSprites.push(storyIcon);
}

function initHighScoresIcon() {
  const imageSet = new ImageSet(0, 1941, 96, 96, 104, 102.15, 0, 0, 34, 34);

  const frames = new Frames(1);

  const highScoresIcon = new Sprite(
    SpriteID.HIGH_SCORES_ICON,
    State.STILL,
    305,
    133.5,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "HIGH SCORES" ICON TO ITS CORRESPONDING SPRITES ARRAY
  globals.mainMenuSprites.push(highScoresIcon);
}

function initControlsIcon() {
  const imageSet = new ImageSet(0, 1773, 112, 80, 112, 88.65, 0, 0, 40, 34);

  const frames = new Frames(1);

  const controlsIcon = new Sprite(
    SpriteID.CONTROLS_ICON,
    State.STILL,
    302,
    234,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "CONTROLS" ICON TO ITS CORRESPONDING SPRITES ARRAY
  globals.mainMenuSprites.push(controlsIcon);
}

function initSun() {
  const imageSet = new ImageSet(150, 150, 148, 148, 150, 150, 0, 0, 50, 50);

  const frames = new Frames(1);

  const sun = new Sun(SpriteID.SUN, State.STILL, 200, 155, imageSet, frames);

  // |||||||||||| ADD THE SUN TO ITS CORRESPONDING SPRITES ARRAY
  globals.mainMenuSprites.push(sun);
}

function initStoryMenu() {
  // |||||||||||| RESET GLOBAL VARIABLES USED ON THE STORY MENU
  globals.storyLineFromLeftSideXCoordinate = 0;
  globals.storyLineFromRightSideXCoordinate = globals.canvas.width;

  initStoryMenuBackgroundImg();

  // |||||||||||| CHANGE GAME STATE
  globals.gameState = Game.STORY_MENU;

  checkIfMusicIsPlayingAndIfSoResetIt();
  setMusic(Sound.STORY_MUSIC);
}

function initStoryMenuBackgroundImg() {
  const imageSet = new ImageSet(601, 1432, 597, 341, 601, 358, 74, 0, -1, -1);

  const frames = new Frames(1);

  const storyMenuBackgroundImg = new Sprite(
    SpriteID.BACKGROUND_IMG_STORY_MENU,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.storyMenuBackgroundImg = storyMenuBackgroundImg;
}

function initHighScoresMenu() {
  // |||||||||||| RESET GLOBAL VARIABLES USED ON THE HIGH SCORES MENU
  globals.currentScoresPage = 1;
  globals.lastGamePlayerPosition = 0;
  globals.horizontalSkewForEvenDataRecords = 0.5;
  globals.verticalSkewForEvenDataRecords = 0.5;
  globals.horizontalSkewForOddDataRecords = -0.5;
  globals.verticalSkewForOddDataRecords = -0.5;

  initHighScoresMenuBackgroundImg();

  sortHighScores();

  initNoticeOnTheBottom();

  // |||||||||||| CHANGE GAME STATE
  globals.gameState = Game.HIGH_SCORES_MENU;

  checkIfMusicIsPlayingAndIfSoResetIt();
  setMusic(Sound.HIGH_SCORES_MUSIC);
}

function initHighScoresMenuBackgroundImg() {
  const imageSet = new ImageSet(601, 1074, 597, 341, 601, 358, 110, 10, -1, -1);

  const frames = new Frames(1);

  const highScoresMenuBackgroundImg = new Sprite(
    SpriteID.BACKGROUND_IMG_HIGH_SCORES_MENU,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.highScoresMenuBackgroundImg = highScoresMenuBackgroundImg;
}

function sortHighScores() {
  // |||||||||||| SORT "highScores" ARRAY IN DESCENDING ORDER BY SCORE
  for (let i = 0; i < globals.highScores.length; i++) {
    for (let j = i + 1; j < globals.highScores.length; j++) {
      if (globals.highScores[i].score < globals.highScores[j].score) {
        const temporaryScore = globals.highScores[i];

        globals.highScores[i] = globals.highScores[j];

        globals.highScores[j] = temporaryScore;
      }

      globals.highScores[j].position = j + 1;
    }

    globals.highScores[i].position = i + 1;

    if (globals.highScores[i].isLastGamePlayer) {
      globals.highScores[i].isLastGamePlayer = false;
      globals.lastGamePlayerPosition = globals.highScores[i].position;
    }
  }
}

function initNoticeOnTheBottom() {
  if (
    globals.didPlayerEnterHighScoresMenuFromMainMenu ||
    (!globals.didPlayerEnterHighScoresMenuFromMainMenu &&
      globals.lastGamePlayerPosition >= 1 &&
      globals.lastGamePlayerPosition <= 10)
  ) {
    globals.highScoresMenuNoticeOnTheBottomData = {
      noticeString: "PRESS ESCAPE (esc) TO RETURN TO THE MAIN MENU",
      noticeFontSize: 8,
    };
  } else {
    globals.highScoresMenuNoticeOnTheBottomData = {
      noticeString:
        "PRESS ESCAPE (esc) TO CHECK THE BEST SCORES BEYOND THE FIRST THREE",
      noticeFontSize: 6.185,
    };
  }
}

function initControlsMenu() {
  // |||||||||||| RESET GLOBAL VARIABLES USED ON THE CONTROLS MENU
  globals.controlsMenuSprites = [];
  globals.controlsMenuParticles = [];

  initControlsMenuSprites();

  initControlsMenuParticles();

  // |||||||||||| CHANGE GAME STATE
  globals.gameState = Game.CONTROLS_MENU;

  checkIfMusicIsPlayingAndIfSoResetIt();
}

function initControlsMenuSprites() {
  // |||||||||||| INITIALIZE BACKGROUND IMAGE
  initControlsMenuBackgroundImg();

  // |||||||||||| INITIALIZE THE REST OF THE SPRITES
  initLeftArrowKey();
  initRightArrowKey();
  initSpaceKey();
  initALetterKey();
  initSLetterKey();
}

function initControlsMenuBackgroundImg() {
  const imageSet = new ImageSet(1204, 1432, 597, 341, 602, 358, 74, 0, -1, -1);

  const frames = new Frames(1);

  const controlsMenuBackgroundImg = new Sprite(
    SpriteID.BACKGROUND_IMG_CONTROLS_MENU,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.controlsMenuBackgroundImg = controlsMenuBackgroundImg;
}

function initLeftArrowKey() {
  const imageSet = new ImageSet(1496, 66, 19, 21, 22, 22, 0, 0, 17, 19);

  // |||||||||||| 3 FRAMES PER STATE
  const frames = new Frames(3);

  const leftArrowKey = new Sprite(
    SpriteID.LEFT_ARROW_KEY,
    State.STILL,
    414,
    82,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "LEFT ARROW" KEY TO ITS CORRESPONDING SPRITES ARRAY
  globals.controlsMenuSprites.push(leftArrowKey);
}

function initRightArrowKey() {
  const imageSet = new ImageSet(1496, 88, 19, 21, 22, 22, 0, 0, 17, 19);

  // |||||||||||| 3 FRAMES PER STATE
  const frames = new Frames(3);

  const rightArrowKey = new Sprite(
    SpriteID.RIGHT_ARROW_KEY,
    State.STILL,
    414,
    107.5,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "RIGHT ARROW" KEY TO ITS CORRESPONDING SPRITES ARRAY
  globals.controlsMenuSprites.push(rightArrowKey);
}

function initSpaceKey() {
  const imageSet = new ImageSet(1680, 22, 98, 21, 105, 22, 0, 0, 94, 17);

  // |||||||||||| 3 FRAMES PER STATE
  const frames = new Frames(3);

  const spaceKey = new Sprite(
    SpriteID.SPACE_KEY,
    State.STILL,
    337,
    132,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "SPACE" KEY TO ITS CORRESPONDING SPRITES ARRAY
  globals.controlsMenuSprites.push(spaceKey);
}

function initALetterKey() {
  const imageSet = new ImageSet(1584, 22, 19, 21, 22, 22, 0, 0, 17, 19);

  // |||||||||||| 3 FRAMES PER STATE
  const frames = new Frames(3);

  const ALetterKey = new Sprite(
    SpriteID.A_LETTER_KEY,
    State.STILL,
    414,
    193.5,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "A" LETTER KEY TO ITS CORRESPONDING SPRITES ARRAY
  globals.controlsMenuSprites.push(ALetterKey);
}

function initSLetterKey() {
  const imageSet = new ImageSet(1584, 44, 19, 21, 22, 22, 0, 0, 17, 19);

  // |||||||||||| 3 FRAMES PER STATE
  const frames = new Frames(3);

  const SLetterKey = new Sprite(
    SpriteID.S_LETTER_KEY,
    State.STILL,
    414,
    218.5,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE "S" LETTER KEY TO ITS CORRESPONDING SPRITES ARRAY
  globals.controlsMenuSprites.push(SLetterKey);
}

function initControlsMenuParticles() {
  initControlsMenuSparkles();
}

function initControlsMenuSparkles() {
  const numOfParticles = 10;

  for (let i = 0; i < numOfParticles; i++) {
    createControlsMenuSparkle();
  }
}

function createControlsMenuSparkle() {
  const xPos = Math.random() * globals.canvas.width;
  const yPos = Math.random() * globals.canvas.height;

  const alpha = 1.0;

  const width = 3.5;
  const height = 3.5;

  const radius = 3.5;

  const colors = [
    "rgb(215 255 252 / 0.75)",
    "rgb(246 251 148 / 0.75)",
    "rgb(106 176 201 / 0.75)",
  ];
  const randomColorsArrayIndex = Math.floor(Math.random() * colors.length);
  const color = colors[randomColorsArrayIndex];

  const particle = new ControlsMenuSparkle(
    ParticleID.CONTROLS_MENU_SPARKLE,
    ParticleState.FADE,
    xPos,
    yPos,
    null,
    alpha,
    width,
    height,
    radius,
    color
  );

  globals.controlsMenuParticles.push(particle);
}

function initLevel() {
  // |||||||||||| RESET GLOBAL VARIABLES (1)
  globals.HUDSprites = [];
  globals.levelSprites = [];
  globals.levelParticles = [];
  globals.doFastWormsFly = false;
  globals.numOfRageSymbolParticlesOFF = 0;

  // |||||||||||| INITIALIZE MAP
  initMap();

  // |||||||||||| INITIALIZE CAMERA
  initCamera();

  initCommonToTheTwoLevelsSprites();

  if (globals.level.number === 1) {
    // |||||||||||| RESET GLOBAL VARIABLES (2)
    globals.score = 0;

    initHighScore();

    initLevel1ExclusiveSprites();
  } else {
    // |||||||||||| RESET GLOBAL VARIABLES (3)
    globals.rageLevelToReachToMakeHellBatsAppear = 0;
    globals.hellBatsApparitionEventSprites = [];
    globals.isHellBatsApparitionEventTakingPlace = false;

    initLevel2ExclusiveSprites();

    initFastWormsFlyingStateTimer();

    initHellBatsApparitionEventTimer();
  }

  initLevelParticles();

  initClosedDoorsPosition();
  initClosedDoorsNoticeTimer();

  // |||||||||||| CHANGE GAME STATE
  globals.gameState = Game.PLAYING;

  checkIfMusicIsPlayingAndIfSoResetIt();
  setMusic(Sound.LEVEL_MUSIC);
}

function initMap() {
  const imageSet = new ImageSet(0, 0, 16, 16, 16, 16, 0, 0, 16, 16);

  if (!(globals.level instanceof Level)) {
    globals.level = new Level(null, imageSet);
  }

  let levelNMap;
  if (globals.level.number === 1) {
    levelNMap = level1;
  } else {
    levelNMap = level2;
  }
  globals.level.data = levelNMap;
}

function initCamera() {
  globals.camera = new Camera(0, 0);
}

function initCommonToTheTwoLevelsSprites() {
  // |||||||||||| INITIALIZE THE HUD SPRITES
  initTheEruditeHUD();
  initRageBarSymbol();
  initRageBarContainer();
  initRageBarContent();

  // |||||||||||| INITIALIZE BACKGROUND IMAGE
  initLevelBackgroundImg();

  // |||||||||||| INITIALIZE THE REST OF THE SPRITES
  initPlayer();
  initFastWorm();
  initPotionGreen();
}

function initHighScore() {
  for (let i = 0; i < globals.highScores.length; i++) {
    if (globals.highScore < globals.highScores[i].score) {
      globals.highScore = globals.highScores[i].score;
    }
  }
}

function initLevel1ExclusiveSprites() {
  initChaoticHumanBow();
  initHellBatAcid();
}

function initTheEruditeHUD() {
  const imageSet = new ImageSet(0, 1321, 85, 85, 85, 85, 0, 0, 85, 85);

  const frames = new Frames(5);

  const theEruditeHUD = new Sprite(
    SpriteID.THE_ERUDITE_HUD,
    State.STILL,
    181,
    0,
    imageSet,
    frames
  );

  // |||||||||||| ADD THE ERUDITE (HUD) TO ITS CORRESPONDING SPRITES ARRAY
  globals.HUDSprites.push(theEruditeHUD);
}

function initRageBarSymbol() {
  const imageSet = new ImageSet(0, 975, 71, 71, 75, 75, 0, 0, 25, 25);

  const frames = new Frames(3);

  const rageBarSymbol = new Sprite(
    SpriteID.RAGE_BAR_SYMBOL,
    State.STILL,
    281,
    30,
    imageSet,
    frames
  );

  // |||||||||||| ADD RAGE BAR'S SYMBOL TO ITS CORRESPONDING SPRITES ARRAY
  globals.HUDSprites.push(rageBarSymbol);
}

function initRageBarContainer() {
  const imageSet = new ImageSet(0, 1404, 112, 28, 112, 26, 0, 0, 112, 28);

  const frames = new Frames(1);

  const rageBarContainer = new Sprite(
    SpriteID.RAGE_BAR_CONTAINER,
    State.STILL,
    321,
    29,
    imageSet,
    frames
  );

  // |||||||||||| ADD RAGE BAR (CONTAINER) TO ITS CORRESPONDING SPRITES ARRAY
  globals.HUDSprites.push(rageBarContainer);
}

function initRageBarContent() {
  const imageSet = new ImageSet(112, 1404, 86, 14, 86, 14, 0, 0, 86, 14);

  const frames = new Frames(1);

  const rageBarContent = new Sprite(
    SpriteID.RAGE_BAR_CONTENT,
    State.STILL,
    334,
    36,
    imageSet,
    frames
  );

  // |||||||||||| ADD RAGE BAR (CONTENT) TO ITS CORRESPONDING SPRITES ARRAY
  globals.HUDSprites.push(rageBarContent);
}

function initLevelBackgroundImg() {
  let spriteID;
  let imageSet;
  if (globals.level.number === 1) {
    spriteID = SpriteID.BACKGROUND_IMG_LEVEL_1;
    imageSet = new ImageSet(0, 1063, 448, 256, 448, 329, 0, 0, -1, -1);
  } else {
    spriteID = SpriteID.BACKGROUND_IMG_LEVEL_2;
    imageSet = new ImageSet(1344, 1060, 448, 256, 448, 329, 0, 0, -1, -1);
  }

  const frames = new Frames(1);

  const levelBackgroundImg = new Sprite(
    spriteID,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.levelBackgroundImg = levelBackgroundImg;
}

function initPlayer() {
  let xPos;
  let yPos;
  if (globals.level.number === 1) {
    xPos = 26;
    yPos = 0;
  } else {
    xPos = 51;
    yPos = 2612;
  }

  const imageSet = new ImageSet(2048, 0, 59, 62, 64, 64, 3, 2, 43, 46);

  // |||||||||||| ANIMATION DATA CREATION: 9 (OR LESS IN THIS CASE) FRAMES PER STATE & ANIMATION SPEED
  const frames = new Frames(9, 3);

  const physics = new Physics(65, 0, 1, -145);
  if (globals.level.number === 2) {
    physics.isOnGround = true;
  }

  const hitBox = new HitBox(12, 34, 16, 5);

  const collisions = new Collisions();
  if (globals.level.number === 2) {
    collisions.isCollidingWithObstacleOnTheBottom = true;
  }

  // |||||||||||| LIFE POINTS, RANGING FROM 1 TO 5 (REPRESENTED BY X.G FACE'S DIFFERENT FRAMES)
  const lifePoints = 5;

  const afterAttackLeeway = new Timer(0, 1);

  let checkpoints;
  if (globals.level.number === 1) {
    checkpoints = [
      {
        xPosLowerLimit: xPos,
        xPosUpperLimit: xPos,
        yPosLowerLimit: yPos,
        yPosUpperLimit: yPos,
      },
      // {
      //     xPosLowerLimit: 120,
      //     xPosUpperLimit: 125,
      //     yPosLowerLimit: 535,
      //     yPosUpperLimit: 555,
      // },
      {
        xPosLowerLimit: 840,
        xPosUpperLimit: 845,
        yPosLowerLimit: 130,
        yPosUpperLimit: 205,
      },
      // {
      //     xPosLowerLimit: 1145,
      //     xPosUpperLimit: 1150,
      //     yPosLowerLimit: 660,
      //     yPosUpperLimit: 735,
      // },
      {
        xPosLowerLimit: 1815,
        xPosUpperLimit: 1820,
        yPosLowerLimit: 675,
        yPosUpperLimit: 700,
      },
    ];
  } else {
    checkpoints = [
      {
        xPosLowerLimit: xPos,
        xPosUpperLimit: xPos,
        yPosLowerLimit: yPos,
        yPosUpperLimit: yPos,
      },
      {
        xPosLowerLimit: 205,
        xPosUpperLimit: 210,
        yPosLowerLimit: 1510,
        yPosUpperLimit: 1580,
      },
    ];
  }

  const player = new Player(
    SpriteID.PLAYER,
    State.RIGHT_STILL,
    xPos,
    yPos,
    imageSet,
    frames,
    physics,
    hitBox,
    collisions,
    lifePoints,
    afterAttackLeeway,
    checkpoints
  );

  // |||||||||||| ADD PLAYER TO ITS CORRESPONDING SPRITES ARRAY
  globals.levelSprites.push(player);
}

function initMagicalOrb() {
  const player = globals.levelSprites[0];

  let magicalOrbXPos;
  let magicalOrbYPos = player.yPos + player.imageSet.yDestinationSize / 3;

  let vLimit;

  if (
    player.state === State.LEFT_ATTACK_MAGICAL_ORB ||
    player.state === State.LEFT_ATTACK_MAGICAL_ORB_JUMP
  ) {
    magicalOrbXPos = player.xPos;
    vLimit = -210;
  } else {
    magicalOrbXPos = player.xPos + player.imageSet.xDestinationSize;
    vLimit = 210;
  }

  const imageSet = new ImageSet(576, 512, 32, 32, 32, 32, 0, 0, 19, 19);

  const frames = new Frames(4, 1);

  const physics = new Physics(vLimit);
  physics.vx = vLimit;

  const hitBox = new HitBox(19, 19, 0, 0);

  const collisions = new Collisions();

  const magicalOrb = new MagicalOrb(
    SpriteID.MAGICAL_ORB,
    State.STILL,
    magicalOrbXPos,
    magicalOrbYPos,
    imageSet,
    frames,
    physics,
    hitBox,
    collisions
  );

  // |||||||||||| ADD MAGICAL ORB TO ITS CORRESPONDING SPRITES ARRAY
  globals.levelSprites.push(magicalOrb);
}

function initFastWorm() {
  // |||||||||||| CREATE ALL THE SPRITES FOR THE CAVE'S TWO SECTIONS (LEVELS)

  let fastWormSpritesAttributes;
  if (globals.level.number === 1) {
    fastWormSpritesAttributes = [
      {
        state: State.LEFT,
        xPos: 185,
        yPos: 177,
      },
      {
        state: State.RIGHT,
        xPos: 234,
        yPos: 483,
      },
      {
        state: State.RIGHT,
        xPos: 2012,
        yPos: 990,
      },
      {
        state: State.LEFT,
        xPos: 1960,
        yPos: 48,
      },
    ];
  } else {
    fastWormSpritesAttributes = [
      {
        state: State.RIGHT,
        xPos: 428,
        yPos: 2584,
      },
      {
        state: State.RIGHT,
        xPos: 107,
        yPos: 2176,
      },
      {
        state: State.RIGHT,
        xPos: 332,
        yPos: 1680,
      },
      {
        state: State.LEFT,
        xPos: 219,
        yPos: 1420,
      },
      {
        state: State.RIGHT,
        xPos: 234,
        yPos: 768,
      },
    ];
  }

  for (let i = 0; i < fastWormSpritesAttributes.length; i++) {
    const currentSpriteState = fastWormSpritesAttributes[i].state;

    const currentSpriteXPos = fastWormSpritesAttributes[i].xPos;
    const currentSpriteYPos = fastWormSpritesAttributes[i].yPos;

    const imageSet = new ImageSet(896, 512, 43, 49, 64, 64, 12, 0, 27, 33);

    // |||||||||||| ANIMATION DATA CREATION: 6 FRAMES PER STATE & ANIMATION SPEED
    const frames = new Frames(6, 4);

    const physics = new Physics(20);

    const hitBox = new HitBox(13, 28, 5, 3);

    const collisions = new Collisions();

    const lifePoints = 2;

    const afterAttackLeeway = new Timer(0, 1);

    const afterAttackStop = new Timer(0, 1);

    const fastWorm = new FastWorm(
      SpriteID.FAST_WORM,
      currentSpriteState,
      currentSpriteXPos,
      currentSpriteYPos,
      imageSet,
      frames,
      physics,
      hitBox,
      collisions,
      lifePoints,
      afterAttackLeeway,
      afterAttackStop
    );

    // |||||||||||| ADD FAST WORM TO ITS CORRESPONDING SPRITES ARRAY
    globals.levelSprites.push(fastWorm);
  }
}

function initPotionGreen(xPos = -1, yPos = -1) {
  let numOfSpritesToCreate;

  let potionGreenSpritesAttributes;
  if (globals.level.number === 1) {
    potionGreenSpritesAttributes = [
      {
        xPos: 337,
        yPos: 80,
      },
      {
        xPos: 209,
        yPos: 435,
      },
      {
        xPos: 689,
        yPos: 80,
      },
      {
        xPos: 2337,
        yPos: 977,
      },
      {
        xPos: 2354,
        yPos: 675,
      },
    ];
  } else {
    potionGreenSpritesAttributes = [
      {
        xPos: 482,
        yPos: 2650,
      },
      {
        xPos: 257,
        yPos: 1952,
      },
      {
        xPos: 473,
        yPos: 1635,
      },
      {
        xPos: 434,
        yPos: 608,
      },
    ];
  }

  if (xPos === -1 && yPos === -1) {
    numOfSpritesToCreate = potionGreenSpritesAttributes.length;
  } else {
    numOfSpritesToCreate = 1;
  }

  for (let i = 0; i < numOfSpritesToCreate; i++) {
    let currentSpriteXPos;
    let currentSpriteYPos;

    if (numOfSpritesToCreate !== 1) {
      currentSpriteXPos = potionGreenSpritesAttributes[i].xPos;
      currentSpriteYPos = potionGreenSpritesAttributes[i].yPos;
    } else {
      currentSpriteXPos = xPos;
      currentSpriteYPos = yPos;
    }

    const imageSet = new ImageSet(748, 510, 28, 30, 34, 30, 0, 0, 14, 16);

    const frames = new Frames(1);

    const physics = new Physics(-1);

    const hitBox = new HitBox(14, 16, 0, 0);

    const collisions = new Collisions();

    const potionGreen = new Potion(
      SpriteID.POTION_GREEN,
      State.STILL,
      currentSpriteXPos,
      currentSpriteYPos,
      imageSet,
      frames,
      physics,
      hitBox,
      collisions
    );

    // |||||||||||| ADD POTION (GREEN) TO ITS CORRESPONDING SPRITES ARRAY
    globals.levelSprites.push(potionGreen);
  }
}

function initPotionBlue(xPos = -1, yPos = -1) {
  const imageSet = new ImageSet(714, 510, 28, 30, 34, 30, 0, 0, 14, 16);

  const frames = new Frames(1);

  const physics = new Physics(-1);

  const hitBox = new HitBox(14, 16, 0, 0);

  const collisions = new Collisions();

  const potionBlue = new Potion(
    SpriteID.POTION_BLUE,
    State.STILL,
    xPos,
    yPos,
    imageSet,
    frames,
    physics,
    hitBox,
    collisions
  );

  // |||||||||||| ADD POTION (BLUE) TO ITS CORRESPONDING SPRITES ARRAY
  globals.levelSprites.push(potionBlue);
}

function initChaoticHumanBow() {
  // |||||||||||| CREATE ALL THE SPRITES FOR THE CAVE'S FIRST SECTION (LEVEL)

  const chaoticHumanBowSpritesAttributes = [
    {
      state: State.LEFT_ATTACK_2,
      xPos: 293,
      yPos: 55,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 362,
      yPos: 151,
    },
    {
      state: State.RIGHT_ATTACK_2,
      xPos: 112,
      yPos: 328,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 458,
      yPos: 560,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 765,
      yPos: 343,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 1453,
      yPos: 128,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 1418,
      yPos: 168,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 1629,
      yPos: 530,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 1623,
      yPos: 800,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 2333,
      yPos: 854,
    },
    {
      state: State.RIGHT_ATTACK_2,
      xPos: 1985,
      yPos: 285,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 2333,
      yPos: 48,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 2788,
      yPos: 950,
    },
    {
      state: State.LEFT_ATTACK_2,
      xPos: 3188,
      yPos: 950,
    },
  ];

  for (let i = 0; i < chaoticHumanBowSpritesAttributes.length; i++) {
    const currentSpriteState = chaoticHumanBowSpritesAttributes[i].state;

    const currentSpriteXPos = chaoticHumanBowSpritesAttributes[i].xPos;
    const currentSpriteYPos = chaoticHumanBowSpritesAttributes[i].yPos;

    const imageSet = new ImageSet(1152, 0, 48, 64, 64, 63, 4, 0, 30, 46);

    // |||||||||||| ANIMATION DATA CREATION: 3 FRAMES PER STATE & ANIMATION SPEED
    const frames = new Frames(3, 6);

    const physics = new Physics(-1);

    const hitBox = new HitBox(13, 37, 9, 4);
    if (currentSpriteState === State.RIGHT_ATTACK_2) {
      hitBox.xSize = 12;
      hitBox.xOffset = 13;
    }

    const collisions = new Collisions();

    const lifePoints = 2;

    const afterAttackLeeway = new Timer(0, 1);

    const nextArrowShotDelay = new Timer(5, 1, 5);

    const chaoticHumanBow = new ChaoticHumanBow(
      SpriteID.CHAOTIC_HUMAN_BOW,
      currentSpriteState,
      currentSpriteXPos,
      currentSpriteYPos,
      imageSet,
      frames,
      physics,
      hitBox,
      collisions,
      lifePoints,
      afterAttackLeeway,
      nextArrowShotDelay
    );

    // |||||||||||| ADD CHAOTIC HUMAN (BOW) TO ITS CORRESPONDING SPRITES ARRAY
    globals.levelSprites.push(chaoticHumanBow);
  }
}

function initArrow(chaoticHumanBow) {
  let state;

  let xPos;
  let yPos =
    chaoticHumanBow.yPos + chaoticHumanBow.imageSet.yDestinationSize / 3.75;

  let vLimit;

  if (chaoticHumanBow.state === State.LEFT_ATTACK_2) {
    state = State.LEFT_4;
    xPos = chaoticHumanBow.xPos;
    vLimit = -210;
  } else {
    state = State.RIGHT_4;
    xPos = chaoticHumanBow.xPos + chaoticHumanBow.imageSet.xDestinationSize;
    vLimit = 210;
  }

  const imageSet = new ImageSet(580, 555, 16, 7, 20, 15, 0, 0, 16, 7);

  // |||||||||||| ANIMATION DATA CREATION: 1 FRAME PER STATE & ANIMATION SPEED
  const frames = new Frames(1, 1);

  const physics = new Physics(vLimit);
  physics.vx = vLimit;

  const hitBox = new HitBox(16, 7, 0, 0);

  const collisions = new Collisions();

  const arrow = new Arrow(
    SpriteID.ARROW,
    state,
    xPos,
    yPos,
    imageSet,
    frames,
    physics,
    hitBox,
    collisions
  );

  // |||||||||||| ADD ARROW TO ITS CORRESPONDING SPRITES ARRAY
  globals.levelSprites.push(arrow);
}

function initHellBatAcid() {
  // |||||||||||| CREATE ALL THE SPRITES FOR THE CAVE'S FIRST SECTION (LEVEL)

  const hellBatAcidSpritesAttributes = [
    {
      omega: 1,
      xRotCenter: 94,
      yRotCenter: 59,
      aRadius: 60,
      bRadius: 20,
    },
    {
      omega: 1.85,
      xRotCenter: 465,
      yRotCenter: 110,
      aRadius: 43,
      bRadius: 25,
    },
    {
      omega: 3,
      xRotCenter: 502,
      yRotCenter: 450,
      aRadius: 20,
      bRadius: 10,
    },
    {
      omega: 1,
      xRotCenter: 998,
      yRotCenter: 50,
      aRadius: 60,
      bRadius: 10,
    },
    {
      omega: 1.5,
      xRotCenter: 1300,
      yRotCenter: 80,
      aRadius: 110,
      bRadius: 40,
    },
    {
      omega: 1.25,
      xRotCenter: 1744,
      yRotCenter: 325,
      aRadius: 45,
      bRadius: 30,
    },
    {
      omega: 1.25,
      xRotCenter: 2183,
      yRotCenter: 805,
      aRadius: 95,
      bRadius: 30,
    },
    {
      omega: 2.5,
      xRotCenter: 2175,
      yRotCenter: 385,
      aRadius: 60,
      bRadius: 25,
    },
    {
      omega: 1.75,
      xRotCenter: 2286,
      yRotCenter: 275,
      aRadius: 40,
      bRadius: 25,
    },
    {
      omega: 1.85,
      xRotCenter: 2555,
      yRotCenter: 130,
      aRadius: 115,
      bRadius: 90,
    },
    {
      omega: 2.8,
      xRotCenter: 2785,
      yRotCenter: 95,
      aRadius: 88,
      bRadius: 55,
    },
    {
      omega: 2,
      xRotCenter: 2696,
      yRotCenter: 472,
      aRadius: 148,
      bRadius: 66,
    },
    {
      omega: 2,
      xRotCenter: 3057,
      yRotCenter: 472,
      aRadius: 148,
      bRadius: 66,
    },
  ];

  for (let i = 0; i < hellBatAcidSpritesAttributes.length; i++) {
    const imageSet = new ImageSet(1952, 1770, 92, 90, 122, 118, 30, 28, 52, 50);

    // |||||||||||| ANIMATION DATA CREATION: 6 (OR LESS IN THIS CASE) FRAMES PER STATE & ANIMATION SPEED
    const frames = new Frames(6, 7);

    // |||||||||||| INITIAL VALUES FOR "Physics"
    const initAngle = (270 * Math.PI) / 180;
    const currentSpriteOmega = hellBatAcidSpritesAttributes[i].omega;
    const currentSpriteXRotCenter = hellBatAcidSpritesAttributes[i].xRotCenter;
    const currentSpriteYRotCenter = hellBatAcidSpritesAttributes[i].yRotCenter;
    const currentSpriteARadius = hellBatAcidSpritesAttributes[i].aRadius;
    const currentSpriteBRadius = hellBatAcidSpritesAttributes[i].bRadius;

    const physics = new Physics(
      60,
      0,
      1,
      0,
      currentSpriteOmega,
      initAngle,
      currentSpriteXRotCenter,
      currentSpriteYRotCenter,
      0,
      currentSpriteARadius,
      currentSpriteBRadius
    );

    const hitBox = new HitBox(34, 27, 1, 12);

    const collisions = new Collisions();

    const lifePoints = 2;

    const afterAttackLeeway = new Timer(0, 1);

    const nextAcidDropDelay = new Timer(5, 1, 5);

    const hellBatAcid = new HellBatAcid(
      SpriteID.HELL_BAT_ACID,
      State.DOWN,
      -1,
      -1,
      imageSet,
      frames,
      physics,
      hitBox,
      collisions,
      lifePoints,
      afterAttackLeeway,
      nextAcidDropDelay
    );

    // |||||||||||| POSITION THE SPRITE
    hellBatAcid.setPosition();

    // |||||||||||| ADD HELL BAT (ACID) TO ITS CORRESPONDING SPRITES ARRAY
    globals.levelSprites.push(hellBatAcid);
  }
}

function initAcid(hellBatAcid) {
  const xPos = hellBatAcid.xPos + hellBatAcid.imageSet.xDestinationSize / 3.35;
  const yPos = hellBatAcid.yPos + hellBatAcid.imageSet.yDestinationSize / 2.5;

  const vLimit = 180;

  const imageSet = new ImageSet(570, 440, 19, 35, 30, 40, 7, 2, 4, 20);

  const frames = new Frames(4, 3);

  const physics = new Physics(vLimit);
  physics.vy = vLimit;

  const hitBox = new HitBox(4, 20, 0, 0);

  const collisions = new Collisions();

  const acid = new Acid(
    SpriteID.ACID,
    State.STILL,
    xPos,
    yPos,
    imageSet,
    frames,
    physics,
    hitBox,
    collisions
  );

  // |||||||||||| ADD ACID TO ITS CORRESPONDING SPRITES ARRAY
  globals.levelSprites.push(acid);
}

function initClosedDoorsPosition() {
  const currentLevel = globals.level.data;

  const brickSize = globals.level.imageSet.xGridSize;

  for (let i = 0; i < currentLevel.length; i++) {
    for (let j = 0; j < currentLevel[0].length; j++) {
      if (currentLevel[i][j] === Block.CLOSED_DOOR_CHUNK_1) {
        const closedDoorPosition = {
          xPos: j * brickSize,
          yPos: i * brickSize,
        };

        globals.closedDoorsPosition.push(closedDoorPosition);
      }
    }
  }
}

function initClosedDoorsNoticeTimer() {
  globals.closedDoorsNoticeTimer = new Timer(5, 1, 5);
}

function initLevel2ExclusiveSprites() {
  initChaoticHumanSword();
  initHellBatHandToHand(false);
}

function initChaoticHumanSword() {
  // |||||||||||| CREATE ALL THE SPRITES FOR THE CAVE'S SECOND SECTION (LEVEL)

  const chaoticHumanSwordSpritesAttributes = [
    {
      state: State.RIGHT_3,
      xPos: 200,
      yPos: 2395,
      vLimit: 40,
      maxTimeToChangeDirection: 3,
    },
    {
      state: State.RIGHT_3,
      xPos: 185,
      yPos: 2090,
      vLimit: 30,
      maxTimeToChangeDirection: 4,
    },
    {
      state: State.LEFT_3,
      xPos: 427,
      yPos: 1555,
      vLimit: 35,
      maxTimeToChangeDirection: 2.75,
    },
    {
      state: State.LEFT_3,
      xPos: 190,
      yPos: 1465,
      vLimit: 30,
      maxTimeToChangeDirection: 3,
    },
    {
      state: State.RIGHT_3,
      xPos: 236,
      yPos: 585,
      vLimit: 45,
      maxTimeToChangeDirection: 3.5,
    },
  ];

  for (let i = 0; i < chaoticHumanSwordSpritesAttributes.length; i++) {
    const currentSpriteState = chaoticHumanSwordSpritesAttributes[i].state;

    const currentSpriteXPos = chaoticHumanSwordSpritesAttributes[i].xPos;
    const currentSpriteYPos = chaoticHumanSwordSpritesAttributes[i].yPos;

    const imageSet = new ImageSet(576, 0, 56, 53, 64, 64, 3, 10, 44, 41);

    // |||||||||||| ANIMATION DATA CREATION: 9 (OR LESS IN THIS CASE) FRAMES PER STATE & ANIMATION SPEED
    const frames = new Frames(9, 3);

    const currentSpriteVLimit = chaoticHumanSwordSpritesAttributes[i].vLimit;
    const physics = new Physics(currentSpriteVLimit);

    const currentSpriteMaxTimeToChangeDirection =
      chaoticHumanSwordSpritesAttributes[i].maxTimeToChangeDirection;

    const hitBox = new HitBox(26, 40, 2, 1);

    const collisions = new Collisions();

    const lifePoints = 2;

    const afterAttackLeeway = new Timer(0, 1);

    const chaoticHumanSword = new ChaoticHumanSword(
      SpriteID.CHAOTIC_HUMAN_SWORD,
      currentSpriteState,
      currentSpriteXPos,
      currentSpriteYPos,
      imageSet,
      frames,
      physics,
      currentSpriteMaxTimeToChangeDirection,
      hitBox,
      collisions,
      lifePoints,
      afterAttackLeeway
    );

    // |||||||||||| ADD CHAOTIC HUMAN (SWORD) TO ITS CORRESPONDING SPRITES ARRAY
    globals.levelSprites.push(chaoticHumanSword);
  }
}

function initHellBatHandToHand(
  isFunctionInvokedFromEvent,
  xPos,
  vLimit,
  omega,
  yRef,
  amplitude
) {
  const hellBatHandToHandSpritesAttributes = [
    {
      xPos: 0,
      vLimit: 90,
      omega: 3.5,
      yRef: 2500,
      amplitude: 45,
    },
    {
      xPos: 0,
      vLimit: 80,
      omega: 3,
      yRef: 2315,
      amplitude: 82,
    },
    {
      xPos: 0,
      vLimit: 100,
      omega: 5,
      yRef: 1990,
      amplitude: 70,
    },
    {
      xPos: 0,
      vLimit: 130,
      omega: 4,
      yRef: 2130,
      amplitude: 55,
    },
    {
      xPos: 0,
      vLimit: 150,
      omega: 4,
      yRef: 1550,
      amplitude: 25,
    },
    {
      xPos: 0,
      vLimit: 100,
      omega: 3,
      yRef: 1092,
      amplitude: 75,
    },
    {
      xPos: 0,
      vLimit: 120,
      omega: 4,
      yRef: 894,
      amplitude: 70,
    },
    {
      xPos: 0,
      vLimit: 140,
      omega: 5,
      yRef: 733,
      amplitude: 43,
    },
    {
      xPos: 0,
      vLimit: 130,
      omega: 3.5,
      yRef: 394,
      amplitude: 52,
    },
    {
      xPos: 0,
      vLimit: 100,
      omega: 3,
      yRef: 173,
      amplitude: 120,
    },
  ];

  let numOfSpritesToCreate;
  if (isFunctionInvokedFromEvent) {
    numOfSpritesToCreate = 1;
  } else {
    numOfSpritesToCreate = hellBatHandToHandSpritesAttributes.length;
  }

  for (let i = 0; i < numOfSpritesToCreate; i++) {
    let currentSpriteXPos;

    // |||||||||||| INITIAL VALUES FOR "Physics"
    const initAngle = (90 * Math.PI) / 180;
    let currentSpriteVLimit;
    let currentSpriteOmega;
    let currentSpriteYRef;
    let currentSpriteAmplitude;

    let wasInitializedFromEvent;

    if (isFunctionInvokedFromEvent) {
      currentSpriteXPos = xPos;

      currentSpriteVLimit = vLimit;
      currentSpriteOmega = omega;
      currentSpriteYRef = yRef;
      currentSpriteAmplitude = amplitude;

      wasInitializedFromEvent = true;
    } else {
      currentSpriteXPos = hellBatHandToHandSpritesAttributes[i].xPos;

      currentSpriteVLimit = hellBatHandToHandSpritesAttributes[i].vLimit;
      currentSpriteOmega = hellBatHandToHandSpritesAttributes[i].omega;
      currentSpriteYRef = hellBatHandToHandSpritesAttributes[i].yRef;
      currentSpriteAmplitude = hellBatHandToHandSpritesAttributes[i].amplitude;

      wasInitializedFromEvent = false;
    }

    const imageSet = new ImageSet(1334, 0, 33, 39, 46, 59, 8, 19, 33, 39);

    // |||||||||||| ANIMATION DATA CREATION: 3 FRAMES PER STATE & ANIMATION SPEED
    const frames = new Frames(3, 7);

    const physics = new Physics(
      currentSpriteVLimit,
      0,
      1,
      0,
      currentSpriteOmega,
      initAngle,
      100,
      100,
      currentSpriteYRef,
      0,
      0,
      currentSpriteAmplitude
    );
    physics.vx = currentSpriteVLimit;

    const hitBox = new HitBox(32, 21, 1, 2);

    const collisions = new Collisions();

    let lifePoints;
    if (isFunctionInvokedFromEvent) {
      lifePoints = 1;
    } else {
      lifePoints = 2;
    }

    const afterAttackLeeway = new Timer(0, 1);

    const hellBatHandToHand = new HellBatHandToHand(
      SpriteID.HELL_BAT_HAND_TO_HAND,
      State.DOWN_3,
      currentSpriteXPos,
      0,
      imageSet,
      frames,
      physics,
      hitBox,
      collisions,
      lifePoints,
      afterAttackLeeway,
      wasInitializedFromEvent
    );

    // |||||||||||| ADD HELL BAT (HAND-TO-HAND) TO ITS CORRESPONDING SPRITES ARRAY
    globals.levelSprites.push(hellBatHandToHand);

    if (hellBatHandToHand.wasInitializedFromEvent) {
      globals.hellBatsApparitionEventSprites.push(hellBatHandToHand);
    }
  }
}

function initFastWormsFlyingStateTimer() {
  globals.fastWormsFlyingStateTimer = new Timer(20, 1);
}

function initHellBatsApparitionEventTimer() {
  globals.hellBatsApparitionEventTimer = new Timer(10, 1);
}

function initLevelParticles() {
  initRageSymbolParticles();
  initLavaParticles();
}

function initRageSymbolParticles() {
  const rageBarSymbol = globals.HUDSprites[1];

  const player = globals.levelSprites[0];

  const numOfParticles = 10;
  const xInit =
    rageBarSymbol.xPos + rageBarSymbol.imageSet.xDestinationSize / 2;
  const yInit =
    rageBarSymbol.yPos + rageBarSymbol.imageSet.yDestinationSize / 2;
  const alpha = 1.0;
  const spikes = 20;
  const outerRadius = 3;
  const innerRadius = 1.5;
  const timeToFade = 2.5;

  let color;
  if (player.rageLevel === 100) {
    color = "rgb(208 0 0 / 0.75)";

    // |||||||||||| ALSO CHANGE THE COLOR (ACTUALLY THE FRAME) OF THE SYMBOL
    rageBarSymbol.frames.frameCounter = 2;
  } else if (player.rageLevel > 50) {
    color = "rgb(232 93 4 / 0.75)";

    rageBarSymbol.frames.frameCounter = 1;
  } else {
    color = "rgb(255 186 8 / 0.75)";

    rageBarSymbol.frames.frameCounter = 0;
  }

  let angle = Math.PI * 2;

  for (let i = 0; i < numOfParticles; i++) {
    const physics = new Physics(6);

    const particle = new RageSymbolParticle(
      ParticleID.RAGE_SYMBOL,
      ParticleState.ON,
      xInit,
      yInit,
      physics,
      alpha,
      spikes,
      outerRadius,
      innerRadius,
      timeToFade,
      color
    );

    particle.physics.vx = particle.physics.vLimit * Math.cos(angle);
    particle.physics.vy = particle.physics.vLimit * Math.sin(angle);

    angle += 0.625;

    globals.levelParticles.push(particle);
  }
}

function initLavaParticles() {
  const currentLevel = globals.level.data;

  const brickSize = globals.level.imageSet.xGridSize;

  const numOfParticlesForEachLavaBlock = 4;

  for (let i = 0; i < currentLevel.length; i++) {
    for (let j = 0; j < currentLevel[0].length; j++) {
      if (currentLevel[i][j] === Block.LAVA_1) {
        const lavaBlockXPos = j * brickSize;
        const lavaBlockYPos = i * brickSize;

        for (let k = 0; k < numOfParticlesForEachLavaBlock; k++) {
          createLavaParticle(lavaBlockXPos, lavaBlockYPos);
        }
      }
    }
  }
}

function createLavaParticle(lavaBlockXPos, lavaBlockYPos) {
  const xPos = lavaBlockXPos + Math.random() * 14;
  const velocity = Math.random() * 20 + 10;
  const physics = new Physics(velocity);
  const alpha = 1.0;
  const width = Math.random() + 1;
  const height = Math.random() * 3 + 1;
  const timeToFade = Math.random() * 10 + 1;

  const particle = new LavaParticle(
    ParticleID.LAVA,
    ParticleState.ON,
    xPos,
    lavaBlockYPos,
    physics,
    alpha,
    width,
    height,
    timeToFade,
    lavaBlockXPos,
    lavaBlockYPos
  );

  particle.physics.vy = -particle.physics.vLimit;

  globals.levelParticles.push(particle);
}

function initCheckpointParticles(player) {
  const numOfParticles = 6;
  const xInitLeft = player.xPos + player.hitBox.xOffset;
  const xInitRight = player.xPos + player.hitBox.xOffset + player.hitBox.xSize;
  const yInit = player.yPos + player.hitBox.yOffset + player.hitBox.ySize;
  const alpha = 1.0;
  const spikes = 5;
  const outerRadius = 3;
  const innerRadius = 1.5;
  const timeToFade = 0.5;
  const whiteColor = "rgb(255 255 255)";
  const angles = [
    (5 * Math.PI) / 6,
    (3 * Math.PI) / 4,
    (2 * Math.PI) / 3,
    Math.PI / 3,
    Math.PI / 4,
    Math.PI / 6,
  ];

  for (let i = 0; i < numOfParticles; i++) {
    let xPos;
    if (i < 3) {
      xPos = xInitLeft;
    } else {
      xPos = xInitRight;
    }

    const physics = new Physics(45);

    const particle = new CheckpointParticle(
      ParticleID.CHECKPOINT,
      ParticleState.ON,
      xPos,
      yInit,
      physics,
      alpha,
      spikes,
      outerRadius,
      innerRadius,
      timeToFade,
      whiteColor
    );

    particle.physics.vx = particle.physics.vLimit * Math.cos(angles[i]);
    particle.physics.vy = -particle.physics.vLimit * Math.sin(angles[i]);

    globals.levelParticles.push(particle);
  }
}

function initEnemyDeathParticles(enemy) {
  const numOfParticles = 150;
  const xInit = enemy.xPos + enemy.hitBox.xOffset + enemy.hitBox.xSize / 2;
  const yInit = enemy.yPos + enemy.hitBox.yOffset + enemy.hitBox.ySize / 2;
  const alpha = 1.0;
  const timeToFade = 0.75;

  for (let i = 0; i < numOfParticles; i++) {
    const velocity = Math.random() * 30 + 10;
    const physics = new Physics(velocity, 60);

    const particle = new EnemyDeathParticle(
      ParticleID.ENEMY_DEATH,
      ParticleState.ON,
      xInit,
      yInit,
      physics,
      alpha,
      2.5,
      2.5,
      timeToFade
    );

    const randomAngle = Math.random() * 2 * Math.PI;

    particle.physics.vx = particle.physics.vLimit * Math.cos(randomAngle);
    particle.physics.vy = particle.physics.vLimit * Math.sin(randomAngle);

    particle.physics.ax = -particle.physics.aLimit * Math.cos(randomAngle);
    particle.physics.ay = -particle.physics.aLimit * Math.sin(randomAngle);

    globals.levelParticles.push(particle);
  }
}

function initHammerHitParticles(player) {
  const numOfParticles = 10;

  let xInit = player.xPos + player.hitBox.xOffset + 1;

  let randomAngleLowerLimit = 200;
  let randomAngleUpperLimit = 300;

  if (player.state === State.RIGHT_ATTACK_HAND_TO_HAND) {
    xInit += player.hitBox.xSize - 3;
    randomAngleLowerLimit = 240;
    randomAngleUpperLimit = 340;
  }

  const yInit = player.yPos + player.hitBox.yOffset + 10;
  const alpha = 1.0;
  const widthAndHeight = 1;

  for (let i = 0; i < numOfParticles; i++) {
    const velocity = Math.random() * 10 + 5;
    const physics = new Physics(velocity, 5);

    const disappearanceTimer = new Timer(0.85, 0.85, 0.85);

    const particle = new HammerHitParticle(
      ParticleID.HAMMER_HIT,
      ParticleState.ON,
      xInit,
      yInit,
      physics,
      alpha,
      widthAndHeight,
      disappearanceTimer
    );

    const randomAngle =
      (Math.random() * (randomAngleUpperLimit - randomAngleLowerLimit) +
        randomAngleLowerLimit) *
      (Math.PI / 180);

    particle.physics.vx = particle.physics.vLimit * Math.cos(randomAngle);
    particle.physics.vy = particle.physics.vLimit * Math.sin(randomAngle);

    particle.physics.ax = particle.physics.aLimit * Math.cos(randomAngle);
    particle.physics.ay = GRAVITY;

    globals.levelParticles.push(particle);
  }
}

function initGameOver() {
  // |||||||||||| RESET GLOBAL VARIABLES USED ON THE "GAME OVER" SCREEN
  globals.lastGamePlayerName = ["A", "A", "A"];
  globals.lastGamePlayerNameCurrentLetterIndex = 0;
  globals.wasLastGamePlayerNameEntered = false;
  globals.currentGameOverSelection = "CHECK HIGH SCORES TABLE";

  initSkull();

  // |||||||||||| CHANGE GAME STATE
  globals.gameState = Game.OVER;

  checkIfMusicIsPlayingAndIfSoResetIt();
  setMusic(Sound.GAME_OVER_MUSIC);
}

function initSkull() {
  const imageSet = new ImageSet(153, 1780, 120, 162, 153, 178, 32, 14, 80, 122);

  const frames = new Frames(1);

  const skull = new Sprite(
    SpriteID.SKULL,
    State.STILL,
    186,
    20,
    imageSet,
    frames
  );

  // |||||||||||| ASSIGN SKULL TO ITS CORRESPONDING VARIABLE
  globals.gameOverSprite = skull;
}

function initGameWon() {
  initGameWonToGameOverTimer();

  initGameWonBackgroundImg();

  // |||||||||||| CHANGE GAME STATE
  globals.gameState = Game.WON;

  checkIfMusicIsPlayingAndIfSoResetIt();
  setMusic(Sound.GAME_WON_MUSIC);
}

function initGameWonToGameOverTimer() {
  globals.gameWonToGameOverTimer = new Timer(29, 1);
}

function initGameWonBackgroundImg() {
  const imageSet = new ImageSet(597, 1790, 597, 341, 597, 358, 78, 0, -1, -1);

  const frames = new Frames(1);

  const gameWonBackgroundImg = new Sprite(
    SpriteID.BACKGROUND_IMG_GAME_WON,
    State.STILL,
    0,
    0,
    imageSet,
    frames
  );

  globals.gameWonBackgroundImg = gameWonBackgroundImg;
}

// |||||||||||| EXPORTS
export {
  initVars,
  initHTMLElements,
  loadDBDataAndInitEssentials,
  checkIfMusicIsPlayingAndIfSoResetIt,
  initMainMenu,
  initStoryMenu,
  initHighScoresMenu,
  initControlsMenu,
  createControlsMenuSparkle,
  initLevel,
  initMagicalOrb,
  initArrow,
  initAcid,
  initPotionGreen,
  initPotionBlue,
  initHellBatHandToHand,
  initRageSymbolParticles,
  createLavaParticle,
  initCheckpointParticles,
  initEnemyDeathParticles,
  initHammerHitParticles,
  initGameOver,
  initGameWon,
};
