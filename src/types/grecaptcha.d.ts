interface GrecaptchaV3 {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha: GrecaptchaV3;
  }
}

export {};
