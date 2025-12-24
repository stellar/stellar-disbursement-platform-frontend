import { Card, Icon, IconButton } from "@stellar/design-system";
import { useEffect, type ReactNode } from "react";

import { MODAL_PARENT_ID } from "../EmbeddedWalletModal";

import "./styles.scss";

export type EmbeddedWalletNotice = {
  id: string;
  content: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
};

type EmbeddedWalletLayoutProps = {
  organizationName: string;
  organizationLogo?: string;
  headerRight?: ReactNode;
  showHeader?: boolean;
  contentAlign?: "center" | "left";
  topNotices?: EmbeddedWalletNotice[];
  children: ReactNode;
};

export const EmbeddedWalletLayout = ({
  children,
  organizationName,
  organizationLogo,
  headerRight,
  showHeader = true,
  contentAlign = "center",
  topNotices = [],
}: EmbeddedWalletLayoutProps) => {
  const notices = topNotices.filter((notice) => Boolean(notice?.content));

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
          {notices.length ? (
            <div className="EmbeddedWalletLayout__notices">
              {notices.map((notice) => {
                const noticeClasses = [
                  "EmbeddedWalletLayout__noticeItem",
                  notice.onDismiss ? "EmbeddedWalletLayout__noticeItem--dismissible" : null,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div className={noticeClasses} key={notice.id}>
                    {notice.onDismiss ? (
                      <div className="EmbeddedWalletLayout__noticeDismiss">
                        <IconButton
                          type="button"
                          icon={<Icon.XClose />}
                          altText={notice.dismissLabel ?? "Dismiss notification"}
                          onClick={notice.onDismiss}
                        />
                      </div>
                    ) : null}
                    {notice.content}
                  </div>
                );
              })}
            </div>
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
