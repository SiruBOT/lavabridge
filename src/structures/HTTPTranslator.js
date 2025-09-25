import { fetch } from "undici";
import { logger } from "../logger.js";
import { config } from "../../config.js";
import { v4tov3 } from "../protocol/v4tov3.js";

export class HTTPTranslator {
	constructor(app) {
		this.app = app;
	}

	registerRoutes() {
		logger.info("[Proxy/server/HttpTranslator] Registering routes");
		this.app.get("/loadtracks", this.translateLoadtracks);
		this.app.get("/v3/loadtracks", this.translateLoadtracks);
	}

	async translateLoadtracks(req, res) {
		const identifier = req.query.identifier;
		const targetUrl = `${config.v4.rest}/v4/loadtracks?identifier=${encodeURIComponent(identifier)}`;
		const r = await fetch(targetUrl, {
			headers: { Authorization: config.v4.password },
		});
		const json = await r.json();

		logger.debug(`[Proxy/http][proxy → v4] ${targetUrl}`, json);
		const translated = {
			loadType:
				v4tov3.rest.loadTracks.resultType[json.loadType.toLowerCase()] ||
				"LOAD_FAILED",
			tracks: [],
			playlistInfo: {},
		};

		switch (json.loadType) {
			case "playlist": {
				translated.playlistInfo = {
					name: json.data.info.name,
					selectedTrack: json.data.info.selectedTrack,
				};
				translated.tracks = json.data.tracks.map((t) => ({
					track: t.encoded,
					info: t.info,
				}));
				break;
			}
			case "search": {
				translated.tracks = json.data.map((t) => ({
					track: t.encoded,
					info: t.info,
				}));
				break;
			}
			case "empty": {
				translated.tracks = [];
				break;
			}
			case "track": {
				translated.tracks.push({
					track: json.data.encoded,
					info: json.data.info,
				});
				break;
			}
			default:
				logger.warn(
					"[Proxy/http][v4 → proxy] Unhandled loadType:",
					json.loadType
				);
				translated.tracks = [];
				break;
		}

		logger.debug(`[Proxy/http][proxy → v3] translated v4 → v3`, translated);

		res.json(translated);
	}
}
