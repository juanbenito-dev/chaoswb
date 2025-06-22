class Particle {
  constructor(id, state, xPos, yPos, physics, alpha) {
    this.id = id;
    this.state = state;
    this.xPos = xPos;
    this.yPos = yPos;
    this.physics = physics;
    this.alpha = alpha;
  }
}

class RageSymbolParticle extends Particle {
  constructor(
    id,
    state,
    xPos,
    yPos,
    physics,
    alpha,
    spikes,
    outerRadius,
    innerRadius,
    timeToFade,
    color,
  ) {
    super(id, state, xPos, yPos, physics, alpha);

    this.spikes = spikes;
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
    this.fadeCounter = 0;
    this.timeToFade = timeToFade;
    this.color = color;
  }
}

class ControlsMenuSparkle extends Particle {
  constructor(
    id,
    state,
    xPos,
    yPos,
    physics,
    alpha,
    width,
    height,
    radius,
    color,
  ) {
    super(id, state, xPos, yPos, physics, alpha);

    this.width = width;
    this.height = height;
    this.radius = radius;
    this.color = color;
  }
}

class CheckpointParticle extends Particle {
  constructor(
    id,
    state,
    xPos,
    yPos,
    physics,
    alpha,
    spikes,
    outerRadius,
    innerRadius,
    timeToFade,
    color,
  ) {
    super(id, state, xPos, yPos, physics, alpha);

    this.spikes = spikes;
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
    this.fadeCounter = 0;
    this.timeToFade = timeToFade;
    this.color = color;
  }
}

class LavaParticle extends Particle {
  constructor(
    id,
    state,
    xPos,
    yPos,
    physics,
    alpha,
    width,
    height,
    timeToFade,
    xInit,
    yInit,
  ) {
    super(id, state, xPos, yPos, physics, alpha);

    this.width = width;
    this.height = height;
    this.fadeCounter = 0;
    this.timeToFade = timeToFade;
    this.xInit = xInit;
    this.yInit = yInit;
  }
}

class EnemyDeathParticle extends Particle {
  constructor(
    id,
    state,
    xPos,
    yPos,
    physics,
    alpha,
    width,
    height,
    timeToFade,
  ) {
    super(id, state, xPos, yPos, physics, alpha);

    this.width = width;
    this.height = height;
    this.fadeCounter = 0;
    this.timeToFade = timeToFade;
  }
}

class HammerHitParticle extends Particle {
  constructor(
    id,
    state,
    xPos,
    yPos,
    physics,
    alpha,
    widthAndHeight,
    disappearanceTimer,
  ) {
    super(id, state, xPos, yPos, physics, alpha);

    this.widthAndHeight = widthAndHeight;
    this.disappearanceTimer = disappearanceTimer;
  }
}

export {
  RageSymbolParticle,
  ControlsMenuSparkle,
  CheckpointParticle,
  LavaParticle,
  EnemyDeathParticle,
  HammerHitParticle,
};
