import { LOCAL_STORAGE_WALLET_NOTICE_STATE } from "@/constants/settings";

type WalletNoticeState = {
  verifiedDismissed?: boolean;
  transactionsDismissed?: boolean;
};

type WalletNoticeStateMap = Record<string, WalletNoticeState>;

const readState = (): WalletNoticeStateMap => {
  const raw = localStorage.getItem(LOCAL_STORAGE_WALLET_NOTICE_STATE);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as WalletNoticeStateMap;
    }
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
    if (!credentialId) {
      return {
        verifiedDismissed: false,
        transactionsDismissed: false,
      };
    }

    const state = readState()[credentialId] ?? {};
    return {
      verifiedDismissed: Boolean(state.verifiedDismissed),
      transactionsDismissed: Boolean(state.transactionsDismissed),
    };
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
