import Sprite from "./Sprite.js";
import Timer from "../Timer.js";

export default class Sun extends Sprite {
  constructor(id, state, xPos, yPos, imageSet, frames) {
    super(id, state, xPos, yPos, imageSet, frames);

    this.angle = 0;
    this.nextAngleChangeDelay = new Timer(1, 1);
  }
}
