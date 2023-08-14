import { AnyObject } from "types";

export const removeFalsyKeys = (obj: AnyObject): AnyObject =>
  Object.keys(obj).reduce((res, cur) => {
    if (obj[cur]) {
      return { ...res, [cur]: obj[cur] };
    }

    return res;
  }, {});
