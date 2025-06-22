import InGameSprite from "./InGameSprite.js";
import globals from "../globals.js";
import { State, GRAVITY } from "../constants.js";

export default class Potion extends InGameSprite {
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
  ) {
    super(id, state, xPos, yPos, imageSet, frames, physics, hitBox, collisions);
  }

  updatePhysics() {
    // |||||||||||| ACCELERATION IN THE Y AXIS IS THE GRAVITY
    this.physics.ay = GRAVITY;

    this.physics.vy += this.physics.ay * globals.deltaTime;

    // |||||||||||| CALCULATE THE DISTANCE IT MOVES (Y AXIS)
    if (this.physics.vy > 0) {
      this.yPos += Math.max(this.physics.vy * globals.deltaTime, 1);
    } else {
      this.yPos += this.physics.vy * globals.deltaTime;
    }
  }

  updateLogic() {
    const player = globals.levelSprites[0];

    if (
      (this.collisions.isCollidingWithPlayer && player.hitBox.xSize !== 28) ||
      this.collisions.isCollidingWithLava
    ) {
      this.state = State.OFF;
    }
  }
}
