import { useCallback, useEffect, useMemo } from "react";

import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { Button, Heading, Notification } from "@stellar/design-system";

import { Box } from "@/components/Box";
import { EmbeddedWalletLayout } from "@/components/EmbeddedWalletLayout";
import { useEmbeddedWalletNotice } from "@/components/EmbeddedWalletNoticesProvider";

import { getOrgLogoAction } from "@/store/ducks/organization";
import { setWalletTokenAction } from "@/store/ducks/walletAccount";

import { Routes } from "@/constants/settings";

import { useCreateEmbeddedWallet } from "@/apiQueries/useCreateEmbeddedWallet";
import { usePasskeyAuthentication } from "@/apiQueries/usePasskeyAuthentication";
import { usePasskeyRefresh } from "@/apiQueries/usePasskeyRefresh";
import { usePasskeyRegistration } from "@/apiQueries/usePasskeyRegistration";


import { getSdpTenantName } from "@/helpers/getSdpTenantName";

import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";


const PASSKEY_ERROR_NOTICE_ID = "embedded-wallet-passkey-error";

export const EmbeddedWallet = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { walletAccount, organization } = useRedux("walletAccount", "organization");

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
      goHomeWithToken(result.token);
    } catch {
      // mutation handles error state
    }
  };

  const handleSignup = async () => {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      return;
    }

    resetAllErrors();

    try {
      const registration = await registerPasskey({ token: trimmedToken });

      await createWallet({
        token: trimmedToken,
        public_key: registration.public_key,
        credential_id: registration.credential_id,
      });

      const refreshed = await refreshToken({ token: registration.token });

      goHomeWithToken(refreshed.token);
    } catch {
      // mutation handles error state
    }
  };

  const passkeyError = authError || registerError || createWalletError || refreshError;

  const isSignupProcessing = isRegistering || isCreatingWallet || isRefreshing;
  const isLoading = isAuthenticating || isSignupProcessing;
  const inviteToken = token.trim();
  const hasInviteToken = Boolean(inviteToken);

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

  const title = hasInviteToken
    ? "You're invited to create your wallet account"
    : "Log in to wallet";
  const subtitle = hasInviteToken
    ? `Once your wallet is set up, you'll be able to receive funds sent by ${organizationName}. To begin, add a passkey to securely access your account.`
    : "Use your passkey to log in to wallet";

  const primaryCtaProps = hasInviteToken
    ? {
        onClick: handleSignup,
        disabled: isLoading || !inviteToken,
        isLoading: isSignupProcessing,
      }
    : {
        onClick: handleLogin,
        disabled: isLoading,
        isLoading: isAuthenticating,
      };

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
          {title}
        </Heading>
        <p className="EmbeddedWalletSubtitle">{subtitle}</p>
      </Box>

      <Box gap="md" align="center">
        <Button variant="primary" size="lg" isFullWidth {...primaryCtaProps}>
          Log in with passkey
        </Button>
      </Box>
    </EmbeddedWalletLayout>
  );
};
