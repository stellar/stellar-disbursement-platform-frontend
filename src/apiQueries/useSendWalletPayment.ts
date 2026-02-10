import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";

import {
  Account,
  Address,
  Asset,
  BASE_FEE,
  Contract,
  Keypair,
  StrKey,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";

import {
  WALLET_PAYMENT_SIMULATION_ERROR_CODE,
  WALLET_PAYMENT_TRANSACTION_FAILED_CODE,
} from "@/constants/settings";

import {
  createSponsoredTransaction,
  pollSponsoredTransactionStatus,
} from "@/api/sponsoredTransactions";

import { createAuthenticatedRpcServer } from "@/helpers/createAuthenticatedRpcServer";
import { signSorobanAuthorizationEntries } from "@/helpers/signSorobanAuthorization";

import type { AppError } from "@/types";

export interface SendWalletPaymentParams {
  destination: string;
  amount: string;
}

export interface SendWalletPaymentResult {
  transactionId: string;
  transactionHash?: string;
}

interface UseSendWalletPaymentOptions {
  contractAddress?: string;
  credentialId?: string;
  balance: string;
  assetCode: string;
  assetIssuer?: string | null;
  onSuccess?: (result: SendWalletPaymentResult) => void | Promise<void>;
  onSigned?: () => void | Promise<void>;
}

const SIGNATURE_EXPIRATION_LEDGER_BUFFER = 10;

const getErrorExtras = (error: unknown) => {
  if (!error || typeof error !== "object" || !("extras" in error)) {
    return undefined;
  }
  return (error as AppError).extras;
};

export const isSimulationError = (error: unknown) =>
  getErrorExtras(error)?.code === WALLET_PAYMENT_SIMULATION_ERROR_CODE;

export const isTransactionFailedError = (error: unknown) =>
  getErrorExtras(error)?.code === WALLET_PAYMENT_TRANSACTION_FAILED_CODE;

export const getTransactionHashFromError = (error: unknown) =>
  getErrorExtras(error)?.transactionHash as string | undefined;

const createSimulationError = (message: string) => {
  const error = new Error(message) as Error & AppError;
  error.extras = { code: WALLET_PAYMENT_SIMULATION_ERROR_CODE };
  return error;
};

const createTransactionFailedError = (transactionHash?: string) => {
  const error = new Error("Transaction failed") as Error & AppError;
  error.extras = { code: WALLET_PAYMENT_TRANSACTION_FAILED_CODE, transactionHash };
  return error;
};

const validateDestination = (rawDestination: string): string => {
  const trimmed = rawDestination.trim();

  if (StrKey.isValidEd25519PublicKey(trimmed) || StrKey.isValidContract(trimmed)) {
    return trimmed;
  }

  throw new Error("Destination must be a valid Stellar account or contract address");
};

const resolveAmountInStroops = (rawAmount: string, balance: string): bigint => {
  const parsedAmount = new BigNumber(rawAmount);

  if (!parsedAmount.isFinite() || parsedAmount.lte(0)) {
    throw new Error("Enter a valid amount greater than zero");
  }

  const decimalPlaces = parsedAmount.decimalPlaces();
  if (decimalPlaces !== null && decimalPlaces > 7) {
    throw new Error("Amount cannot have more than 7 decimal places");
  }

  const availableBalance = new BigNumber(balance || "0");
  if (parsedAmount.gt(availableBalance)) {
    throw new Error("Insufficient balance");
  }

  const stroops = parsedAmount.multipliedBy(10 ** 7);
  if (!stroops.isInteger()) {
    throw new Error("Amount must resolve to a whole number of stroops");
  }

  return BigInt(stroops.toFixed(0));
};

const buildTransferOperation = ({
  assetContractId,
  contractAddress,
  destination,
  amount,
}: {
  assetContractId: string;
  contractAddress: string;
  destination: string;
  amount: bigint;
}) => {
  const assetContract = new Contract(assetContractId);

  return assetContract.call(
    "transfer",
    Address.fromString(contractAddress).toScVal(),
    Address.fromString(destination).toScVal(),
    nativeToScVal(amount, { type: "i128" }),
  );
};

const simulateTransferOperation = async ({
  operation,
  networkPassphrase,
}: {
  operation: xdr.Operation;
  networkPassphrase: string;
}) => {
  const rpcServer = createAuthenticatedRpcServer("wallet");

  const dummyAccount = new Account(Keypair.random().publicKey(), "0");

  const simulationTx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simulationResult = await rpcServer.simulateTransaction(simulationTx);

  if (!rpc.Api.isSimulationSuccess(simulationResult)) {
    const simulationError =
      "error" in simulationResult && simulationResult.error
        ? simulationResult.error
        : "Simulation failed";
    throw createSimulationError(simulationError);
  }

  return simulationResult;
};

export const useSendWalletPayment = ({
  contractAddress,
  credentialId,
  balance,
  assetCode,
  assetIssuer,
  onSuccess,
  onSigned,
}: UseSendWalletPaymentOptions) => {
  const mutation = useMutation<SendWalletPaymentResult, AppError, SendWalletPaymentParams>({
    mutationFn: async ({ destination: rawDestination, amount: rawAmount }) => {
      if (!contractAddress) {
        throw new Error("Wallet contract address is missing");
      }
      if (!credentialId) {
        throw new Error("Credential ID is required");
      }

      const destination = validateDestination(rawDestination);
      const amountInStroops = resolveAmountInStroops(rawAmount, balance);

      const rpcServer = createAuthenticatedRpcServer("wallet");
      const network = await rpcServer.getNetwork();
      const networkPassphrase = network.passphrase;
      const normalizedAssetCode = assetCode.trim();
      if (!normalizedAssetCode) {
        throw new Error("Asset code is required");
      }

      const asset =
        normalizedAssetCode === "XLM"
          ? Asset.native()
          : (() => {
              if (!assetIssuer) {
                throw new Error("Asset issuer is required for non-native assets");
              }
              return new Asset(normalizedAssetCode, assetIssuer);
            })();
      const assetContractId = asset.contractId(networkPassphrase);

      const transferOperation = buildTransferOperation({
        assetContractId,
        contractAddress,
        destination,
        amount: amountInStroops,
      });

      let simulationResult;
      try {
        simulationResult = await simulateTransferOperation({
          operation: transferOperation,
          networkPassphrase,
        });
      } catch (error) {
        if (isSimulationError(error)) {
          throw error;
        }
        const message = error instanceof Error ? error.message : "Simulation failed";
        throw createSimulationError(message);
      }

      const authEntries = simulationResult.result?.auth ?? [];

      if (!authEntries.length) {
        throw createSimulationError("Simulation did not return any authorization entries");
      }

      const signedAuthEntries = await signSorobanAuthorizationEntries({
        authEntries,
        contractAddress,
        credentialId,
        networkPassphrase,
        rpId: window.location.hostname,
        signatureExpirationLedger:
          simulationResult.latestLedger + SIGNATURE_EXPIRATION_LEDGER_BUFFER,
      });

      if (onSigned) {
        await onSigned();
      }

      const finalOperation = buildTransferOperation({
        assetContractId,
        contractAddress,
        destination,
        amount: amountInStroops,
      });
      finalOperation.body().invokeHostFunctionOp().auth(signedAuthEntries);

      const invokeHostFunctionOpXdr = finalOperation.body().invokeHostFunctionOp().toXDR("base64");

      const { id } = await createSponsoredTransaction({
        operation_xdr: invokeHostFunctionOpXdr,
      });

      const finalStatus = await pollSponsoredTransactionStatus(id);

      if (finalStatus.status === "FAILED") {
        throw createTransactionFailedError(finalStatus.transaction_hash);
      }

      return {
        transactionId: id,
        transactionHash: finalStatus.transaction_hash,
      };
    },
    onSuccess: async (result) => {
      if (onSuccess) {
        await onSuccess(result);
      }
    },
  });

  return {
    ...mutation,
    error: mutation.error as AppError | null,
    data: mutation.data,
    mutateAsync: (variables: SendWalletPaymentParams) => mutation.mutateAsync(variables),
  };
};
