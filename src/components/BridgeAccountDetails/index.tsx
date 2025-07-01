import { CopyWithIcon } from "components/CopyWithIcon";
import { BridgeIntegration } from "types";

import "./styles.scss";

interface BridgeAccountDetailsProps {
  virtualAccount: BridgeIntegration["virtual_account"];
}

export const BridgeAccountDetails = ({
  virtualAccount,
}: BridgeAccountDetailsProps) => {
  if (!virtualAccount) {
    return null;
  }

  const { source_deposit_instructions } = virtualAccount;

  return (
    <div className="BridgeAccountDetails">
      <div className="BridgeAccountDetails__field">
        <label className="Label Label--sm">Account Holder</label>
        <div className="BridgeAccountDetails__value">
          <CopyWithIcon
            textToCopy={source_deposit_instructions.bank_beneficiary_name}
            iconSizeRem="1"
            doneLabel="Copied!"
          >
            <span className="BridgeAccountDetails__copyableText">
              {source_deposit_instructions.bank_beneficiary_name}
            </span>
          </CopyWithIcon>
        </div>
      </div>

      <div className="BridgeAccountDetails__field">
        <label className="Label Label--sm">Bank Name and Address</label>
        <div className="BridgeAccountDetails__value">
          <CopyWithIcon
            textToCopy={`${source_deposit_instructions.bank_name}\n${source_deposit_instructions.bank_address}`}
            iconSizeRem="1"
            doneLabel="Copied!"
          >
            <div className="BridgeAccountDetails__copyableText">
              <div>{source_deposit_instructions.bank_name}</div>
              <div className="BridgeAccountDetails__bankAddress">
                {source_deposit_instructions.bank_address}
              </div>
            </div>
          </CopyWithIcon>
        </div>
      </div>

      <div className="BridgeAccountDetails__field">
        <label className="Label Label--sm">Routing Number</label>
        <div className="BridgeAccountDetails__value">
          <CopyWithIcon
            textToCopy={source_deposit_instructions.bank_routing_number}
            iconSizeRem="1"
            doneLabel="Copied!"
          >
            <span className="BridgeAccountDetails__copyableText">
              {source_deposit_instructions.bank_routing_number}
            </span>
          </CopyWithIcon>
        </div>
      </div>

      <div className="BridgeAccountDetails__field">
        <label className="Label Label--sm">Account Number</label>
        <div className="BridgeAccountDetails__value">
          <CopyWithIcon
            textToCopy={source_deposit_instructions.bank_account_number}
            iconSizeRem="1"
            doneLabel="Copied!"
          >
            <span className="BridgeAccountDetails__copyableText">
              {source_deposit_instructions.bank_account_number}
            </span>
          </CopyWithIcon>
        </div>
      </div>

      <div className="BridgeAccountDetails__field">
        <label className="Label Label--sm">Currency</label>
        <div className="BridgeAccountDetails__value">
          <span>{source_deposit_instructions.currency.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
