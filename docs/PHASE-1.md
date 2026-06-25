# Phase 1

Phase 1 creates a working browser-based shared 3D world engine.

## Scope

- Creator join flow with name and session ID.
- In-memory sessions created on demand.
- Real-time creator join, leave, and movement sync.
- Shared world commands over Socket.IO.
- Deterministic mock world engine.
- React Three Fiber 3D world rendering.
- No database.
- No authentication.
- No paid AI API.

## Socket Events

Client to server:

- `creator:join`
- `creator:move`
- `world:command`

Server to client:

- `session:init`
- `creator:joined`
- `creator:moved`
- `creator:left`
- `world:updated`

## World Commands

- `beach sunset`
- `cyberpunk city`
- `forest`
- `space`
- `snow`
- `spawn cube`
- `spawn sphere`
- `clear`

## Future Phases

Potential future phases can add persistence, creator accounts, richer world editing, import/export, permissions, and real AI providers behind optional adapters.
