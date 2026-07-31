import { z } from 'zod';
import { config } from './config';

/**
 * Field schemas shared by more than one remote module, so a rule — and its
 * message — cannot drift apart between the forms that use it.
 */

export const emailSchema = z.email('Please enter a valid email address');

export const passwordSchema = z
	.string()
	.min(
		config.auth.emailAndPassword.minPasswordLength,
		`Use at least ${config.auth.emailAndPassword.minPasswordLength} characters`
	);

/** A person's display name — registration and the profile form share it. */
export const personNameSchema = z
	.string()
	.trim()
	.min(1, 'Please enter your name')
	.max(80, 'Use 80 characters or fewer');
