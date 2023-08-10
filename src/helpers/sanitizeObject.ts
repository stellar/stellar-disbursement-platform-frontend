import { AnyObject } from "types";

export const sanitizeObject = (object: AnyObject) =>
  Object.entries(object)
    .filter(([, val]) => (typeof val === "boolean" ? true : Boolean(val)))
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
