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
	#current = $state<Theme>('light');

	constructor() {
		if (browser)
			this.#current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	}

	get current(): Theme {
		return this.#current;
	}

	/** Applies the theme to `<html>` and remembers it for the next load. */
	set current(value: Theme) {
		this.#current = value;
		document.documentElement.dataset.theme = value;

		try {
			localStorage.setItem(STORAGE_KEY, value);
		} catch {
			// Storage blocked — the choice falls back to the OS preference on reload.
		}
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
	}
}

export const theme = new ThemeState();
