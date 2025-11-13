import { LOCAL_STORAGE_WALLET_SESSION_TOKEN } from "@/constants/settings";
import type { ApiAsset } from "@/types";

export type WalletSessionStorageValue = {
  token: string;
  isVerificationPending: boolean;
  pendingAsset?: ApiAsset;
};

const serialize = (value: WalletSessionStorageValue): string => {
  const { token, isVerificationPending, pendingAsset } = value;
  const payload: Record<string, any> = { token, isVerificationPending };

  if (pendingAsset !== undefined) {
    payload.pendingAsset = pendingAsset;
  }

  return JSON.stringify(payload);
};

const deserialize = (storedValue: string): WalletSessionStorageValue | null => {
  try {
    const parsed = JSON.parse(storedValue);

    if (typeof parsed === "string") {
      return { token: parsed, isVerificationPending: false };
    }

    if (!parsed || typeof parsed.token !== "string") {
      console.warn("Invalid wallet session format");
      return null;
    }

    return {
      token: parsed.token,
      isVerificationPending: Boolean(parsed.isVerificationPending),
      pendingAsset: parsed.pendingAsset,
    };
  } catch (error) {
    console.warn("Failed to parse wallet session:", error);
    return null;
  }
};

export const localStorageWalletSessionToken = {
  get: (): WalletSessionStorageValue | null => {
    const storedValue = localStorage.getItem(LOCAL_STORAGE_WALLET_SESSION_TOKEN);
    return storedValue ? deserialize(storedValue) : null;
  },
  set: (value: WalletSessionStorageValue) => {
    return localStorage.setItem(LOCAL_STORAGE_WALLET_SESSION_TOKEN, serialize(value));
  },
  remove: () => {
    return localStorage.removeItem(LOCAL_STORAGE_WALLET_SESSION_TOKEN);
  },
};
