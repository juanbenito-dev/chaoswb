import InGameSprite from "./InGameSprite.js";
import globals from "../globals.js";
import { State } from "../constants.js";

export default class Acid extends InGameSprite {
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
    this.yPos += this.physics.vy * globals.deltaTime;

    this.updateAnimationFrame();
  }

  updateLogic() {
    if (
      this.collisions.isCollidingWithObstacleOnTheBottom ||
      this.collisions.isCollidingWithPlayer
    ) {
      this.state = State.OFF;
    }
  }
}
