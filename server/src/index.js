const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { applyWorldCommand, createLobbyWorld } = require("./worldEngine");

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

const sessions = new Map();

const creatorColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899"
];

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      world: createLobbyWorld(),
      creators: {}
    });
  }

  return sessions.get(sessionId);
}

function createCreator(socket, name, session) {
  const creatorCount = Object.keys(session.creators).length;

  return {
    id: socket.id,
    name,
    color: creatorColors[creatorCount % creatorColors.length],
    position: {
      x: creatorCount * 1.5,
      y: 0,
      z: 0
    }
  };
}

app.get("/health", (request, response) => {
  response.json({
    ok: true,
    name: "Create Any World From Imagination"
  });
});

io.on("connection", (socket) => {
  socket.data.sessionId = null;

  socket.on("creator:join", ({ sessionId, name }) => {
    const cleanSessionId = String(sessionId || "public").trim() || "public";
    const cleanName = String(name || "Creator").trim() || "Creator";
    const session = getOrCreateSession(cleanSessionId);
    const creator = createCreator(socket, cleanName, session);

    socket.join(cleanSessionId);
    socket.data.sessionId = cleanSessionId;
    session.creators[creator.id] = creator;

    socket.emit("session:init", {
      creatorId: creator.id,
      sessionId: cleanSessionId,
      world: session.world,
      creators: session.creators
    });

    socket.to(cleanSessionId).emit("creator:joined", creator);
  });

  socket.on("creator:move", ({ position }) => {
    const sessionId = socket.data.sessionId;
    const session = sessions.get(sessionId);

    if (!session || !session.creators[socket.id] || !position) {
      return;
    }

    const nextPosition = {
      x: Number(position.x) || 0,
      y: Number(position.y) || 0,
      z: Number(position.z) || 0
    };

    session.creators[socket.id].position = nextPosition;
    socket.to(sessionId).emit("creator:moved", {
      id: socket.id,
      position: nextPosition
    });
  });

  socket.on("world:command", ({ command }) => {
    const sessionId = socket.data.sessionId;
    const session = sessions.get(sessionId);

    if (!session || typeof command !== "string") {
      return;
    }

    session.world = applyWorldCommand(session.world, command);

    io.to(sessionId).emit("world:updated", {
      command,
      world: session.world
    });
  });

  socket.on("disconnect", () => {
    const sessionId = socket.data.sessionId;
    const session = sessions.get(sessionId);

    if (!session) {
      return;
    }

    delete session.creators[socket.id];
    socket.to(sessionId).emit("creator:left", {
      id: socket.id
    });

    if (Object.keys(session.creators).length === 0) {
      sessions.delete(sessionId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`World engine server running on http://localhost:${PORT}`);
});
