import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function generarJWT(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

export function verificarJWT(token: string) {
  return jwt.verify(token, SECRET);
}
