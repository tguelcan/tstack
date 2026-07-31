import { dev } from '$app/env';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_URL, RESEND_API_KEY } from '$app/env/private';
import { Resend } from 'resend';
import { config } from './config';

/**
 * Transactional email.
 *
 * Every message this app sends is the same shape: a heading, a line or two of
 * explanation, and one button that is the actual point of the mail. `sendMail`
 * takes that shape and renders both an HTML and a plain-text version, so the
 * three call sites in `auth.ts` stay two lines each and no message can drift
 * away from the others.
 *
 * Without `RESEND_API_KEY` the message is printed to the terminal instead of
 * sent. That is not a production fallback — it is what makes a local sign-up
 * possible at all, given that the app wants a confirmed address before the first
 * login. In production the same situation is logged as an error instead, because
 * a mail that cannot be sent must not take a sign-up down with it.
 *
 * `sendMail` never rejects. Better Auth's callbacks are expected to be fired
 * with `void` rather than awaited — awaiting them leaks, through response time,
 * whether an address exists. A failure is therefore logged, loudly, and swallowed.
 */

type Action = {
	label: string;
	url: string;
};

type Mail = {
	to: string;
	subject: string;
	heading: string;
	/** One paragraph per entry. */
	lines: string[];
	action: Action;
	/** Shown small and grey under the button, e.g. how long a link is valid. */
	note?: string;
};

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Makes a link absolute.
 *
 * Better Auth hands over a *relative* URL whenever it cannot work out the
 * origin, which is the case as long as `BETTER_AUTH_URL` is unset. A relative
 * link is useless in an inbox, and the failure is quiet — the mail arrives, it
 * just cannot be clicked. So every link goes through here rather than being
 * trusted to arrive absolute.
 */
function absolute(url: string): string {
	if (!url.startsWith('/')) return url;

	const configured = BETTER_AUTH_URL.replace(/\/+$/, '');
	if (configured) return configured + url;

	try {
		// Inside a request — which is where all of these callbacks run.
		return getRequestEvent().url.origin + url;
	} catch {
		// Outside one there is nothing to guess from. Better a visibly broken link
		// than one that silently points at the wrong host.
		return url;
	}
}

/** Prevents an injected `</style>` or `<script>` from escaping into the markup. */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function render({ heading, lines, action, note }: Mail): { html: string; text: string } {
	const url = absolute(action.url);

	const paragraphs = lines
		.map(
			(line) =>
				`<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46">${escapeHtml(line)}</p>`
		)
		.join('');

	// Inline styles and a table, because that is the subset of HTML that renders
	// the same way in Outlook as it does in a browser.
	const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7">
<tr><td style="padding:32px">
<p style="margin:0 0 24px;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#71717a">${escapeHtml(config.app.name)}</p>
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#18181b">${escapeHtml(heading)}</h1>
${paragraphs}
<p style="margin:24px 0 0"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#18181b;color:#ffffff;font-size:15px;font-weight:500;text-decoration:none">${escapeHtml(action.label)}</a></p>
${note ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#71717a">${escapeHtml(note)}</p>` : ''}
<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#71717a">If the button does not work, copy this address into your browser:<br><span style="color:#3f3f46;word-break:break-all">${escapeHtml(url)}</span></p>
</td></tr></table>
</td></tr></table>
</body></html>`;

	const text = [
		heading,
		'',
		...lines,
		'',
		`${action.label}: ${url}`,
		...(note ? ['', note] : [])
	].join('\n');

	return { html, text };
}

export async function sendMail(mail: Mail): Promise<void> {
	const { html, text } = render(mail);

	if (!resend) {
		if (!dev) {
			console.error(
				`[mail] RESEND_API_KEY is not set — "${mail.subject}" to ${mail.to} was never sent.`
			);
			return;
		}

		console.info(`\n[mail] to ${mail.to} — ${mail.subject}\n${text}\n`);
		return;
	}

	try {
		const { error } = await resend.emails.send({
			from: config.mail.from,
			to: mail.to,
			subject: mail.subject,
			html,
			text
		});

		// Resend reports rejections in the payload rather than by throwing.
		if (error) console.error(`[mail] "${mail.subject}" to ${mail.to} failed:`, error);
	} catch (error) {
		console.error(`[mail] "${mail.subject}" to ${mail.to} failed:`, error);
	}
}
