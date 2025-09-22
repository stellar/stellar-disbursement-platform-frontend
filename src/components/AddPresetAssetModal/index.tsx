import { useState } from "react";
import { Button, Checkbox, Modal } from "@stellar/design-system";

import { Trustline } from "@/apiQueries/useBalanceTrustline";
import { getNetworkType } from "@/constants/envVariables";

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
    id: "EURC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    name: "Euro Coin",
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
    name: "Euro Coin",
    network: "mainnet",
  },
];

export const AddPresetAssetModal = ({
  isVisible,
  onClose,
  onSubmit,
  trustlines,
  isLoading = false,
}: AddPresetAssetModalProps) => {
  const [checkedAssets, setCheckedAssets] = useState<{ [key: string]: boolean }>({});

  const currentNetwork = getNetworkType();
  const filteredAssets = PRESET_ASSETS.filter((asset) => asset.network === currentNetwork);

  const isAssetAlreadyTrustline = (asset: PresetAsset) => {
    const [code, issuer] = asset.id.split(":");
    return (
      trustlines?.some((trustline) => trustline.code === code && trustline.issuer === issuer) ||
      false
    );
  };

  const handleAssetToggle = (assetId: string) => {
    setCheckedAssets((prev) => ({
      ...prev,
      [assetId]: !prev[assetId],
    }));
  };

  const handleClose = () => {
    setCheckedAssets({});
    onClose();
  };

  const handleSubmit = async () => {
    // Add each selected asset as a trustline
    for (const assetId of Object.keys(checkedAssets)) {
      if (checkedAssets[assetId]) {
        const [code, issuer] = assetId.split(":");
        await onSubmit({
          assetCode: code,
          assetIssuer: issuer,
        });
      }
    }

    setCheckedAssets({});
  };

  const hasSelectedAssets = Object.values(checkedAssets).some(Boolean);

  return (
    <Modal visible={isVisible} onClose={handleClose}>
      <Modal.Heading>Add preset asset</Modal.Heading>
      <Modal.Body>
        {filteredAssets.map((asset) => {
          const isAlreadyTrustline = isAssetAlreadyTrustline(asset);
          const isDisabled = isLoading || isAlreadyTrustline;
          return (
            <div
              key={`preset-asset-${asset.id}`}
              className={`PresetAssetRow ${isAlreadyTrustline ? "PresetAssetRow--disabled" : ""}`}
              onClick={() => !isDisabled && handleAssetToggle(asset.id)}
            >
              <Checkbox
                fieldSize="sm"
                id={asset.id}
                label=""
                checked={Boolean(checkedAssets[asset.id])}
                onChange={() => handleAssetToggle(asset.id)}
                disabled={isDisabled}
              />
              <div className="PresetAssetRow__asset">
                <div className="PresetAssetRow__asset__info">
                  <div>
                    {asset.name} {isAlreadyTrustline ? "(Already added)" : ""}
                  </div>
                  <span title={asset.id}>{asset.id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="md"
          variant="primary"
          onClick={handleSubmit}
          disabled={!hasSelectedAssets}
          isLoading={isLoading}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
