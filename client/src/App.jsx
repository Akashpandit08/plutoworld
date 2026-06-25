import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Html, OrbitControls, Text } from "@react-three/drei";
import { io } from "socket.io-client";
import "./style.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const defaultWorld = {
  theme: "Lobby",
  sky: "#8fc9ff",
  ground: "#7cb86f",
  light: 0.85,
  objects: []
};

const movementKeys = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);

function CreatorAvatar({ creator, isLocal }) {
  return (
    <group position={[creator.position.x, creator.position.y, creator.position.z]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.6, 8, 16]} />
        <meshStandardMaterial
          color={creator.color}
          emissive={isLocal ? creator.color : "#000000"}
          emissiveIntensity={isLocal ? 0.15 : 0}
        />
      </mesh>
      <Html center distanceFactor={8} position={[0, 1.35, 0]}>
        <div className={isLocal ? "nameTag localNameTag" : "nameTag"}>
          {creator.name}
        </div>
      </Html>
    </group>
  );
}

function TreeObject({ object }) {
  return (
    <group position={[object.position.x, object.position.y, object.position.z]}>
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 0.8, 10]} />
        <meshStandardMaterial color="#7c4a2d" />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <coneGeometry args={[0.62, 1.2, 12]} />
        <meshStandardMaterial color={object.color} />
      </mesh>
    </group>
  );
}

function TowerObject({ object }) {
  return (
    <mesh position={[object.position.x, object.position.y, object.position.z]} castShadow>
      <boxGeometry args={[0.9, object.position.y * 2, 0.9]} />
      <meshStandardMaterial
        color="#171725"
        emissive={object.color}
        emissiveIntensity={0.45}
      />
    </mesh>
  );
}

function WorldObject({ object }) {
  if (object.type === "sphere") {
    return (
      <mesh position={[object.position.x, object.position.y, object.position.z]} castShadow>
        <sphereGeometry args={[0.55, 32, 16]} />
        <meshStandardMaterial color={object.color} />
      </mesh>
    );
  }

  if (object.type === "tree") {
    return <TreeObject object={object} />;
  }

  if (object.type === "tower") {
    return <TowerObject object={object} />;
  }

  return (
    <mesh position={[object.position.x, object.position.y, object.position.z]} castShadow>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color={object.color} />
    </mesh>
  );
}

function MovementController({ creatorId, creators, onMove }) {
  const keysRef = useRef(new Set());
  const positionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (creatorId && creators[creatorId]) {
      positionRef.current = { ...creators[creatorId].position };
    }
  }, [creatorId, creators]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (movementKeys.has(event.code)) {
        keysRef.current.add(event.code);
      }
    };

    const handleKeyUp = (event) => {
      if (movementKeys.has(event.code)) {
        keysRef.current.delete(event.code);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!creatorId || keysRef.current.size === 0) {
      return;
    }

    const speed = 4;
    const next = { ...positionRef.current };

    if (keysRef.current.has("KeyW")) next.z -= speed * delta;
    if (keysRef.current.has("KeyS")) next.z += speed * delta;
    if (keysRef.current.has("KeyA")) next.x -= speed * delta;
    if (keysRef.current.has("KeyD")) next.x += speed * delta;

    next.x = Math.max(-14, Math.min(14, next.x));
    next.z = Math.max(-14, Math.min(14, next.z));
    next.y = 0;

    positionRef.current = next;

    if (state.clock.elapsedTime - lastSentRef.current > 0.04) {
      lastSentRef.current = state.clock.elapsedTime;
      onMove(next);
    }
  });

  return null;
}

function WorldScene({ creatorId, creators, world, onMove }) {
  const creatorList = useMemo(() => Object.values(creators), [creators]);

  return (
    <Canvas camera={{ position: [8, 7, 9], fov: 50 }} shadows>
      <color attach="background" args={[world.sky]} />
      <ambientLight intensity={world.light} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} castShadow />
      <Text
        position={[0, 4.2, -7]}
        color="#ffffff"
        fontSize={0.55}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#111827"
      >
        {world.theme}
      </Text>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color={world.ground} />
      </mesh>
      <Grid
        args={[36, 36]}
        cellSize={1}
        cellThickness={0.55}
        cellColor="#ffffff"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#111827"
        fadeDistance={28}
        fadeStrength={1}
        position={[0, 0.01, 0]}
      />
      {world.objects.map((object) => (
        <WorldObject key={object.id} object={object} />
      ))}
      {creatorList.map((creator) => (
        <CreatorAvatar
          key={creator.id}
          creator={creator}
          isLocal={creator.id === creatorId}
        />
      ))}
      <MovementController creatorId={creatorId} creators={creators} onMove={onMove} />
      <OrbitControls makeDefault />
    </Canvas>
  );
}

function App() {
  const socketRef = useRef(null);
  const [name, setName] = useState("Creator");
  const [sessionIdInput, setSessionIdInput] = useState("public");
  const [sessionId, setSessionId] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [creators, setCreators] = useState({});
  const [world, setWorld] = useState(defaultWorld);
  const [command, setCommand] = useState("");
  const [status, setStatus] = useState("Enter a name and session ID to begin.");

  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: false
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("Connected to the world engine.");
    });

    socket.on("connect_error", () => {
      setStatus(`Could not connect to ${SERVER_URL}. Is the backend running?`);
    });

    socket.on("session:init", (payload) => {
      setCreatorId(payload.creatorId);
      setSessionId(payload.sessionId);
      setWorld(payload.world);
      setCreators(payload.creators);
      setStatus(`Joined session "${payload.sessionId}".`);
    });

    socket.on("creator:joined", (creator) => {
      setCreators((current) => ({
        ...current,
        [creator.id]: creator
      }));
      setStatus(`${creator.name} joined the session.`);
    });

    socket.on("creator:moved", ({ id, position }) => {
      setCreators((current) => ({
        ...current,
        [id]: current[id]
          ? {
              ...current[id],
              position
            }
          : current[id]
      }));
    });

    socket.on("creator:left", ({ id }) => {
      setCreators((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setStatus("A creator left the session.");
    });

    socket.on("world:updated", ({ command: usedCommand, world: nextWorld }) => {
      setWorld(nextWorld);
      setStatus(`World updated from command: ${usedCommand}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinSession = (event) => {
    event.preventDefault();

    const socket = socketRef.current;
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("creator:join", {
      sessionId: sessionIdInput,
      name
    });
  };

  const sendMove = (position) => {
    setCreators((current) => ({
      ...current,
      [creatorId]: current[creatorId]
        ? {
            ...current[creatorId],
            position
          }
        : current[creatorId]
    }));

    socketRef.current?.emit("creator:move", {
      position
    });
  };

  const sendCommand = (event) => {
    event.preventDefault();
    const cleanCommand = command.trim();

    if (!cleanCommand) {
      return;
    }

    socketRef.current?.emit("world:command", {
      command: cleanCommand
    });
    setCommand("");
  };

  const isJoined = Boolean(creatorId);

  return (
    <main className="appShell">
      <section className="sidePanel">
        <div>
          <p className="eyebrow">Open-source world engine</p>
          <h1>Create Any World From Imagination</h1>
          <p className="hook">Turn imagination into shared 3D worlds.</p>
        </div>

        {!isJoined ? (
          <form className="panelForm" onSubmit={joinSession}>
            <label>
              Creator name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ada"
              />
            </label>
            <label>
              Session ID
              <input
                value={sessionIdInput}
                onChange={(event) => setSessionIdInput(event.target.value)}
                placeholder="public"
              />
            </label>
            <button type="submit">Join Session</button>
          </form>
        ) : (
          <form className="panelForm" onSubmit={sendCommand}>
            <label>
              Imagination command
              <input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="beach sunset"
              />
            </label>
            <button type="submit">Update World</button>
            <div className="sessionMeta">
              <span>Session</span>
              <strong>{sessionId}</strong>
            </div>
          </form>
        )}

        <div className="statusBox">{status}</div>

        <div className="helpBox">
          <h2>Controls</h2>
          <p>WASD movement</p>
          <h2>Available commands</h2>
          <p>beach sunset, cyberpunk city, forest, space, snow, spawn cube, spawn sphere, clear</p>
        </div>
      </section>

      <section className="worldPanel" aria-label="Shared 3D world">
        <WorldScene
          creatorId={creatorId}
          creators={creators}
          world={world}
          onMove={sendMove}
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
