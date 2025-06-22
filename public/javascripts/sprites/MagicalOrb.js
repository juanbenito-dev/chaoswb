import InGameSprite from "./InGameSprite.js";
import globals from "../globals.js";
import { Sound, State } from "../constants.js";

export default class MagicalOrb extends InGameSprite {
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

    this.updateAnimationFrame();
  }

  updateLogic() {
    if (
      this.collisions.isCollidingWithObstacleOnTheLeft ||
      this.collisions.isCollidingWithObstacleOnTheRight ||
      this.collisions.isCollidingWithEnemy
    ) {
      globals.currentSound = Sound.ORB_EXPLOSION;

      this.state = State.OFF;
    }
  }
}
