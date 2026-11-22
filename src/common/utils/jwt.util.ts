import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const generateToken = (
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

const verifyToken = (
  token: string,
  secret: string
): { success: boolean; data?: JwtPayload; error?: any } => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error };
  }
};

export const jwtUtils = {
  generateToken,
  verifyToken,
};
