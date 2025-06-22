import InGameSprite from "./InGameSprite.js";
import globals from "../globals.js";
import { State } from "../constants.js";

export default class Arrow extends InGameSprite {
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
    this.xPos += this.physics.vx * globals.deltaTime;
  }

  updateLogic() {
    if (
      this.collisions.isCollidingWithObstacleOnTheLeft ||
      this.collisions.isCollidingWithObstacleOnTheRight ||
      this.collisions.isCollidingWithPlayer
    ) {
      this.state = State.OFF;
    }
  }
}
