const jwt = require("jsonwebtoken");
import { config } from "../../config";
export const generateJwtToken = (payload: any) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: '24h'}); // 48 hrs expiration

export const verifyJwtToken = (token: any, cb: any) =>
  jwt.verify(token, config.jwtSecret, {}, cb);

export const verifyUserJwtToken = (token: any) => {
  return jwt.verify(token, config.jwtSecret);
};
