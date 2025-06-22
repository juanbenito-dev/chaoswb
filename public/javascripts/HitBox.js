// |||||||||||| MANAGES THE HITBOX OF A SPRITE
export default class HitBox {
  constructor(xSize, ySize, xOffset, yOffset) {
    this.xSize = xSize; // HITBOX'S SIZE IN PX (X)
    this.ySize = ySize; // HITBOX'S SIZE IN PX (Y)
    this.xOffset = xOffset; // OFFSET IN X OF THE HITBOX DRAWING START WITH RESPECT TO "xPos"
    this.yOffset = yOffset; // OFFSET IN Y OF THE HITBOX DRAWING START WITH RESPECT TO "yPos"
  }
}
