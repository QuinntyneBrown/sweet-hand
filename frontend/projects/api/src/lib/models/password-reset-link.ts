/** Whose password a reset link changes. 410 when the link has expired or was used (L2-077.2). */
export interface PasswordResetLink {
  email: string;
}
