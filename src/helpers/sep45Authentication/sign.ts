import { XdrWriter } from "@stellar/js-xdr";
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  SorobanDataBuilder,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { Api } from "@stellar/stellar-sdk/rpc";

import { createAuthenticatedRpcServer } from "../createAuthenticatedRpcServer";
import { signSorobanAuthorizationEntries } from "../signSorobanAuthorization";

type Sep45SignParams = {
  authEntries: string;
  contractAddress: string;
  credentialId?: string;
  expectedArgs: Record<string, string>;
  serverSigningKey: string;
  webAuthContractId: string;
};

const validateAuthorizationEntry = (
  entry: xdr.SorobanAuthorizationEntry,
  expectedArgs: Record<string, string>,
  webAuthContractId: string,
) => {
  const invocation = entry.rootInvocation();
  if (invocation.subInvocations().length) {
    throw new Error("Invocation authorizes sub-invocations to another contract");
  }

  const contractFn = invocation.function().contractFn();
  const contractId = Address.fromScAddress(contractFn.contractAddress()).toString();
  if (contractId !== webAuthContractId) {
    throw new Error(`contractId is invalid! Expected: ${webAuthContractId} but got: ${contractId}`);
  }

  const fnName = contractFn.functionName().toString();
  if (fnName !== "web_auth_verify") {
    throw new Error(`Function name is invalid! Expected: web_auth_verify but got: ${fnName}`);
  }

  const args = contractFn.args();
  if (!args.length) {
    throw new Error("web_auth_verify invocation missing arguments");
  }

  const argMap = args[0].map();
  if (!argMap) {
    throw new Error("web_auth_verify arguments must be a map");
  }

  const actualArgs: Record<string, string> = Object.fromEntries(
    argMap.map((arg) => [arg.key().sym().toString(), arg.val().str().toString()]),
  );

  for (const [key, expectedValue] of Object.entries(expectedArgs)) {
    const actualValue = actualArgs[key];
    if (actualValue === undefined) {
      throw new Error(`Missing expected arg: "${key}"`);
    }
    if (actualValue !== expectedValue) {
      throw new Error(
        `Value mismatch for "${key}": expected "${expectedValue}", got "${actualValue}"`,
      );
    }
  }
};

const buildWebAuthVerifyOp = ({
  signedEntries,
  webAuthContractId,
}: {
  signedEntries: xdr.SorobanAuthorizationEntry[];
  webAuthContractId: string;
}) => {
  const contract = new Contract(webAuthContractId);
  return contract.call(
    "web_auth_verify",
    ...signedEntries[0].rootInvocation().function().contractFn().args(),
  );
};

const simulateWebAuthVerifyOp = async ({
  networkPassphrase,
  operation,
}: {
  networkPassphrase: string;
  operation: xdr.Operation;
}) => {
  const rpcServer = createAuthenticatedRpcServer("wallet");
  const dummyAccount = new Account(Keypair.random().publicKey(), "0");
  const tx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();

  const simulatedTx = await rpcServer.simulateTransaction(tx);
  if (Api.isSimulationError(simulatedTx)) {
    throw new Error(simulatedTx.error);
  }

  return simulatedTx;
};

const verifyLedgerFootprint = ({
  contractAddress,
  serverSigningKey,
  transactionData,
}: {
  contractAddress: string;
  serverSigningKey: string;
  transactionData: SorobanDataBuilder;
}) => {
  const readWrite = transactionData.getReadWrite();
  if (!readWrite) {
    throw new Error("Simulation response missing read/write footprint");
  }

  const allowedLedgerAddresses = new Set([contractAddress, serverSigningKey]);

  for (const ledgerKey of readWrite) {
    const entryType = ledgerKey.switch().value;

    if (entryType === xdr.LedgerEntryType.contractCode().value) {
      // Allow contract code access for restoration/TTL extension
      continue;
    } else if (entryType !== xdr.LedgerEntryType.contractData().value) {
      throw new Error(`Unexpected ledger key type: ${ledgerKey.switch().name}`);
    }

    const contractData = ledgerKey.contractData();
    const ledgerAccount = Address.fromScAddress(contractData.contract()).toString();

    if (!allowedLedgerAddresses.has(ledgerAccount)) {
      throw new Error(`Unauthorized contract access: ${ledgerAccount}`);
    }

    const contractDataKeyType = contractData.key().switch().value;

    if (
      contractDataKeyType !== xdr.ScValType.scvLedgerKeyNonce().value &&
      contractDataKeyType !== xdr.ScValType.scvLedgerKeyContractInstance().value
    ) {
      throw new Error(`Invalid contract data access. Key: ${contractData.key().switch().name}`);
    }
  }
};

export const sign = async ({
  authEntries,
  contractAddress,
  credentialId,
  expectedArgs,
  serverSigningKey,
  webAuthContractId,
}: Sep45SignParams): Promise<string> => {
  const decodedEntries = xdr.SorobanAuthorizationEntries.fromXDR(authEntries, "base64");
  decodedEntries.forEach((entry) =>
    validateAuthorizationEntry(entry, expectedArgs, webAuthContractId),
  );

  const rpcServer = createAuthenticatedRpcServer("wallet");
  const network = await rpcServer.getNetwork();
  const networkPassphrase = network.passphrase;
  const signatureExpirationLedger = (await rpcServer.getLatestLedger()).sequence + 60;

  const signedEntries = await signSorobanAuthorizationEntries({
    authEntries: decodedEntries,
    contractAddress,
    credentialId,
    networkPassphrase,
    rpId: window.location.hostname,
    signatureExpirationLedger,
  });

  const operation = buildWebAuthVerifyOp({ webAuthContractId, signedEntries });
  operation.body().invokeHostFunctionOp().auth(signedEntries);

  const simulatedTx = await simulateWebAuthVerifyOp({ networkPassphrase, operation });
  verifyLedgerFootprint({
    contractAddress,
    serverSigningKey,
    transactionData: simulatedTx.transactionData,
  });

  const writer = new XdrWriter();
  xdr.SorobanAuthorizationEntries.write(signedEntries, writer);
  return writer.finalize().toString("base64");
};
