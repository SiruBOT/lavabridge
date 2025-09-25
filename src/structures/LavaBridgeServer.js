import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { config } from "../../config.js";
import { logger } from "../logger.js";
import { ProxiedConnection } from "./ProxiedConnection.js";

export class LavaBridgeServer {
	constructor() {
		this.app = express();
		this.httpServer = http.createServer(this.app);

		this.websocketServer = new WebSocketServer({ server: this.httpServer });
	}

	start() {
		this.httpServer.listen(config.proxy.port, () => {
			logger.info(
				`[Proxy/server][REST+WS] listening on ${config.proxy.port} 🚀`
			);
		});
	}

	registerRoutes() {
		logger.info("[Proxy/server] Registering routes");
		this.app.use((req, res, next) => {
			logger.info(`[Proxy/http][v3 → proxy] ${req.method} ${req.url}`);
			next();
		});
	}

	registerWebsocketEvents() {
		this.websocketServer.on(
			"connection",
			this.onWebSocketConnection.bind(this)
		);
	}

	onWebSocketConnection(ws) {
		logger.info("[Proxy/ws] New websocket connection (v3 client → proxy)");
		const v3Socket = ws;
		const v4Socket = null;

		const proxiedConnection = new ProxiedConnection(v3Socket, v4Socket);
		proxiedConnection.initWebSocketConnection();
	}

	getExpressApp() {
		return this.app;
	}

	getWebSocketServer() {
		return this.websocketServer;
	}
}
