/**
 * Helpers for daisyUI's focus-driven dropdowns.
 *
 * The menu is visible while focus is inside the `.dropdown` (`:focus-within`).
 * Safari and Firefox do not focus a clicked button, so pressing a menu item
 * first blurs the trigger — the menu disappears between mousedown and mouseup
 * and the item never receives the click. `keepFocus` on the menu's `mousedown`
 * prevents that focus change; the click then lands normally.
 *
 * The flip side: because focus now stays on the trigger, choosing an item no
 * longer closes the menu by itself — call `closeDropdown` in the item's click
 * handler.
 */

export function keepFocus(event: MouseEvent): void {
	event.preventDefault();
}

export function closeDropdown(): void {
	if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}
