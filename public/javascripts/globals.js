import { Game } from "./constants.js";

export default {
  // |||||||||||| CANVAS & CONTEXT (SCREEN & HUD)
  canvas: {},
  ctx: {},
  canvasHUD: {},
  ctxHUD: {},

  // |||||||||||| GAME STATE
  gameState: Game.INVALID,

  // |||||||||||| PREVIOUS CYCLE TIME (MILLISECONDS)
  previousCycleMilliseconds: -1,

  // |||||||||||| ACTUAL GAME CYCLE TIME (SECONDS)
  deltaTime: 0,

  // |||||||||||| GOAL CYCLE TIME (SECONDS, CONSTANT)
  frameTimeObj: 0,

  cycleRealTime: 0,

  // |||||||||||| IMAGES DATA (TILESETS)
  tileSets: [],

  // |||||||||||| VARIABLES TO MANAGE ASSETS LOADING

  // |||||||| HOLDS THE ELEMENTS TO LOAD (PRIMARILY, IMAGES & SOUNDS)
  assetsToLoad: [],

  assetsLoadProgressAsPercentage: 0,

  // |||||||| INDICATES THE NUMBER OF ELEMENTS THAT HAVE BEEN LOADED SO FAR
  assetsLoaded: 0,

  // |||||||||||| OBJECT THAT HOLDS THE STATES OF THE KEYBOARD KEYS
  action: {},

  // |||||||||||| SOUNDS
  sounds: [],

  currentMusic: -1,

  // |||||||||||| CURRENT SOUND TO PLAY
  currentSound: -1,

  // |||||||||||| MAIN MENU DATA
  mainMenuBackgroundImg: {},
  mainMenuSprites: [],
  currentMainMenuSelection: "NEW GAME",

  // |||||||||||| STORY MENU DATA
  storyMenuBackgroundImg: {},
  storyLineFromLeftSideXCoordinate: 0,
  storyLineFromRightSideXCoordinate: 0,

  // |||||||||||| HIGH SCORES MENU DATA
  highScoresMenuBackgroundImg: {},
  highScoresMenuNoticeOnTheBottomData: {},
  didPlayerEnterHighScoresMenuFromMainMenu: false,
  currentScoresPage: 0,
  lastGamePlayerPosition: 0,
  horizontalSkewForEvenDataRecords: 0,
  verticalSkewForEvenDataRecords: 0,
  horizontalSkewForOddDataRecords: 0,
  verticalSkewForOddDataRecords: 0,

  // |||||||||||| CONTROLS MENU DATA
  controlsMenuBackgroundImg: {},
  controlsMenuSprites: [],
  controlsMenuParticles: [],

  // |||||||||||| HUD DATA
  HUDSprites: [],

  score: 0,
  highScore: 0,
  highScores: [],

  loadingLevel1BackgroundImg: {},
  loadingLevel2BackgroundImg: {},
  levelInitializationTimer: {},

  level: {},
  levelBackgroundImg: {},
  levelSprites: [],
  levelParticles: [],

  closedDoorsPosition: [],
  closedDoorsNotice: "",
  closedDoorsNoticeTimer: {},

  isPlayerPressingJumpKey: false,

  // |||||||||||| VARIABLES TO MANAGE THE EVENT OF FLYING FAST WORMS IN THE SECOND LEVEL
  doFastWormsFly: false,
  fastWormsFlyingStateTimer: {},

  // |||||||||||| VARIABLES TO MANAGE THE EVENT OF HELL BATS (HAND-TO-HAND) RANDOMLY APPEARING NEXT TO THE PLAYER IN THE SECOND LEVEL
  rageLevelToReachToMakeHellBatsAppear: 0,
  hellBatsApparitionEventTimer: {},
  hellBatsApparitionEventSprites: [],
  isHellBatsApparitionEventTakingPlace: false,

  numOfRageSymbolParticlesOFF: 0,

  // |||||||||||| "GAME OVER" SCREEN DATA
  lastGamePlayerName: [],
  lastGamePlayerNameCurrentLetterIndex: 0,
  wasLastGamePlayerNameEntered: false,
  gameOverSprite: {},
  currentGameOverSelection: "CHECK HIGH SCORES TABLE",

  // |||||||||||| "YOU WIN" SCREEN DATA
  gameWonToGameOverTimer: {},
  gameWonBackgroundImg: {},
};
