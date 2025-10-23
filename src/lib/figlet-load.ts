// src/lib/figlet-preload.ts
import figlet from 'figlet';

export function setFontPath(path: string) {
	figlet.defaults({ fontPath: path });
}

export function loadFont(name: string): Promise<void> {
	return new Promise((resolve, reject) => {
		// If already present, resolve immediately
		if (figlet.figFonts?.[name]) return resolve();

		figlet.loadFont(name, (err) => (err ? reject(err) : resolve()));
	});
}

export function preloadFonts(names: string[]): Promise<void> {
	return Promise.all(names.map(loadFont)).then(() => {});
}

export function renderBigFont(text: string, font: string): Promise<string> {
	return new Promise((resolve, reject) => {
		figlet.text(text, { font }, (err, out) => (err ? reject(err) : resolve(out ?? '')));
	});
}

export { figlet };
