import globals from "./globals.js";
import update from "./gameLogic.js";
import render from "./gameRender.js";
import {
  initVars,
  initHTMLElements,
  loadDBDataAndInitEssentials,
} from "./initialize.js";

// |||||||||||| GAME INITIALIZATION

window.onload = init;

function init() {
  initVars();

  initHTMLElements();

  loadDBDataAndInitEssentials();

  // |||||||| FIRST FRAME REQUEST
  window.requestAnimationFrame(gameLoop);
}

// |||||||||||| GAME EXECUTION

// |||||||| MAIN EXECUTION LOOP
function gameLoop(timeStamp) {
  // |||| KEEP REQUESTING ANIMATION FRAMES
  window.requestAnimationFrame(gameLoop, globals.canvas);

  // |||| ACTUAL EXECUTION CYCLE TIME
  const elapsedCycleSeconds =
    (timeStamp - globals.previousCycleMilliseconds) / 1000;

  // |||| PREVIOUS EXECUTION CYCLE TIME
  globals.previousCycleMilliseconds = timeStamp;

  // |||| VARIABLE CORRECTING THE FRAME TIME DUE TO DELAYS WITH RESPECT TO GOAL TIME (frameTimeObj)
  globals.deltaTime += elapsedCycleSeconds;

  globals.cycleRealTime += elapsedCycleSeconds;

  if (globals.cycleRealTime >= globals.frameTimeObj) {
    // |||| UPDATE THE GAME LOGIC
    update();

    // |||| PERFORM THE DRAWING OPERATION
    render();

    // |||| CORRECT EXCESS OF TIME
    globals.cycleRealTime -= globals.frameTimeObj;
    globals.deltaTime = 0;
  }
}
