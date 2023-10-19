import { AssetAmount } from "components/AssetAmount";
import { DropdownMenu } from "components/DropdownMenu";
import { AmountReceived } from "types";
import "./styles.scss";

export const MultipleAmounts = ({
  amounts,
}: {
  amounts?: AmountReceived[];
}) => {
  if (!amounts || amounts.length === 0) {
    return <>{"-"}</>;
  }

  if (amounts.length === 1) {
    return (
      <AssetAmount
        amount={amounts[0].amount}
        assetCode={amounts[0].assetCode}
      />
    );
  }

  const firstItem = amounts[0];
  const remainingItems = amounts.slice(1);

  return (
    <div className="MultipleAmounts">
      <DropdownMenu
        triggerEl={
          <div className="MultipleAmounts__count">+{remainingItems.length}</div>
        }
      >
        <div className="MultipleAmounts__container">
          {remainingItems.map((i) => (
            <div className="MultipleAmounts__amount">
              <AssetAmount amount={i.amount} assetCode={i.assetCode} />
            </div>
          ))}
        </div>
      </DropdownMenu>
      <AssetAmount amount={firstItem.amount} assetCode={firstItem.assetCode} />
    </div>
  );
};
