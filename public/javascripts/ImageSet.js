// |||||||||||| MANAGES A SPRITE'S TILESET
export default class ImageSet {
  constructor(
    xInit,
    yInit,
    xSize,
    ySize,
    xGridSize,
    yGridSize,
    xOffset,
    yOffset,
    xDestinationSize,
    yDestinationSize,
  ) {
    this.xInit = xInit; // IMAGESET START X COORDINATE
    this.yInit = yInit; // IMAGESET START Y COORDINATE
    this.xSize = xSize; // IMAGE'S SIZE IN PX (X)
    this.ySize = ySize; // IMAGE'S SIZE IN PX (Y)
    this.xOffset = xOffset; // OFFSET IN X OF THE BEGINNING OF THE CHARACTER'S DRAWING WITH RESPECT TO THE GRID
    this.yOffset = yOffset; // OFFSET IN Y OF THE BEGINNING OF THE CHARACTER'S DRAWING WITH RESPECT TO THE GRID
    this.xGridSize = xGridSize; // SIZE IN PX OF THE GRID CONTAINING THE IMAGE (X)
    this.yGridSize = yGridSize; // SIZE IN PX OF THE GRID CONTAINING THE IMAGE (Y)
    this.xDestinationSize = xDestinationSize; // IMAGE'S SIZE IN ITS DESTINATION, THE CANVAS IT'S RENDERED IN (X)
    this.yDestinationSize = yDestinationSize; // IMAGE'S SIZE IN ITS DESTINATION, THE CANVAS IT'S RENDERED IN (Y)
  }
}
