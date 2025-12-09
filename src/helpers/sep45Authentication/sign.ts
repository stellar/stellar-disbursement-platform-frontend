import * as xdrParser from "@stellar/js-xdr";
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

type Sep45SigntParams = {
  authEntries: string;
  contractAddress: string;
  credentialId?: string;
  serverSigningKey: string;
  webAuthContractId: string;
};

const decodeAuthorizationEntries = (base64: string) => {
  try {
    const buffer = Buffer.from(base64, "base64");
    const authEntriesType = new xdrParser.VarArray(xdr.SorobanAuthorizationEntry, 3);
    const reader = new xdrParser.XdrReader(buffer);
    return authEntriesType.read(reader);
  } catch (err) {
    throw new Error(`Invalid SorobanAuthorizationEntry data: ${err}`);
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

  const allowedContracts = new Set([contractAddress, serverSigningKey]);

  for (const ledgerKey of readWrite) {
    const entryType = ledgerKey.switch().value;

    if (entryType === xdr.LedgerEntryType.contractCode().value) {
      // Allow contract code access for restoration/TTL extension
      continue;
    } else if (entryType !== xdr.LedgerEntryType.contractData().value) {
      throw new Error(`Unexpected ledger key type: ${ledgerKey.switch().name}`);
    }

    const contractData = ledgerKey.contractData();
    const contractAddress = Address.fromScAddress(contractData.contract()).toString();

    if (!allowedContracts.has(contractAddress)) {
      throw new Error(`Unauthorized contract access: ${contractAddress}`);
    }

    if (
      contractData.key().switch().value !== xdr.ScValType.scvLedgerKeyNonce().value &&
      contractData.key().switch().value !== xdr.ScValType.scvLedgerKeyContractInstance().value
    ) {
      throw new Error(`Invalid contract data access. Key: ${contractData.key().switch().name}`);
    }
  }
};

const encodeAuthorizationEntries = (entries: xdr.SorobanAuthorizationEntry[]) => {
  try {
    const authEntriesType = new xdrParser.VarArray(xdr.SorobanAuthorizationEntry, 3);
    const writer = new xdrParser.XdrWriter();
    authEntriesType.write(entries, writer);
    const buffer = writer.finalize();
    return buffer.toString("base64");
  } catch (err) {
    throw new Error(`Failed to encode SorobanAuthorizationEntry array: ${err}`);
  }
};

export const sign = async ({
  authEntries,
  contractAddress,
  credentialId,
  serverSigningKey,
  webAuthContractId,
}: Sep45SigntParams): Promise<string> => {
  const decodedEntries = decodeAuthorizationEntries(authEntries);

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

  return encodeAuthorizationEntries(signedEntries);
};
