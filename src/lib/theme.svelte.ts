const THEMES = ['bluewhite', 'amber', 'green', 'white'] as const;
export type ThemeType = (typeof THEMES)[number];

export const theme = $state<{ theme: undefined | ThemeType }>({ theme: undefined });

export const setTheme = (t: ThemeType) => {
	if (theme.theme === t) return;
	if (THEMES.indexOf(t) === -1) return;
	localStorage.setItem('theme', t);
	theme.theme = t;
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
