export default class Timer {
  constructor(value, timeChangeValue, valueToStartCountingFrom) {
    this.value = value; // CURRENT TIMER VALUE
    this.timeChangeCounter = 0; // VALUE CHANGE TIMER (SECONDS)
    this.timeChangeValue = timeChangeValue; // TIME TO CHANGE VALUE (SECONDS)
    this.valueToStartCountingFrom = valueToStartCountingFrom; // TIMER VALUE TO START COUNTING (SUBTRACTING SECONDS) FROM
  }
}
