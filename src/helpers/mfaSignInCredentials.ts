// Sign-in credentials kept for "Resend code" on the MFA page. Memory only: navigation state and
// web storage are written to disk by the browser.
let credentials: { email: string; password: string } | null = null;

export const mfaSignInCredentials = {
  get: () => credentials,
  set: (email: string, password: string) => {
    credentials = email && password ? { email, password } : null;
  },
  remove: () => {
    credentials = null;
  },
};
