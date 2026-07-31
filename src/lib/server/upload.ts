import { mkdir, unlink } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { UPLOAD_DIR } from '$app/env/private';
import sharp from 'sharp';
import { config, type PresetName } from './config';

/**
 * Image uploads.
 *
 * Nothing the visitor sent is ever written to disk. Every upload goes through
 * sharp and comes out as a WebP in exactly the size its preset prescribes, so an
 * avatar is 256×256 whether it arrived as a 12-megapixel photo or a screenshot.
 * The presets live in `config.json`; adding a format is a config change, not a
 * code change, and `PresetName` makes a typo a type error.
 *
 * Files land under `UPLOAD_DIR`, which on Railway is a mounted volume — keeping
 * it outside the app directory is what makes the images survive a deployment.
 */

/** Public paths always start here, which is also how we tell ours from theirs. */
const PREFIX = '/uploads/';

const root = resolve(UPLOAD_DIR);

export class UploadError extends Error {}

/**
 * Turns a path from a URL into an absolute file path, or `null` when it points
 * outside the upload directory.
 *
 * `[...path]` happily contains `../`, so this is the check that stands between a
 * public route and the rest of the filesystem. Only `.webp` is served, because
 * only `.webp` is ever written — a file with any other extension in there did
 * not come from us.
 */
export function resolveUpload(path: string): string | null {
	if (!path.endsWith('.webp')) return null;

	const file = resolve(root, path);
	if (!file.startsWith(root + sep)) return null;

	return file;
}

/**
 * Resizes, converts and stores one image. Returns the public path to put in the
 * database, e.g. `/uploads/avatar/0f3c….webp`.
 */
export async function storeImage(file: File, preset: PresetName): Promise<string> {
	const { accept, maxBytes } = config.uploads;

	if (!accept.includes(file.type)) {
		const names = accept.map((type) => type.replace('image/', '').toUpperCase());
		throw new UploadError(`Use one of ${names.join(', ')}`);
	}

	if (file.size > maxBytes) {
		throw new UploadError(`Keep the file under ${Math.round(maxBytes / 1024 / 1024)} MB`);
	}

	const { width, height, fit, quality } = config.uploads.presets[preset];

	let output: Buffer;

	try {
		output = await sharp(Buffer.from(await file.arrayBuffer()))
			// Phones record orientation in EXIF instead of rotating the pixels.
			// Without this, portrait photos arrive on their side.
			.rotate()
			.resize({
				width,
				height,
				fit,
				// `inside` is meant to bound an image, not to blow a small one up.
				withoutEnlargement: fit === 'inside',
				// Only visible with `contain`, where a non-square logo gets padded.
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.webp({ quality })
			.toBuffer();
	} catch {
		// sharp rejects anything it cannot decode — including a file that merely
		// claims to be an image in its content type.
		throw new UploadError('That file is not an image we can read');
	}

	const name = `${preset}/${crypto.randomUUID()}.webp`;
	const file_path = resolve(root, name);

	await mkdir(dirname(file_path), { recursive: true });
	await writeFile(file_path, output);

	return `${PREFIX}${name}`;
}

/**
 * `storeImage` for form handlers: turns the upload rules into a field message
 * via `reject` (typically `(message) => invalid(issue.field(message))`) and
 * lets everything else keep flying as a genuine error. Returns `undefined`
 * when no file was chosen.
 */
export async function storeImageField(
	file: File,
	preset: PresetName,
	reject: (message: string) => never
): Promise<string>;
export async function storeImageField(
	file: File | undefined,
	preset: PresetName,
	reject: (message: string) => never
): Promise<string | undefined>;
export async function storeImageField(
	file: File | undefined,
	preset: PresetName,
	reject: (message: string) => never
): Promise<string | undefined> {
	if (!file) return undefined;

	try {
		return await storeImage(file, preset);
	} catch (error) {
		if (error instanceof UploadError) reject(error.message);
		throw error;
	}
}

/**
 * Removes an image we stored.
 *
 * Silently ignores anything that is not one of ours — a social login writes the
 * provider's avatar URL into the same column, and replacing that picture must
 * not try to unlink `https://lh3.googleusercontent.com/…`. A missing file is not
 * an error either: the point is that it is gone.
 */
export async function deleteImage(publicPath: string | null | undefined): Promise<void> {
	if (!publicPath?.startsWith(PREFIX)) return;

	const file = resolveUpload(publicPath.slice(PREFIX.length));
	if (!file) return;

	await unlink(file).catch(() => {});
}
