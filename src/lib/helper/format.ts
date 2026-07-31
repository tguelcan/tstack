/**
 * Shared formatters. `Intl` instances are expensive to construct, so they are
 * created once at module level and reused by every component.
 */

const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' });

/** Cache for the per-time-zone formatters, built on first use. */
const zoned = new Map<string, Intl.DateTimeFormat>();

/**
 * Formats a timestamp, in the reader's own time zone when they have set one on
 * their profile. Without it the server's zone applies, which is what a date has
 * always meant here.
 */
export function formatDateTime(date: Date, timeZone?: string | null): string {
	if (!timeZone) return dateTime.format(date);

	let formatter = zoned.get(timeZone);

	if (!formatter) {
		try {
			formatter = new Intl.DateTimeFormat('en-GB', {
				dateStyle: 'short',
				timeStyle: 'short',
				timeZone
			});
		} catch {
			// An unknown zone throws. Falling back beats an error boundary over a
			// timestamp — the value stored on the profile may predate a tz database
			// update, or have been written by hand.
			formatter = dateTime;
		}

		zoned.set(timeZone, formatter);
	}

	return formatter.format(date);
}

/**
 * Turns a name into something that can sit in a URL: `Acme Inc.` → `acme-inc`.
 *
 * The server falls back to this when the address field of the organization
 * form was left empty, which is why it lives here rather than under `$server`.
 */
export function slugify(value: string): string {
	return (
		value
			.normalize('NFKD')
			// Strip the accents that `NFKD` just split off, so `Müller` becomes
			// `muller` rather than losing the vowel entirely.
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 48)
	);
}

/** Browser and platform, in the order people recognise them. */
const AGENTS: [RegExp, string][] = [
	[/Edg\//, 'Edge'],
	[/OPR\/|Opera/, 'Opera'],
	[/Firefox\//, 'Firefox'],
	// Every Chromium browser also claims to be Safari, so Safari has to be what is
	// left over once the others have had their turn.
	[/Chrome\/|CriOS\//, 'Chrome'],
	[/Safari\//, 'Safari']
];

const PLATFORMS: [RegExp, string][] = [
	[/iPhone/, 'iPhone'],
	[/iPad/, 'iPad'],
	[/Android/, 'Android'],
	[/Mac OS X|Macintosh/, 'macOS'],
	[/Windows/, 'Windows'],
	[/Linux/, 'Linux']
];

const match = (table: [RegExp, string][], value: string) =>
	table.find(([pattern]) => pattern.test(value))?.[1];

/**
 * A readable name for a signed-in device, e.g. `macOS · Safari`.
 *
 * Deliberately coarse. The list of active sessions exists to answer "is one of
 * these not me?", and for that a phone is a phone — a full user-agent string
 * makes that question harder to answer, not easier.
 */
export function describeUserAgent(userAgent: string | null | undefined): string {
	if (!userAgent) return 'Unknown device';

	const parts = [match(PLATFORMS, userAgent), match(AGENTS, userAgent)].filter(Boolean);

	return parts.length ? parts.join(' · ') : 'Unknown device';
}
