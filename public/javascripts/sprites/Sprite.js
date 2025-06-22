export default class Sprite {
  constructor(id, state, xPos, yPos, imageSet, frames) {
    this.id = id; // SPRITE TYPE
    this.state = state; // SPRITE'S ANIMATION STATE
    this.xPos = xPos; // X POSITION IN CANVAS
    this.yPos = yPos; // Y POSITION IN CANVAS
    this.imageSet = imageSet; // SPRITE'S IMAGES DATA
    this.frames = frames; // ANIMATION FRAMES DATA
  }
}
