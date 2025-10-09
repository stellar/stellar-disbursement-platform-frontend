import { Button, RadioButton, Modal } from "@stellar/design-system";
import { useState } from "react";

import { Box } from "@/components/Box";
import { NetworkType } from "@/constants/network";
import { Trustline } from "@/types";

import "./styles.scss";

type PresetAsset = {
  id: string;
  name: string;
  network: "mainnet" | "testnet" | "futurenet";
};

interface AddPresetAssetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (asset: { assetCode: string; assetIssuer: string }) => Promise<void>;
  trustlines?: Trustline[];
  networkType?: NetworkType | null;
  isLoading?: boolean;
}

const PRESET_ASSETS: PresetAsset[] = [
  // Testnet
  {
    id: "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    name: "USD Coin",
    network: "testnet",
  },
  {
    id: "EURC:GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    name: "EURC",
    network: "testnet",
  },
  // Mainnet
  {
    id: "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    name: "USD Coin",
    network: "mainnet",
  },
  {
    id: "EURC:GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
    name: "EURC",
    network: "mainnet",
  },
];

export const AddPresetAssetModal = ({
  isVisible,
  onClose,
  onSubmit,
  trustlines,
  networkType,
  isLoading = false,
}: AddPresetAssetModalProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const filteredAssets = networkType
    ? PRESET_ASSETS.filter((asset) => asset.network === networkType)
    : [];

  const isAssetAlreadyTrustline = (asset: PresetAsset) => {
    const [code, issuer] = asset.id.split(":");
    return (
      trustlines?.some((trustline) => trustline.code === code && trustline.issuer === issuer) ||
      false
    );
  };

  const handleClose = () => {
    setSelectedAsset(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedAsset) return;

    const [code, issuer] = selectedAsset.split(":");
    await onSubmit({
      assetCode: code,
      assetIssuer: issuer,
    });

    setSelectedAsset(null);
  };

  const hasSelectedAsset = selectedAsset !== null;

  return (
    <Modal visible={isVisible} onClose={handleClose}>
      <Modal.Heading>Add preset asset</Modal.Heading>
      <Modal.Body>
        {filteredAssets.map((asset) => {
          const isAlreadyTrustline = isAssetAlreadyTrustline(asset);
          const isDisabled = isLoading || isAlreadyTrustline;
          return (
            <Box
              key={`preset-asset-${asset.id}`}
              gap="sm"
              direction="row"
              align="center"
              data-is-disabled={isAlreadyTrustline}
              addlClassName="PresetAssetRow"
            >
              <RadioButton
                fieldSize="sm"
                id={asset.id}
                name="preset-asset"
                label={
                  <Box gap="xs" direction="column" addlClassName="PresetAssetRow__asset">
                    <div>
                      {asset.name} {isAlreadyTrustline ? "(Already added)" : ""}
                    </div>
                    <span title={asset.id}>{asset.id}</span>
                  </Box>
                }
                value={asset.id}
                checked={selectedAsset === asset.id}
                onChange={() => setSelectedAsset(asset.id)}
                disabled={isDisabled}
              />
            </Box>
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="md"
          variant="primary"
          onClick={handleSubmit}
          disabled={!hasSelectedAsset}
          isLoading={isLoading}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
