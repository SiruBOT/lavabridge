import { config } from "../../config.js";
import { logger } from "../logger.js";
import { v3tov4 } from "../protocol/v3tov4.js";
import { fetch } from "undici";

export class WebsocketTranslator {
	constructor(proxiedConnection) {
		this.proxiedConnection = proxiedConnection;
		this.headers = {
			Authorization: config.v4.password,
			"Content-Type": "application/json",
		};
	}

	async onV3SocketMessage(msg) {
		const data = JSON.parse(msg.toString());
		logger.debug("[Proxy/ws][v3 → proxy]", data);

		if (!data.op) return;
		if (
			!this.proxiedConnection.sessionId ||
			this.proxiedConnection.sessionId === "unknown"
		) {
			logger.warn(
				"[Proxy/ws][v3 → proxy] sessionId is not set yet, cannot forward message to v4"
			);
			return;
		}

		switch (data.op) {
			case "play": {
				const v4data = v3tov4.ws.play(data);
				this.debugLog(true, data.op, data, v4data);
				await this.patchPlayer(data.guildId, v4data, data.noReplace);
				break;
			}
			case "pause": {
				this.debugLog(true, data.op, data, v4data);
				await this.patchPlayer(data.guildId, { paused: data.pause });
				break;
			}
			case "seek": {
				this.debugLog(true, data.op, data, v4data);
				await this.patchPlayer(data.guildId, { position: data.position });
				break;
			}
			case "destroy": {
				this.debugLog(true, data.op, data);
				await fetch(this.getTargetUrl(data.guildId), {
					method: "DELETE",
					headers: this.headers,
				});
				break;
			}
			case "voiceUpdate": {
				const v4data = v3tov4.ws.voiceUpdate(data);
				this.debugLog(true, data.op, data, v4data);
				await this.patchPlayer(data.guildId, v4data);
				break;
			}
			case "filters": {
				const v4data = v3tov4.ws.filters(data);
				this.debugLog(true, data.op, data, v4data);
				await this.patchPlayer(data.guildId, v4data);
				break;
			}
			default: {
				this.debugLog(`unhandled op: ${data.op}`);
				break;
			}
		}
	}

	getTargetUrl(guildId, noReplace = undefined) {
		return (
			`${config.v4.rest}/v4/sessions/${this.proxiedConnection.sessionId}/players/${guildId}` +
			(noReplace !== undefined ? `?noReplace=${noReplace}` : "")
		);
	}

	async patchPlayer(guildId, data, noReplace = undefined) {
		if (!guildId) {
			logger.warn(
				`[Proxy/ws][${this.proxiedConnection.sessionId}][proxy → v4] guildId is required to patch player`
			);
		}

        const targetUrl = this.getTargetUrl(guildId, noReplace);
		logger.debug(
			`[Proxy/ws][proxy → v4][${this.proxiedConnection.sessionId}][PATCH] ${targetUrl}`,
			data
		);
		await fetch(targetUrl, {
			method: "PATCH",
			headers: this.headers,
			body: JSON.stringify(data),
		});
	}

	debugLog(translated, op, ...args) {
		logger.debug(
			`[Proxy/ws][proxy → v4][${this.proxiedConnection.sessionId}]${typeof translated == "boolean" ? `[translated][ws → http][${op}]` : translated}`,
			...args
		);
	}
}
