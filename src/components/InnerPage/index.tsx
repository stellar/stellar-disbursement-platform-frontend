import React from "react";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { Icon } from "@stellar/design-system";

import { PageHeader } from "components/PageHeader";
import { USE_SSO } from "constants/envVariables";
import { Routes } from "constants/settings";
import { AppDispatch, resetStoreAction } from "store";
import { useRedux } from "hooks/useRedux";
import { singleUserStore } from "helpers/singleSingOn";
import { getAppVersion } from "helpers/getAppVersion";
import { localStorageSessionToken } from "helpers/localStorageSessionToken";

import "./styles.scss";

interface InnerPageProps {
  children: React.ReactElement;
  isNarrow?: boolean;
  // Used in Sign in, Forgot password, and similar pages
  isCardLayout?: boolean;
}

export const InnerPage = ({ children, isNarrow, isCardLayout }: InnerPageProps) => {
  const { userAccount, organization, profile } = useRedux("userAccount", "organization", "profile");
  const dispatch: AppDispatch = useDispatch();

  const handleSignOut = () => {
    if (USE_SSO) {
      // reset user store (from session storage)
      singleUserStore().then();
    }
    dispatch(resetStoreAction());
    localStorageSessionToken.remove();
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
      icon: <Icon.Home02 />,
    },
    {
      id: "nav-disbursements",
      label: "Disbursements",
      route: Routes.DISBURSEMENTS,
      icon: <Icon.Inbox01 />,
    },
    {
      id: "nav-receivers",
      label: "Receivers",
      route: Routes.RECEIVERS,
      icon: <Icon.Users02 />,
    },
    {
      id: "nav-payments",
      label: "Payments",
      route: Routes.PAYMENTS,
      icon: <Icon.BankNote01 />,
    },
    {
      id: "nav-wallet-providers",
      label: "Wallet Providers",
      route: Routes.WALLET_PROVIDERS,
      icon: <Icon.Wallet01 />,
    },
    {
      id: "nav-distribution-account",
      label: "Distribution Account",
      route: Routes.DISTRIBUTION_ACCOUNT,
      icon: <Icon.Dataflow01 />,
    },
    {
      id: "nav-analytics",
      label: "Analytics",
      route: Routes.ANALYTICS,
      icon: <Icon.LineChartUp01 />,
    },
  ];

  const ITEMS_BOTTOM: NavItem[] = [
    {
      id: "nav-api-keys",
      label: "API Keys",
      route: Routes.API_KEYS,
      icon: <Icon.Key01 />,
    },
    {
      id: "nav-profile",
      label: "Profile",
      route: Routes.PROFILE,
      icon: <Icon.UserCircle />,
    },
    {
      id: "nav-settings",
      label: "Settings",
      route: Routes.SETTINGS,
      icon: <Icon.Settings01 />,
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
        return `${profile.data.firstName} ${profile.data.lastName.charAt(0).toUpperCase()}.`;
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
            <div className="InnerPage__content InnerPage--cardLayout">{children}</div>
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
          <div className={`InnerPage__content ${isNarrow ? "InnerPage__content--narrow" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
