import { useQuery } from "@tanstack/react-query";

import { Asset } from "@stellar/stellar-sdk";

import { createAuthenticatedRpcServer } from "@/helpers/createAuthenticatedRpcServer";

import type { AppError } from "@/types";

export type DestinationCheckStatus = "idle" | "checking" | "exists" | "missing" | "error";
export type TrustlineCheckStatus = "idle" | "checking" | "present" | "missing" | "error";

type AccountCheckResult = {
  status: "exists" | "missing";
};

type TrustlineCheckResult = { status: "present" | "missing" | "error" };

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const isAccountNotFoundError = (message: string) =>
  message.toLowerCase().includes("account not found");

const isTrustlineMissingError = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("trustline");
};

export const useWalletDestinationChecks = ({
  destination,
  shouldCheckDestination,
  assetCode,
  assetIssuer,
}: {
  destination: string;
  shouldCheckDestination: boolean;
  assetCode?: string;
  assetIssuer?: string | null;
}) => {
  const trimmedDestination = destination.trim();
  const accountQuery = useQuery<AccountCheckResult, AppError>({
    queryKey: ["wallet-destination-check", trimmedDestination],
    queryFn: async () => {
      const rpcServer = createAuthenticatedRpcServer("wallet");

      try {
        await rpcServer.getAccount(trimmedDestination);
        return { status: "exists" };
      } catch (error) {
        const message = getErrorMessage(error);
        if (isAccountNotFoundError(message)) {
          return { status: "missing" };
        }

        throw error;
      }
    },
    enabled: shouldCheckDestination && Boolean(trimmedDestination),
  });

  const shouldCheckTrustline =
    shouldCheckDestination && accountQuery.data?.status === "exists" && Boolean(assetCode);

  const trustlineQuery = useQuery<TrustlineCheckResult, AppError>({
    queryKey: ["wallet-trustline-check", trimmedDestination, assetCode, assetIssuer],
    queryFn: async () => {
      if (!assetCode) {
        return { status: "present" };
      }

      if (assetCode === "XLM" && !assetIssuer) {
        return { status: "present" };
      }

      if (!assetIssuer) {
        return { status: "error" };
      }

      const rpcServer = createAuthenticatedRpcServer("wallet");

      try {
        const balanceResponse = await rpcServer.getAssetBalance(
          trimmedDestination,
          new Asset(assetCode, assetIssuer),
        );

        return balanceResponse.balanceEntry ? { status: "present" } : { status: "missing" };
      } catch (error) {
        const message = getErrorMessage(error);
        if (isTrustlineMissingError(message)) {
          return { status: "missing" };
        }

        throw error;
      }
    },
    enabled: shouldCheckTrustline,
  });

  const destinationStatus: DestinationCheckStatus = !shouldCheckDestination
    ? "idle"
    : accountQuery.isFetching
      ? "checking"
      : accountQuery.isError
        ? "error"
        : (accountQuery.data?.status ?? "idle");

  let trustlineStatus: TrustlineCheckStatus = "idle";
  if (!shouldCheckDestination || destinationStatus !== "exists") {
    trustlineStatus = "idle";
  } else if (trustlineQuery.isFetching) {
    trustlineStatus = "checking";
  } else if (trustlineQuery.isError) {
    trustlineStatus = "error";
  } else if (trustlineQuery.data) {
    trustlineStatus = trustlineQuery.data.status;
  }

  return { destinationStatus, trustlineStatus };
};
