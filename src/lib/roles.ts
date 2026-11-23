// Correos autorizados como super administrador del directorio.
// Mantener en minúsculas; la comparación es case-insensitive.
export const SUPER_ADMIN_EMAILS: string[] = [
  "lae.sergio.alvarez@gmail.com",
];

export function esSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}