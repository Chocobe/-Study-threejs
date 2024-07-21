const floorConfig = {
  width: 20,
  height: 20,
  rotation: {
    x: -Math.PI * 0.5,
  },
  segment: {
    width: 100,
    height: 100,
  },
} as const;

const wallConfig = {
  width: 4,
  height: 2.5,
  depth: 4,
  segment: {
    width: 50,
    height: 50,
    depth: 50,
  },
} as const;

const roofConfig = {
  radius: 4,
  height: 1.5,
  radialSegment: 4,
  rotation: {
    y: Math.PI * 0.25,
  },
  position: {
    y: (1.5 * 0.5) + wallConfig.height,
  },
} as const;

const bushConfig = {
  bush1: {
    position: {
      x: 1.3,
      z: 2.2,
    },
  },
  bush2: {
    position: {
      x: 0.8,
      z: 2.3,
    },
    scale: 0.6,
  },
  bush3: {
    position: {
      x: -1.5,
      z: 2.2,
    },
    scale: 0.8,
  },
  bush4: {
    position: {
      x: -1.25,
      z: 2.5,
    },
    scale: 0.4,
  }
} as const;

const doorConfig = {
  width: 2.5,
  height: 2.5,
  position: {
    x: 0,
    y: 2.5 * 0.5 * 0.8,
    z: 2.001,
  },
  segment: {
    width: 100,
    height: 100,
  },
} as const;

const graveConfig = {
  width: 0.5,
  height: 0.7,
  depth: 0.2,
  count: 30,
  position: {
    minRadius: 4,
    maxRadius: 6,
  },
} as const;

const ghost1Config = {
  radius: 5,
} as const;

const ghost2Config = {
  radius: 4,
} as const;

const ghost3Config = {
  radius: 6,
} as const;

const roofLightConfig = {
  position: {
    x: 0,
    y: 2.3,
    z: 2.2,
  },
} as const;

export {
  floorConfig,
  wallConfig,
  roofConfig,
  bushConfig,
  doorConfig,
  graveConfig,
  ghost1Config,
  ghost2Config,
  ghost3Config,
  roofLightConfig,
};
