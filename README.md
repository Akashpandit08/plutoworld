# Create Any World From Imagination

Turn imagination into shared 3D worlds.

Type:

```text
beach sunset
```

And instantly:

- A world appears
- Friends can join
- Everyone sees changes in real time

This is not a game.
This is an open-source world engine.

## Vision

Create Any World From Imagination is a browser-based open-source world engine where creators can join a shared 3D session, move around, type imagination commands, and everyone in the session sees the world change in real time.

## Features

- Creator join flow with name and session ID
- Sessions created automatically by the backend
- Multiple browser tabs can join the same session
- Real-time creator avatars with names, colors, and positions
- WASD movement sync through Socket.IO
- Shared world commands through `world:command`
- Deterministic mock AI world engine with no paid APIs
- React Three Fiber 3D scene with sky, ground, lights, grid, objects, avatars, and labels
- In-memory session state only

## Tech Stack

Frontend:

- React
- Vite
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `socket.io-client`

Backend:

- Node.js
- Express
- Socket.IO
- In-memory session state

## Project Structure

```text
create-any-world-from-imagination/
├── README.md
├── LICENSE
├── .gitignore
├── UPDATE_ONLY.md
├── docs/
│   └── PHASE-1.md
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       └── worldEngine.js
└── client/
    ├── package.json
    ├── .env.example
    ├── index.html
    └── src/
        ├── App.jsx
        └── style.css
```

## Setup

Clone the repository and install dependencies in both apps.

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend connects to `http://localhost:4000` by default. To override it, create `client/.env`:

```bash
VITE_SERVER_URL=http://localhost:4000
```

The backend allows `http://localhost:5173` by default. To override it, create `server/.env`:

```bash
PORT=4000
CLIENT_URL=http://localhost:5173
```

## Test Multiplayer

1. Start the backend.
2. Start the frontend.
3. Open `http://localhost:5173` in two browser tabs.
4. Join the same session ID: `public`.
5. Move with WASD in either tab.
6. Type commands and confirm both tabs update together.

## Available Commands

- `beach sunset`
- `cyberpunk city`
- `forest`
- `space`
- `snow`
- `spawn cube`
- `spawn sphere`
- `clear`

## Open-Source Positioning

This project is built as a simple, inspectable Phase 1 MVP for an open-source world engine. It intentionally avoids databases, authentication, payment systems, and paid AI APIs so contributors can run it locally and understand the full stack quickly.

## License

Apache License 2.0. See [LICENSE](LICENSE).
