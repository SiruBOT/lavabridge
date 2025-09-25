import { LavaBridgeServer } from "./structures/LavaBridgeServer.js";
import { HTTPTranslator } from "./structures/HTTPTranslator.js";

const bridgeServer = new LavaBridgeServer();
const httpTranslator = new HTTPTranslator(bridgeServer.getExpressApp());

bridgeServer.registerRoutes();
bridgeServer.registerWebsocketEvents();
httpTranslator.registerRoutes();

bridgeServer.start();

process.on("unhandledRejection", (reason, promise) => {
	console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
	console.error("⚠️ Uncaught Exception:", error);
});
