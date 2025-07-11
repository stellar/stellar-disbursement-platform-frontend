import { CopyWithIcon } from "components/CopyWithIcon";

import { BridgeIntegration } from "types";

import "./styles.scss";

interface BridgeAccountDetailsProps {
  virtualAccount: BridgeIntegration["virtual_account"];
}

const CopyValItem = ({ value }: { value: string | number }) => (
  <CopyWithIcon textToCopy={String(value)} iconSizeRem="0.875" doneLabel="Copied!">
    <span className="BridgeAccountDetails__value">{value}</span>
  </CopyWithIcon>
);

export const BridgeAccountDetails = ({ virtualAccount }: BridgeAccountDetailsProps) => {
  if (!virtualAccount) {
    return null;
  }

  const { source_deposit_instructions } = virtualAccount;

  return (
    <div className="BridgeAccountDetails">
      <div className="BridgeAccountDetails__container">
        <div className="BridgeAccountDetails__column">
          <div className="BridgeAccountDetails__field">
            <div className="BridgeAccountDetails__label">Bank name</div>
            <div className="BridgeAccountDetails__value">
              {source_deposit_instructions.bank_name}
            </div>
            {source_deposit_instructions.bank_address && (
              <div className="BridgeAccountDetails__address">
                {source_deposit_instructions.bank_address}
              </div>
            )}
          </div>

          <div className="BridgeAccountDetails__field">
            <div className="BridgeAccountDetails__label">Account holder</div>
            <div className="BridgeAccountDetails__value">
              {source_deposit_instructions.bank_beneficiary_name}
            </div>
          </div>

          <div className="BridgeAccountDetails__field">
            <div className="BridgeAccountDetails__label">Currency</div>
            <div className="BridgeAccountDetails__value">
              {source_deposit_instructions.currency.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="BridgeAccountDetails__column">
          <div className="BridgeAccountDetails__field">
            <div className="BridgeAccountDetails__label">Account number</div>
            <CopyValItem value={source_deposit_instructions.bank_account_number} />
          </div>

          <div className="BridgeAccountDetails__field">
            <div className="BridgeAccountDetails__label">Routing number</div>
            <CopyValItem value={source_deposit_instructions.bank_routing_number} />
          </div>
        </div>
      </div>
    </div>
  );
};
