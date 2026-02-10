import crypto from "crypto";

const SECRET = process.env.USER_HASH_SECRET!;

export function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(password)
    .digest("hex");
}

export function comparePassword(
  passwordPlano: string,
  passwordHasheadaBD: string
): boolean {
  const hashInput = hashPassword(passwordPlano);
  return hashInput === passwordHasheadaBD;
}

export function generarTokenSeguro(): string {
  return crypto.randomBytes(32).toString("hex");
}
