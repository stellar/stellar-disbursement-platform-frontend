let scriptLoadingPromise: Promise<void> | null = null;

const isV3ScriptLoaded = (): boolean => {
  return !!document.querySelector(`script[src*="recaptcha/api.js?render="]`);
};

export const loadRecaptchaV3Script = (siteKey: string): Promise<void> => {
  if (isV3ScriptLoaded()) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      window.grecaptcha.ready(() => resolve());
    };
    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error("Failed to load reCAPTCHA v3 script"));
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

export const executeRecaptchaV3 = (siteKey: string, action: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(siteKey, { action }).then(resolve).catch(reject);
    });
  });
};
