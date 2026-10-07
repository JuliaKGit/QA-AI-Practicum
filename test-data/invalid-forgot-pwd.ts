/**
 * Invalid **Email** inputs explicitly covered by AQPBT-7 acceptance criteria only.
 *
 * Open questions (not listed here — no AC rule):
 * - Whitespace-only **Email** (AC5 covers empty, not spaces).
 * - Valid-format edge cases besides `notanemail` (e.g. missing domain); AC6 only names `notanemail`.
 * - Whether browser validation copy must be asserted (live empty → "Please fill out this field.";
 *   `notanemail` → "Please include an '@' in the email address…" — not in AC).
 */
export const invalidForgotPasswordInputs = {
  /** AC5: empty **Email** field → stay on **Reset your password**; no **If an account exists for**. */
  emptyEmail: '',
  /** AC6: `notanemail` in **Email** → no **If an account exists for**; **Send reset link** remains. */
  missingAtSign: 'notanemail',
} as const;

export type InvalidForgotPasswordInput =
  (typeof invalidForgotPasswordInputs)[keyof typeof invalidForgotPasswordInputs];
