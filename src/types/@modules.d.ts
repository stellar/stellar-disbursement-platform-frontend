/* eslint-disable @typescript-eslint/no-require-imports */
declare module "*.svg" {
  import React = require("react");

  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.png";
declare module "*.jpeg";
declare module "*.jpg";
