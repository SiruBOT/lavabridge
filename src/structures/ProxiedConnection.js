import WebSocket from "ws";
import { config } from "../../config.js";
import { logger } from "../logger.js";
import { WebsocketTranslator } from "./V3WebSocketTranslator.js";

export class ProxiedConnection {
	constructor(v3Socket) {
		this.sessionId = "unknown";
		this.v3Socket = v3Socket;
		this.v4Socket = null;
		this.websocketTranslator = null;
	}

	initWebSocketConnection() {
		this.v4Socket = new WebSocket(config.v4.websocket, {
			headers: {
				Authorization: config.v4.password,
				"User-Id": config.v4.userId,
				"Client-Name": config.v4.clientName,
			},
		});

		this.websocketTranslator = new WebsocketTranslator(this);

		this.v4Socket.on("open", this.onV4SocketOpen.bind(this));
		this.v4Socket.on("message", this.onV4SocketMessage.bind(this));
		this.v4Socket.on("close", () => {
			logger.info(
				`[Proxy/ws][${this.sessionId}][v4 → proxy] closed, reconnecting...`
			);
			setTimeout(() => this.initWebSocketConnection(), 2000);
		});

		this.v3Socket.on(
			"message",
			this.websocketTranslator.onV3SocketMessage.bind(this.websocketTranslator)
		);
		this.v3Socket.on("close", () => {
			logger.info(
				`[Proxy/ws][${this.sessionId}][v3 → proxy] closed, closing v4 socket...`
			);
			if (this.v4Socket) this.v4Socket.close();
		});
	}

	onV4SocketOpen() {
		logger.info(`[Proxy/ws][${this.sessionId}][v4 → proxy] Connected to v4 WS`);
	}

	onV4SocketMessage(msg) {
		const data = JSON.parse(msg.toString());
		logger.debug(`[Proxy/ws][${this.sessionId}][v4 → proxy]`, data);

		const op = data.op;
		// V4 Websocket only have four ops: ready, playerUpdate, stats, event
		switch (op) {
			case "ready":
				this.sessionId = data.sessionId;
				logger.info(
					`[Proxy/ws][${this.sessionId}][v4 → proxy] Set session ID: `,
					this.sessionId
				);
				break;
			case "playerUpdate":
			case "stats":
				logger.debug(
					`[Proxy/ws][v4 → proxy][${data.op}] forwarding v4 websocket message to v3 clients (not translated)`
				);
				this.sendV3Socket(data);
				break;
			case "event":
				{
					// translate v4 websocket event object to v3 format and send to all connected v3 clients
					switch (data.type) {
						// this.websocketTranslator
						default:
							this.forwardUnhandled(data.type || "unknown event", data);
							break;
					}
				}
				break;
			default:
				this.forwardUnhandled(op || "unknown op", data);
				break;
		}
	}

	forwardUnhandled(type, data) {
		logger.debug(
			`[Proxy/ws][v4 → proxy] Forward ${type ? ` (${type})` : ""} message to v3 clients`,
			data
		);
		this.sendV3Socket(data);
	}

	sendV3Socket(data) {
		if (this.v3Socket && this.v3Socket.readyState === WebSocket.OPEN) {
			this.v3Socket.send(JSON.stringify(data));
		}
	}
}
