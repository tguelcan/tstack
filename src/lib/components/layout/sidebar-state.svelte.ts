import { browser } from '$app/env';

const STORAGE_KEY = 'tstack:sidebar';

/**
 * Whether the app sidebar is narrowed down to its icons.
 *
 * The width itself comes from CSS keyed on `data-sidebar` on `<html>` (see
 * `main.css`), which lets the inline script in `app.html` restore the stored
 * value before the first paint. This class owns that attribute and mirrors it
 * into a rune, so the toggle button can render the matching icon and label.
 */
class SidebarState {
	collapsed = $state(false);

	constructor() {
		// The module is evaluated in the browser only after the server-rendered
		// markup is on screen, so reading the attribute here picks up whatever the
		// inline script decided.
		if (browser) this.collapsed = document.documentElement.dataset.sidebar === 'collapsed';
	}

	toggle() {
		this.collapsed = !this.collapsed;

		const value = this.collapsed ? 'collapsed' : 'expanded';
		document.documentElement.dataset.sidebar = value;

		try {
			localStorage.setItem(STORAGE_KEY, value);
		} catch {
			// Storage blocked — the choice simply does not survive a reload.
		}
	}
}

export const sidebar = new SidebarState();
