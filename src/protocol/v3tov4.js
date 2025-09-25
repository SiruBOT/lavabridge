export const v3tov4 = {
	ws: {
		play: (data) => {
			return {
				noReplace: data.noReplace || false,
				track: {
					encoded: data.track,
				},
				position: data.startTime || 0,
				paused: data.pause,
			};
		},
		filters: (data) => {
			return {
				filters: {
					volume: data.volume * 0.5, // 50%
					equalizer: data.equalizer,
					karaoke: data.karaoke,
					timescale: data.timescale,
					tremolo: data.tremolo,
					vibrato: data.vibrato,
					rotation: data.rotation,
					distortion: data.distortion,
					channelMix: data.channelMix,
					lowPass: data.lowPass,
				},
			};
		},
		voiceUpdate: (data) => {
			return {
				voice: {
					token: data.event.token,
					endpoint: data.event.endpoint,
					sessionId: data.sessionId,
				},
			};
		},
	},
};
