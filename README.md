# LavaBridge

[![Node.js Version](https://img.shields.io/badge/Node.js-18+-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# ⚠️ Experimental Project
> LavaBridge is an experimental compatibility layer that allows Lavalink v3 clients to work with Lavalink v4 servers.

## Overview

LavaBridge acts as a translation proxy between Lavalink v3 clients and v4 servers, providing backward compatibility for applications that haven't migrated to the newer Lavalink v4 protocol yet. It translates API calls and WebSocket messages between the two protocol versions seamlessly.

## Features

- 🔄 **Protocol Translation**: Converts v3 REST API calls to v4 format
- 🌐 **WebSocket Proxy**: Translates WebSocket messages between v3 and v4 protocols
- 📡 **HTTP REST Proxy**: Handles REST API translation for track loading and other operations
- ⚡ **Real-time Translation**: Live translation of WebSocket events and commands

## Architecture

```
┌─────────────────┐                    ┌────────────────────┐                    ┌─────────────────┐
│   Lavalink v3   │                    │     LavaBridge     │                    │   Lavalink v4   │
│     Client      │                    │       Proxy        │                    │     Server      │
│                 │                    │                    │                    │                 │
│  ┌───────────┐  │  REST API (v3)     │  ┌──────────────┐  │  REST API (v4)     │  ┌───────────┐  │
│  │    HTTP   │  │ ─GET /loadtracks─▶│  │    REST      │  │ ──GET /v4/...───▶ │  │    HTTP   │  │
│  │   Client  │  │ ◀─────JSON─────── │  │  Translator  │  │ ◀──────JSON────── │  │   Server  │  │
│  └───────────┘  │                    │  └──────────────┘  │                    │  └───────────┘  │
│                 │                    │                    │                    │                 │
│  ┌───────────┐  │  WebSocket (v3)    │  ┌──────────────┐  │  REST (PATCH/...)  │  ┌───────────┐  │
│  │ WebSocket │  │ ──op:play────────▶│  │      WS      │  │ ──PATCH /v4/...─▶ │  │ WebSocket │  │
│  │   Client  │  │ ──op:filters─────▶│  │  Translator  │  │ ──PATCH /v4/...─▶ │  │   Server  │  │
│  │           │  │ ◀──event───────── │  │  (WS→REST)   │  │ ◀──event────────  │  │           │  │
│  └───────────┘  │                    │  └──────────────┘  │                    │  └───────────┘  │
│                 │                    │                    │                    │                 │
└─────────────────┘                    └────────────────────┘                    └─────────────────┘
```

## Installation

### Prerequisites

- Node.js 18 or higher
- A running Lavalink v4 server
- Yarn package manager (recommended)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/SiruBOT/lavabridge
cd lavabridge
```

2. Install dependencies:
```bash
yarn install
```

3. Configure the proxy by renaming `config.inc.js` to `config.js` and editing it as needed.

4. Start the proxy:
```bash
node src/index.js
```

## Usage

Once LavaBridge is running, configure your Lavalink v3 client to connect to the proxy instead of directly to the Lavalink server:

### Example Client Configuration

```javascript
// Before (connecting directly to Lavalink v4)
const client = new LavalinkClient({
    nodes: [{
        host: "localhost",
        port: 2333,
        password: "youshallnotpass"
    }]
});

// After (connecting through LavaBridge)
const client = new LavalinkClient({
    nodes: [{
        host: "localhost",
        port: 2334,  // Proxy port
        password: "youshallnotpass"
    }]
});
```

## Project Structure

```
├── src/
│   ├── index.js                    # Main entry point
│   ├── logger.js                   # Logging utility
│   ├── protocol/
│   │   ├── v3tov4.js              # v3 to v4 protocol translations
│   │   └── v4tov3.js              # v4 to v3 protocol translations
│   └── structures/
│       ├── HTTPTranslator.js       # HTTP REST API translator
│       ├── LavaBridgeServer.js     # Main proxy server
│       ├── ProxiedConnection.js    # WebSocket connection handler
│       └── V3WebSocketTranslator.js # WebSocket message translator
├── config.js                       # Configuration file
├── package.json                    # Project dependencies
└── README.md                       # This file
```

## Supported Features

### REST API Translation
- ✅ `/loadtracks` - Track loading and searching
- ✅ `/v3/loadtracks` - Alternative v3 endpoint
- 🔄 More endpoints coming soon

### WebSocket Event Translation
- ✅ `play` - Play track commands
- ✅ `filters` - Audio filter updates
- ✅ `voiceUpdate` - Voice state updates
- 🔄 Additional events in development

## Limitations

- **Authentication**: This proxy does not implement authentication. DO NOT EXPOSE THIS APPLICATION ON PUBLIC NETWORKS!!!
- **Not type-safe**: The project is written in JavaScript without TypeScript type definitions
- **Encoded track version mismatch**: Tracks encoded in v4 may not be compatible with v3 client decoders
- **Experimental project**: This is an experimental project and may have bugs
- **Incomplete Feature Set**: Not all Lavalink features may be supported yet
- **Performance**: May introduce latency due to translation overhead
- **Testing**: Limited testing in production environments

## Disclaimer

This project is not affiliated with the official Lavalink project. It's a community-driven compatibility layer to help with migration between versions.

**Note**: This is an experimental project. Use in production at your own risk and always test thoroughly in your development environment first.
