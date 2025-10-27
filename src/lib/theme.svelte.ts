import { THEMES, type ThemeType } from '$lib/PhosphorData';

export const theme = $state<{ theme: undefined | ThemeType }>({ theme: undefined });

export const getTheme = (): ThemeType | undefined => {
	return theme.theme;
};

export const setTheme = (t: string) => {
	if (!t) return;
	const tLow = t.toLowerCase();
	if (theme.theme === tLow) return;
	if (THEMES.indexOf(tLow as any) === -1) return;
	localStorage.setItem('theme', tLow);
	theme.theme = tLow as ThemeType;
};
export const initTheme = () => {
	const t = localStorage.getItem('theme') as ThemeType;
	if (t && THEMES.indexOf(t) !== -1) {
		theme.theme = t;
	} else {
		setTheme('amber');
		// localStorage.setItem('theme', theme.theme);
	}
};
export const nextTheme = () => {
	if (theme.theme === undefined) {
		setTheme(THEMES[0]);
		return;
	}
	const i = THEMES.indexOf(theme.theme);
	const ni = (i + 1) % THEMES.length;
	setTheme(THEMES[ni]);
};
