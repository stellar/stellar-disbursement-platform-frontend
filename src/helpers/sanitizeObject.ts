import { AnyObject } from "types";

export const sanitizeObject = (object: AnyObject) =>
  Object.entries(object)
    .filter(([, val]) => Boolean(val))
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
