import { LOCAL_STORAGE_WALLET_NOTICE_STATE } from "@/constants/settings";

export type WalletNoticeState = {
  verifiedDismissed?: boolean;
};

type WalletNoticeStateMap = Record<string, WalletNoticeState>;

export type WalletNoticeKey = keyof WalletNoticeState;

const getNoticeStateWithDefaults = (state?: WalletNoticeState): Required<WalletNoticeState> => ({
  verifiedDismissed: Boolean(state?.verifiedDismissed),
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readState = (): WalletNoticeStateMap => {
  const raw = localStorage.getItem(LOCAL_STORAGE_WALLET_NOTICE_STATE);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<WalletNoticeStateMap>((acc, [key, value]) => {
      if (isPlainObject(value)) {
        acc[key] = value as WalletNoticeState;
      }
      return acc;
    }, {});
  } catch {
    // ignore malformed storage
  }

  return {};
};

const writeState = (state: WalletNoticeStateMap) => {
  localStorage.setItem(LOCAL_STORAGE_WALLET_NOTICE_STATE, JSON.stringify(state));
};

export const localStorageWalletNotices = {
  get: (credentialId?: string): Required<WalletNoticeState> => {
    return getNoticeStateWithDefaults(credentialId ? readState()[credentialId] : undefined);
  },
  set: (credentialId: string | undefined, updates: WalletNoticeState) => {
    if (!credentialId) {
      return;
    }

    const state = readState();
    state[credentialId] = {
      ...state[credentialId],
      ...updates,
    };
    writeState(state);
  },
  reset: (credentialId?: string) => {
    if (!credentialId) {
      return;
    }

    const state = readState();
    if (state[credentialId]) {
      delete state[credentialId];
      writeState(state);
    }
  },
};
