export type NetworkType = "testnet" | "mainnet" | "futurenet";

export const STELLAR_NETWORKS = {
  PUBLIC: "Public Global Stellar Network ; September 2015",
  TESTNET: "Test SDF Network ; September 2015",
  FUTURENET: "Test SDF Future Network ; October 2022",
} as const;

export const getNetworkTypeFromPassphrase = (networkPassphrase: string): NetworkType | null => {
  switch (networkPassphrase) {
    case STELLAR_NETWORKS.PUBLIC:
      return "mainnet";
    case STELLAR_NETWORKS.TESTNET:
      return "testnet";
    case STELLAR_NETWORKS.FUTURENET:
      return "futurenet";
    default:
      return null;
  }
};
