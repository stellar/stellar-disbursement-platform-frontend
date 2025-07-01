import { Icon } from "@stellar/design-system";

import "./styles.scss";

interface BridgePaymentMethodsProps {
  paymentRails: string[];
}

const formatPaymentMethodName = (rail: string): string => {
  switch (rail) {
    case "ach_push":
      return "ACH Push";
    case "wire":
      return "Wire Transfer";
    default:
      return rail;
  }
};

export const BridgePaymentMethods = ({
  paymentRails,
}: BridgePaymentMethodsProps) => {
  return (
    <div className="BridgePaymentMethods">
      <label className="Label Label--sm">Supported Payment Methods</label>
      <div className="BridgePaymentMethods__list">
        {paymentRails.map((rail) => (
          <div key={rail} className="BridgePaymentMethods__item">
            <Icon.CheckCircle className="BridgePaymentMethods__icon" />
            <span>{formatPaymentMethodName(rail)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
