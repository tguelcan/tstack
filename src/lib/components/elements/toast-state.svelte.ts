/**
 * Transient messages, shown by the single `<Toaster />` in the root layout.
 *
 *     import { toast } from '$components/elements/toast-state.svelte';
 *     toast.success('Task created');
 *     toast.error('Could not reach the server', { timeout: 0 });
 *
 * Deliberately a module-level singleton rather than context: a toast is almost
 * always fired from a place that has no component tree to reach through — a
 * remote function callback, an error handler, a keyboard shortcut.
 */

export type ToastColor = 'info' | 'success' | 'warning' | 'error';

export type Toast = {
	id: number;
	color: ToastColor;
	title?: string;
	message: string;
};

type Options = {
	title?: string;
	/** Milliseconds until it disappears. `0` keeps it until dismissed. */
	timeout?: number;
};

const DEFAULT_TIMEOUT = 5000;

class Toaster {
	items = $state<Toast[]>([]);

	#nextId = 0;
	#timers = new Map<number, ReturnType<typeof setTimeout>>();

	show(message: string, color: ToastColor = 'info', options: Options = {}) {
		const id = this.#nextId++;
		this.items.push({ id, color, message, title: options.title });

		const timeout = options.timeout ?? DEFAULT_TIMEOUT;
		if (timeout > 0)
			this.#timers.set(
				id,
				setTimeout(() => this.dismiss(id), timeout)
			);

		return id;
	}

	info = (message: string, options?: Options) => this.show(message, 'info', options);
	success = (message: string, options?: Options) => this.show(message, 'success', options);
	warning = (message: string, options?: Options) => this.show(message, 'warning', options);
	error = (message: string, options?: Options) => this.show(message, 'error', options);

	dismiss(id: number) {
		// Clearing the timer matters for the dismiss-by-click path: without it a
		// later toast could reuse nothing, but the pending callback would still
		// fire and churn the array for no reason.
		clearTimeout(this.#timers.get(id));
		this.#timers.delete(id);

		this.items = this.items.filter((item) => item.id !== id);
	}
}

export const toast = new Toaster();
