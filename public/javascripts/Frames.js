export default class Frames {
  constructor(framesPerState, speed = 1) {
    this.framesPerState = framesPerState; // NUMBER OF FRAMES PER ANIMATION STATE
    this.frameCounter = 0; // FRAME NUMBER
    this.speed = speed; // FRAME CHANGE SPEED (MINIMUM: 1 | GREATER NUMBER = SLOWER)
    this.frameChangeCounter = 0; // FRAME COUNTER FOR ANIMATION CHANGE
  }
}
