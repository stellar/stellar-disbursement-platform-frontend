import React from "react";

import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";

import { Icon } from "@stellar/design-system";

import { ActiveWalletBar } from "@/components/ActiveWalletBar";
import { PageHeader } from "@/components/PageHeader";

import { USE_SSO } from "@/constants/envVariables";
import { Routes } from "@/constants/settings";

import { getAppVersion } from "@/helpers/getAppVersion";
import { localStorageSelectedWallet } from "@/helpers/localStorageSelectedWallet";
import { localStorageSessionToken } from "@/helpers/localStorageSessionToken";
import { singleUserStore } from "@/helpers/singleSingOn";

import { useRedux } from "@/hooks/useRedux";

import { UserRole } from "@/types";

import { AppDispatch, resetStoreAction } from "@/store";


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
    // Before the token: the selected-account key is derived from the signed-in user, so
    // clearing the token first would compute a different key and orphan the entry.
    localStorageSelectedWallet.remove();
    localStorageSessionToken.remove();
  };

  type NavItem = {
    id: string;
    label: string;
    route: string;
    icon: React.ReactNode;
    // Mirror each route's acceptedRoles (App.tsx) so members don't see nav links that
    // dead-end at the Unauthorized page. Omit to show for every authenticated role.
    acceptedRoles?: UserRole[];
  };

  const DISBURSEMENT_ROLES: UserRole[] = [
    "owner",
    "financial_controller",
    "business",
    "initiator",
    "approver",
  ];

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
      acceptedRoles: DISBURSEMENT_ROLES,
    },
    {
      id: "nav-receivers",
      label: "Receivers",
      route: Routes.RECEIVERS,
      icon: <Icon.Users02 />,
      acceptedRoles: DISBURSEMENT_ROLES,
    },
    {
      id: "nav-payments",
      label: "Payments",
      route: Routes.PAYMENTS,
      icon: <Icon.BankNote01 />,
      acceptedRoles: DISBURSEMENT_ROLES,
    },
    {
      id: "nav-wallet-providers",
      label: "Wallet Providers",
      route: Routes.WALLET_PROVIDERS,
      icon: <Icon.Wallet01 />,
    },
    {
      id: "nav-distribution-account",
      label: "Distribution Accounts",
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
      acceptedRoles: ["owner", "developer"],
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
      acceptedRoles: ["owner"],
    },
  ];

  // Hide nav links the current user can't open, so they don't dead-end at the Unauthorized page.
  const currentRole = userAccount.role;
  const canSee = (item: NavItem) =>
    !item.acceptedRoles || (currentRole && item.acceptedRoles.includes(currentRole));

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
            {ITEMS_TOP.filter(canSee).map((i) => (
              <NavItem key={i.id} item={i} />
            ))}
          </div>
          <div className="InnerPage__sidebar--bottom">
            {ITEMS_BOTTOM.filter(canSee).map((i) => (
              <NavItem key={i.id} item={i} />
            ))}

            <div className="Sidebar__item">v{getAppVersion()}</div>
          </div>
        </div>
        <div className="InnerPage__container">
          <div className={`InnerPage__content ${isNarrow ? "InnerPage__content--narrow" : ""}`}>
            <ActiveWalletBar />
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
