import { Fragment, useEffect, type ReactNode } from "react";

import { Card } from "@stellar/design-system";

import { useEmbeddedWalletNotices } from "@/components/EmbeddedWalletNoticesProvider";

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
  const { notices } = useEmbeddedWalletNotices();
  const noticeItems = notices.map((notice) => <Fragment key={notice.id}>{notice.node}</Fragment>);

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
        <div className="EmbeddedWalletLayout__stack">
          {noticeItems.length ? (
            <div className="EmbeddedWalletLayout__notices">{noticeItems}</div>
          ) : null}
          <div className="EmbeddedWalletLayout__cardWrapper">
            <Card borderRadiusSize="md" noPadding>
              <div
                className={`EmbeddedWalletCard__content EmbeddedWalletCard__content--${contentAlign}`}
              >
                {children}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div id={MODAL_PARENT_ID} className="EmbeddedWalletModalRoot" />
    </div>
  );
};
