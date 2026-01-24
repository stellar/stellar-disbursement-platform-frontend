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
  const noticeItems = notices
    .map((notice) => (notice.node ? <Fragment key={notice.id}>{notice.node}</Fragment> : null))
    .filter(Boolean);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${organizationName} Wallet`;
    return () => {
      document.title = previousTitle;
    };
  }, [organizationName]);

  useEffect(() => {
    if (!organizationLogo) {
      return;
    }

    const iconLinks = Array.from(
      document.querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']"),
    );

    if (!iconLinks.length) {
      return;
    }

    const previousIcons = iconLinks.map((link) => ({
      link,
      href: link.getAttribute("href"),
      type: link.getAttribute("type"),
    }));

    iconLinks.forEach((link) => {
      link.setAttribute("href", organizationLogo);
      link.removeAttribute("type");
    });

    return () => {
      previousIcons.forEach(({ link, href, type }) => {
        if (href) {
          link.setAttribute("href", href);
        } else {
          link.removeAttribute("href");
        }

        if (type) {
          link.setAttribute("type", type);
        } else {
          link.removeAttribute("type");
        }
      });
    };
  }, [organizationLogo]);

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
