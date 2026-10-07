import { DistributionWallet } from "@/apiQueries/useDistributionWallets";

// Plain-text account name for places that can't render the label (<option>, string props).
export const distributionAccountDisplayName = (
  wallet: Pick<DistributionWallet, "name" | "is_default">,
) => (wallet.is_default ? `${wallet.name} (default)` : wallet.name);
