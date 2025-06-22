export default class HighScore {
  constructor(position, name, score) {
    this.position = position;
    this.name = name;
    this.score = score;
    this.isLastGamePlayer = false;
  }
}
