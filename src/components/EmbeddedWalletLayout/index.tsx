import { useEffect, type ReactNode } from "react";

import { MODAL_PARENT_ID } from "../EmbeddedWalletModal";

import "./styles.scss";

type EmbeddedWalletLayoutProps = {
  organizationName: string;
  organizationLogo?: string;
  headerRight?: ReactNode;
  showHeader?: boolean;
  contentAlign?: "center" | "left";
  children: ReactNode;
};

export const EmbeddedWalletLayout = ({
  children,
  organizationName,
  organizationLogo,
  headerRight,
  showHeader = true,
  contentAlign = "center",
}: EmbeddedWalletLayoutProps) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${organizationName} Wallet`;
    return () => {
      document.title = previousTitle;
    };
  }, [organizationName]);

  return (
    <div className="EmbeddedWalletLayout">
      {showHeader ? (
        <header className="EmbeddedWalletHeader">
          <div className="EmbeddedWalletHeader__brand">
            {organizationLogo ? (
              <img src={organizationLogo} alt={`${organizationName} logo`} />
            ) : (
              <span className="EmbeddedWalletBrand">{organizationName}</span>
            )}
          </div>
          {headerRight ? <div className="EmbeddedWalletHeader__title">{headerRight}</div> : null}
        </header>
      ) : null}

      <div className="EmbeddedWalletLayout__container">
        <div className="EmbeddedWalletLayout__cardWrapper">
          <div
            className={`EmbeddedWalletCard__content EmbeddedWalletCard__content--${contentAlign}`}
          >
            {children}
          </div>
        </div>
      </div>
      <div id={MODAL_PARENT_ID} className="EmbeddedWalletModalRoot" />
    </div>
  );
};
