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
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";

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
  onSuccess?: (result: SendWalletPaymentResult) => void | Promise<void>;
}

const resolveDestination = (rawDestination: string): string => {
  const trimmed = rawDestination.trim();

  if (StrKey.isValidEd25519PublicKey(trimmed) || StrKey.isValidContract(trimmed)) {
    return trimmed;
  }

  throw { message: "Destination must be a valid Stellar account or contract address" } as AppError;
};

const resolveAmountInStroops = (rawAmount: string, balance: string): bigint => {
  const parsedAmount = new BigNumber(rawAmount);

  if (!parsedAmount.isFinite() || parsedAmount.lte(0)) {
    throw { message: "Enter a valid amount greater than zero" } as AppError;
  }

  const decimalPlaces = parsedAmount.decimalPlaces();
  if (decimalPlaces !== null && decimalPlaces > 7) {
    throw { message: "Amount cannot have more than 7 decimal places" } as AppError;
  }

  const availableBalance = new BigNumber(balance || "0");
  if (parsedAmount.gt(availableBalance)) {
    throw { message: "Insufficient balance" } as AppError;
  }

  const stroops = parsedAmount.multipliedBy(10 ** 7);
  if (!stroops.isInteger()) {
    throw { message: "Amount must resolve to a whole number of stroops" } as AppError;
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
    throw { message: simulationError } as AppError;
  }

  return simulationResult;
};

export const useSendWalletPayment = ({
  contractAddress,
  credentialId,
  balance,
  onSuccess,
}: UseSendWalletPaymentOptions) => {
  const mutation = useMutation<SendWalletPaymentResult, AppError, SendWalletPaymentParams>({
    mutationFn: async ({ destination: rawDestination, amount: rawAmount }) => {
      if (!contractAddress) {
        throw { message: "Wallet contract address is missing" } as AppError;
      }
      if (!credentialId) {
        throw { message: "Credential ID is required" } as AppError;
      }

      const destination = resolveDestination(rawDestination);
      const amountInStroops = resolveAmountInStroops(rawAmount, balance);

      const rpcServer = createAuthenticatedRpcServer("wallet");
      const network = await rpcServer.getNetwork();
      const networkPassphrase = network.passphrase;
      const assetContractId = Asset.native().contractId(networkPassphrase);

      const transferOperation = buildTransferOperation({
        assetContractId,
        contractAddress,
        destination,
        amount: amountInStroops,
      });

      const simulationResult = await simulateTransferOperation({
        operation: transferOperation,
        networkPassphrase,
      });

      const authEntries = simulationResult.result?.auth ?? [];

      if (!authEntries.length) {
        throw { message: "Simulation did not return any authorization entries" } as AppError;
      }

      const signedAuthEntries = await signSorobanAuthorizationEntries({
        authEntries,
        contractAddress,
        credentialId,
        networkPassphrase,
        rpId: window.location.hostname,
        signatureExpirationLedger: simulationResult.latestLedger + 10,
      });

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
        throw { message: "Sponsored transaction failed" } as AppError;
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
