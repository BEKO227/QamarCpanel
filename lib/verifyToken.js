import jwt from "jsonwebtoken";

const SECRET = "supersecretkey"; // Use .env in production

export function signAdminToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
}

export async function verifyAdminToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
