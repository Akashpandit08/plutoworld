const baseWorld = {
  theme: "Lobby",
  sky: "#8fc9ff",
  ground: "#7cb86f",
  light: 0.85,
  objects: []
};

const cloneWorld = (world) => ({
  ...world,
  objects: world.objects.map((object) => ({
    ...object,
    position: { ...object.position }
  }))
});

const createLobbyWorld = () => cloneWorld(baseWorld);

const createObject = (type, color, position) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  color,
  position
});

const addForest = (world) => {
  const treePositions = [
    { x: -5, y: 0.75, z: -4 },
    { x: -2, y: 0.75, z: 3 },
    { x: 2, y: 0.75, z: -3 },
    { x: 5, y: 0.75, z: 2 },
    { x: 0, y: 0.75, z: 5 }
  ];

  return {
    ...world,
    theme: "Forest",
    sky: "#b8e3ff",
    ground: "#2d8a45",
    light: 0.8,
    objects: [
      ...world.objects,
      ...treePositions.map((position) => createObject("tree", "#2f7d32", position))
    ]
  };
};

const addCyberpunkCity = (world) => {
  const towerPositions = [
    { x: -6, y: 2, z: -5 },
    { x: -3, y: 2.6, z: -6 },
    { x: 0, y: 3.2, z: -5 },
    { x: 3, y: 2.4, z: -6 },
    { x: 6, y: 2.8, z: -5 }
  ];

  const colors = ["#00f5ff", "#ff2bd6", "#f8ff2b", "#7c3cff", "#39ff14"];

  return {
    ...world,
    theme: "Cyberpunk City",
    sky: "#090416",
    ground: "#15151f",
    light: 0.45,
    objects: [
      ...world.objects,
      ...towerPositions.map((position, index) =>
        createObject("tower", colors[index], position)
      )
    ]
  };
};

function applyWorldCommand(currentWorld, rawCommand) {
  const command = rawCommand.trim().toLowerCase();

  if (!command) {
    return cloneWorld(currentWorld);
  }

  if (command.includes("clear")) {
    return createLobbyWorld();
  }

  let nextWorld = cloneWorld(currentWorld);

  if (command.includes("beach")) {
    nextWorld = {
      ...nextWorld,
      theme: "Beach",
      sky: "#7ecfff",
      ground: "#f3d58a",
      light: 1
    };
  }

  if (command.includes("sunset")) {
    nextWorld = {
      ...nextWorld,
      theme: nextWorld.theme === "Lobby" ? "Sunset" : `${nextWorld.theme} Sunset`,
      sky: "#ff8a5b",
      light: 0.7
    };
  }

  if (command.includes("cyberpunk") || command.includes("city")) {
    nextWorld = addCyberpunkCity(nextWorld);
  }

  if (command.includes("forest")) {
    nextWorld = addForest(nextWorld);
  }

  if (command.includes("space")) {
    nextWorld = {
      ...nextWorld,
      theme: "Space",
      sky: "#02030a",
      ground: "#111827",
      light: 0.35
    };
  }

  if (command.includes("snow")) {
    nextWorld = {
      ...nextWorld,
      theme: "Snow",
      sky: "#dbeafe",
      ground: "#f8fafc",
      light: 0.95
    };
  }

  if (command.includes("spawn cube")) {
    nextWorld = {
      ...nextWorld,
      objects: [
        ...nextWorld.objects,
        createObject("cube", "#f97316", {
          x: Math.round((Math.random() * 8 - 4) * 10) / 10,
          y: 0.5,
          z: Math.round((Math.random() * 8 - 4) * 10) / 10
        })
      ]
    };
  }

  if (command.includes("spawn sphere")) {
    nextWorld = {
      ...nextWorld,
      objects: [
        ...nextWorld.objects,
        createObject("sphere", "#22c55e", {
          x: Math.round((Math.random() * 8 - 4) * 10) / 10,
          y: 0.6,
          z: Math.round((Math.random() * 8 - 4) * 10) / 10
        })
      ]
    };
  }

  return nextWorld;
}

module.exports = {
  applyWorldCommand,
  createLobbyWorld
};
