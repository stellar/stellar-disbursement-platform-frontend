import React from "react";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { Icon } from "@stellar/design-system";

import { PageHeader } from "components/PageHeader";
import {
  LOCAL_STORAGE_SESSION_TOKEN,
  Routes,
  USE_SSO,
} from "constants/settings";
import { AppDispatch, resetStoreAction } from "store";
import { useRedux } from "hooks/useRedux";
import { singleUserStore } from "helpers/singleSingOn";
import { getAppVersion } from "helpers/getAppVersion";

import "./styles.scss";

interface InnerPageProps {
  children: React.ReactElement;
  isNarrow?: boolean;
  // Used in Sign in, Forgot password, and similar pages
  isCardLayout?: boolean;
}

export const InnerPage = ({
  children,
  isNarrow,
  isCardLayout,
}: InnerPageProps) => {
  const { userAccount, organization, profile } = useRedux(
    "userAccount",
    "organization",
    "profile",
  );
  const dispatch: AppDispatch = useDispatch();

  const handleSignOut = () => {
    if (USE_SSO) {
      // reset user store (from session storage)
      singleUserStore().then();
    }
    dispatch(resetStoreAction());
    localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN);
  };

  type NavItem = {
    id: string;
    label: string;
    route: string;
    icon: React.ReactNode;
  };

  const ITEMS_TOP: NavItem[] = [
    {
      id: "nav-home",
      label: "Home",
      route: Routes.HOME,
      icon: <Icon.Home />,
    },
    {
      id: "nav-disbursements",
      label: "Disbursements",
      route: Routes.DISBURSEMENTS,
      icon: <Icon.AllInbox />,
    },
    {
      id: "nav-receivers",
      label: "Receivers",
      route: Routes.RECEIVERS,
      icon: <Icon.Users />,
    },
    {
      id: "nav-payments",
      label: "Payments",
      route: Routes.PAYMENTS,
      icon: <Icon.Payments />,
    },
    {
      id: "nav-wallets",
      label: "Wallets",
      route: Routes.WALLETS,
      icon: <Icon.Wallet />,
    },
    {
      id: "nav-analytics",
      label: "Analytics",
      route: Routes.ANALYTICS,
      icon: <Icon.Insights />,
    },
  ];

  const ITEMS_BOTTOM: NavItem[] = [
    {
      id: "nav-profile",
      label: "Profile",
      route: Routes.PROFILE,
      icon: <Icon.AccountCircle />,
    },
    {
      id: "nav-settings",
      label: "Settings",
      route: Routes.SETTINGS,
      icon: <Icon.Settings />,
    },
  ];

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => {
    return ["Sidebar__navItem", isActive ? "Sidebar__navItem--current" : null]
      .filter(Boolean)
      .join(" ");
  };

  const NavItem = ({ item }: { item: NavItem }) => (
    <NavLink key={item.id} to={item.route} className={navLinkStyle}>
      <span className="Sidebar__navItem__icon">{item.icon}</span>
      {item.label}
    </NavLink>
  );

  const userNameText = () => {
    if (profile.data.firstName) {
      if (profile.data.lastName) {
        return `${profile.data.firstName} ${profile.data.lastName
          .charAt(0)
          .toUpperCase()}.`;
      }

      return profile.data.firstName;
    }

    return profile.data.email;
  };

  if (isCardLayout) {
    return (
      <>
        <PageHeader />
        <div className="InnerPage">
          <div className="InnerPage__container">
            <div className="InnerPage__content InnerPage--cardLayout">
              {children}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        username={userNameText()}
        onSignOut={userAccount.isAuthenticated ? handleSignOut : undefined}
        logoImage={organization.data.logo}
        companyName={organization.data.name}
      />
      <div className="InnerPage">
        <div className="InnerPage__sidebar">
          <div className="InnerPage__sidebar--top">
            {ITEMS_TOP.map((i) => (
              <NavItem key={i.id} item={i} />
            ))}
          </div>
          <div className="InnerPage__sidebar--bottom">
            {ITEMS_BOTTOM.map((i) => (
              <NavItem key={i.id} item={i} />
            ))}

            <div className="Sidebar__item">v{getAppVersion()}</div>
          </div>
        </div>
        <div className="InnerPage__container">
          <div
            className={`InnerPage__content ${
              isNarrow ? "InnerPage__content--narrow" : ""
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
