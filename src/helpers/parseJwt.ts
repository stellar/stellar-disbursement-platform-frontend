import { Buffer } from "buffer";

export const parseJwt = (token: string) => {
  try {
    const base64Payload = token.split(".")[1];
    const payload = Buffer.from(base64Payload, "base64");
    return JSON.parse(payload.toString());
  } catch {
    return {};
  }
};
