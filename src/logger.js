/**
 * Logger utility for the proxy server
 */
class Logger {
	info(...args) {
		console.log(`[INFO]`, ...args);
	}

	debug(...args) {
		console.log(`[DEBUG]`, ...args);
	}

	log(...args) {
		console.log(`[LOG]`, ...args);
	}

	error(...args) {
		console.error(`[ERROR]`, ...args);
	}

	warn(...args) {
		console.warn(`[WARN]`, ...args);
	}
}

const logger = new Logger();

export { logger };
