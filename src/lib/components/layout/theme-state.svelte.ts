import { browser } from '$app/env';

const STORAGE_KEY = 'tstack:theme';

export type Theme = 'light' | 'dark';

/**
 * The active daisyUI theme.
 *
 * Like the sidebar width, the theme lives in an attribute on `<html>` that the
 * inline script in `app.html` sets before the first paint — otherwise every load
 * would flash the light theme first. This class keeps that attribute,
 * `localStorage` and the toggle button in sync.
 */
class ThemeState {
	current = $state<Theme>('light');

	constructor() {
		if (browser)
			this.current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = this.current;

		try {
			localStorage.setItem(STORAGE_KEY, this.current);
		} catch {
			// Storage blocked — the choice falls back to the OS preference on reload.
		}
	}
}

export const theme = new ThemeState();
