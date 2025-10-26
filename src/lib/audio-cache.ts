// src/lib/audio-cache.ts
import { browser } from '$app/environment';

import errorSound from '$lib/assets/error.mp3';
import beepSound from '$lib/assets/beep.mp3';
import teletypeSound from '$lib/assets/teletype1.mp3';

export const SOUNDS = { error: errorSound, beep: beepSound, type: teletypeSound };

const cache = new Map<string, HTMLAudioElement>();

export function preloadAudio() {
	if (!browser) return;

	let key: 'error' | 'beep' | 'type';
	for (key in SOUNDS) {
		const a = new Audio(SOUNDS[key]);
		a.preload = 'auto';
		a.load();
		cache.set(key, a);
	}
	console.log('Loaded audio assets into cache:', Array.from(cache.keys()));
}

export function getAudio(key: string, src: string): HTMLAudioElement {
	if (!browser) throw new Error('No DOM');
	let a = cache.get(key);
	if (!a) {
		a = new Audio(src);
		a.preload = 'auto';
		a.load();
		cache.set(src, a);
	}
	return a.cloneNode(true) as HTMLAudioElement;
}
