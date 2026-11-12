import { useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { Button, Heading, Icon, Notification } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { EmbeddedWalletLayout } from "@/components/EmbeddedWalletLayout";
import { useEmbeddedWalletNotice } from "@/components/EmbeddedWalletNoticesProvider";

import { getOrgLogoAction } from "@/store/ducks/organization";
import { setWalletTokenAction } from "@/store/ducks/walletAccount";

import { Routes } from "@/constants/settings";

import type { PasskeyRegistrationFinishResponse } from "@/api/passkeyRegistration";

import { useCreateEmbeddedWallet } from "@/apiQueries/useCreateEmbeddedWallet";
import { usePasskeyAuthentication } from "@/apiQueries/usePasskeyAuthentication";
import { usePasskeyRefresh } from "@/apiQueries/usePasskeyRefresh";
import { usePasskeyRegistration } from "@/apiQueries/usePasskeyRegistration";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { localStorageWalletNotices } from "@/helpers/localStorageWalletNotices";

import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";

const PASSKEY_ERROR_NOTICE_ID = "embedded-wallet-passkey-error";

export const EmbeddedWallet = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { walletAccount, organization } = useRedux("walletAccount", "organization");
  const [deviceBoundRegistration, setDeviceBoundRegistration] =
    useState<PasskeyRegistrationFinishResponse | null>(null);

  const {
    mutateAsync: authenticatePasskey,
    isPending: isAuthenticating,
    error: authError,
    reset: resetAuthError,
  } = usePasskeyAuthentication();

  const {
    mutateAsync: registerPasskey,
    isPending: isRegistering,
    error: registerError,
    reset: resetRegisterError,
  } = usePasskeyRegistration();

  const {
    mutateAsync: createWallet,
    isPending: isCreatingWallet,
    error: createWalletError,
    reset: resetCreateWalletError,
  } = useCreateEmbeddedWallet();

  const {
    mutateAsync: refreshToken,
    isPending: isRefreshing,
    error: refreshError,
    reset: resetRefreshError,
  } = usePasskeyRefresh();

  const resetAllErrors = useCallback(() => {
    resetAuthError();
    resetRefreshError();
    resetRegisterError();
    resetCreateWalletError();
  }, [resetAuthError, resetCreateWalletError, resetRefreshError, resetRegisterError]);

  const goHomeWithToken = useCallback(
    (walletToken: string) => {
      dispatch(setWalletTokenAction(walletToken));
      navigate(Routes.WALLET_HOME);
    },
    [dispatch, navigate],
  );

  const token = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("token") ?? "";
  }, [location.search]);

  useEffect(() => {
    if (!organization?.data?.logo) {
      dispatch(getOrgLogoAction());
    }
  }, [dispatch, organization.data.logo]);

  useEffect(() => {
    if (
      walletAccount.isAuthenticated &&
      walletAccount.contractAddress &&
      !walletAccount.isSessionExpired
    ) {
      navigate(Routes.WALLET_HOME, { replace: true });
    }
  }, [
    navigate,
    walletAccount.isAuthenticated,
    walletAccount.contractAddress,
    walletAccount.isSessionExpired,
  ]);

  const handleLogin = async () => {
    resetAllErrors();

    try {
      const result = await authenticatePasskey();
      localStorageWalletNotices.set(result.credential_id, {
        passkeyNotBackupEligible: result.backup_eligible === false,
      });
      goHomeWithToken(result.token);
    } catch {
      // mutation handles error state
    }
  };

  const completeSignup = async (registration: PasskeyRegistrationFinishResponse) => {
    await createWallet({
      token: token.trim(),
      public_key: registration.public_key,
      credential_id: registration.credential_id,
    });

    const refreshed = await refreshToken({ token: registration.token });

    goHomeWithToken(refreshed.token);
  };

  const handleSignup = async () => {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      return;
    }

    resetAllErrors();

    try {
      const registration = await registerPasskey({ token: trimmedToken });

      if (registration.backup_eligible === false) {
        setDeviceBoundRegistration(registration);
        return;
      }

      setDeviceBoundRegistration(null);
      await completeSignup(registration);
    } catch {
      // mutation handles error state
    }
  };

  const handleContinueSignup = async () => {
    if (!deviceBoundRegistration) {
      return;
    }

    resetAllErrors();

    try {
      await completeSignup(deviceBoundRegistration);
    } catch {
      // mutation handles error state
    }
  };

  const passkeyError = authError || registerError || createWalletError || refreshError;

  const isSignupProcessing = isRegistering || isCreatingWallet || isRefreshing;
  const isLoading = isAuthenticating || isSignupProcessing;
  const inviteToken = token.trim();
  const hasInviteToken = Boolean(inviteToken);
  const mode = hasInviteToken ? (deviceBoundRegistration ? "passkeyChoice" : "signup") : "login";

  const organizationName = useMemo(() => {
    if (organization?.data?.name) {
      return organization.data.name;
    }
    const tenantName = getSdpTenantName();
    return tenantName || "Your organization";
  }, [organization?.data?.name]);

  const organizationInitial = useMemo(() => {
    const first = organizationName.match(/[A-Za-z0-9]/);
    return (first ? first[0] : "O").toUpperCase();
  }, [organizationName]);

  const organizationLogo = organization?.data?.logo;

  const content = {
    login: {
      title: "Log in to wallet",
      subtitle: "Use your passkey to log in to wallet",
      cta: "Log in with passkey",
      ctaProps: { onClick: handleLogin, disabled: isLoading, isLoading: isAuthenticating },
      secondaryCta: undefined,
    },
    signup: {
      title: "You're invited to create your wallet account",
      subtitle: `Once your wallet is set up, you'll be able to receive funds sent by ${organizationName}. To begin, add a passkey to securely access your account.`,
      cta: "Log in with passkey",
      ctaProps: { onClick: handleSignup, disabled: isLoading, isLoading: isSignupProcessing },
      secondaryCta: undefined,
    },
    passkeyChoice: {
      title: "This passkey only works on this device.",
      subtitle:
        "This passkey is not backup-eligible. If you lose this device you lose access to this wallet.",
      cta: "Continue with this passkey",
      ctaProps: {
        onClick: handleContinueSignup,
        disabled: isLoading,
        isLoading: isCreatingWallet || isRefreshing,
      },
      secondaryCta: {
        label: "Use a different passkey",
        ctaProps: { onClick: handleSignup, disabled: isLoading, isLoading: isRegistering },
      },
    },
  };
  const { title, subtitle, cta, ctaProps, secondaryCta } = content[mode];

  const passkeyErrorNotice = useMemo(() => {
    if (!passkeyError) {
      return null;
    }

    return (
      <div className="EmbeddedWalletLayout__noticeItem">
        <Notification variant="error" title="Couldn't log you in" isFilled role="alert">
          Please try again with your passkey.
        </Notification>
      </div>
    );
  }, [passkeyError]);

  useEmbeddedWalletNotice(PASSKEY_ERROR_NOTICE_ID, passkeyErrorNotice);

  // Hide login UI while restoring or already authenticated to prevent flashing.
  const shouldHideLoginUI =
    walletAccount.isRestoringSession ||
    (walletAccount.isAuthenticated &&
      Boolean(walletAccount.contractAddress) &&
      !walletAccount.isSessionExpired);

  if (shouldHideLoginUI) {
    return null;
  }

  return (
    <EmbeddedWalletLayout
      organizationName={organizationName}
      organizationLogo={organizationLogo}
      headerRight={hasInviteToken ? "Create an account" : undefined}
      showHeader={hasInviteToken}
      contentAlign={hasInviteToken ? "left" : "center"}
    >
      {!hasInviteToken ? (
        <div className="EmbeddedWalletCard__logo">
          {organizationLogo ? (
            <img src={organizationLogo} alt={`${organizationName} logo`} />
          ) : (
            organizationInitial
          )}
        </div>
      ) : null}

      <Box
        gap="xs"
        align={hasInviteToken ? "start" : "center"}
        addlClassName={
          hasInviteToken ? "EmbeddedWalletText EmbeddedWalletText--left" : "EmbeddedWalletText"
        }
      >
        <Heading size="xs" as="h1">
          {mode === "passkeyChoice" ? (
            <span className="EmbeddedWalletCard__warningTitle">
              <span className="EmbeddedWalletCard__warningIcon">
                <Icon.AlertCircle />
              </span>
              <span>{title}</span>
            </span>
          ) : (
            title
          )}
        </Heading>
        <p className="EmbeddedWalletSubtitle">{subtitle}</p>
      </Box>

      <Box gap="md" align="center">
        <Button variant="primary" size="lg" isFullWidth {...ctaProps}>
          {cta}
        </Button>
        {secondaryCta ? (
          <Button variant="tertiary" size="lg" isFullWidth {...secondaryCta.ctaProps}>
            {secondaryCta.label}
          </Button>
        ) : (
          <></>
        )}
      </Box>
    </EmbeddedWalletLayout>
  );
};
