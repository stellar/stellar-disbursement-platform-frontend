import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";

import { ApiKeyDetails } from "@/components/ApiKeyDetails/ApiKeyDetails";
import { GlobalBanner } from "@/components/GlobalBanner";
import { InnerPage } from "@/components/InnerPage";
import { PrivateRoute } from "@/components/PrivateRoute";
import { SessionTokenRefresher } from "@/components/SessionTokenRefresher";
import { UserSession } from "@/components/UserSession";
import { Routes } from "@/constants/settings";
import GitInfo from "@/generated/gitInfo";
import { Analytics } from "@/pages/Analytics";
import { ApiKeys } from "@/pages/ApiKeys";
import { DisbursementDetails } from "@/pages/DisbursementDetails";
import { DisbursementDraftDetails } from "@/pages/DisbursementDraftDetails";
import { Disbursements } from "@/pages/Disbursements";
import { DisbursementsDrafts } from "@/pages/DisbursementsDrafts";
import { DisbursementsNew } from "@/pages/DisbursementsNew";
import { DistributionAccount } from "@/pages/DistributionAccount";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { Help } from "@/pages/Help";
import { Home } from "@/pages/Home";
import { MFAuth } from "@/pages/MFAuth";
import { NotFound } from "@/pages/NotFound";
import { PaymentDetails } from "@/pages/PaymentDetails";
import { Payments } from "@/pages/Payments";
import { Profile } from "@/pages/Profile";
import { ReceiverDetails } from "@/pages/ReceiverDetails";
import { ReceiverDetailsEdit } from "@/pages/ReceiverDetailsEdit";
import { Receivers } from "@/pages/Receivers";
import { SigninOidc } from "@/pages/Redirect";
import { ResetPassword } from "@/pages/ResetPassword";
import { SetNewPassword } from "@/pages/SetNewPassword";
import { Settings } from "@/pages/Settings";
import { SignIn } from "@/pages/SignIn";
import { Unauthorized } from "@/pages/Unauthorized";
import { WalletProviders } from "@/pages/WalletProviders";
import { store } from "@/store";

import "@/styles/styles.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App = () => {
  useEffect(() => {
    // Git commit hash
    console.log("current commit hash: ", GitInfo.commitHash);
    console.log("version: ", GitInfo.version);
  }, []);

  return (
    <Provider store={store}>
      <SessionTokenRefresher />
      <QueryClientProvider client={queryClient}>
        <UserSession />
        <BrowserRouter>
          <GlobalBanner />
          <RouterRoutes>
            {/* Sign in */}
            <Route
              path="/"
              element={
                <InnerPage isCardLayout>
                  <SignIn />
                </InnerPage>
              }
            />
            {/* Forgot password */}
            <Route
              path={Routes.FORGOT_PASSWORD}
              element={
                <InnerPage isCardLayout>
                  <ForgotPassword />
                </InnerPage>
              }
            />
            {/* Reset password */}
            <Route
              path={Routes.RESET_PASSWORD}
              element={
                <InnerPage isCardLayout>
                  <ResetPassword />
                </InnerPage>
              }
            />
            {/* Reset password (authenticated user) */}
            <Route
              path={Routes.SET_NEW_PASSWORD}
              element={
                <InnerPage isCardLayout>
                  <SetNewPassword />
                </InnerPage>
              }
            />
            {/* 2FA Verification */}
            <Route
              path={Routes.MFA}
              element={
                <InnerPage isCardLayout>
                  <MFAuth />
                </InnerPage>
              }
            />
            {/* Home */}
            <Route
              path={Routes.HOME}
              element={
                <PrivateRoute>
                  <InnerPage>
                    <Home />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Disbursements */}
            <Route
              path={Routes.DISBURSEMENTS}
              element={
                <PrivateRoute
                  acceptedRoles={[
                    "owner",
                    "financial_controller",
                    "business",
                    "initiator",
                    "approver",
                  ]}
                >
                  <InnerPage>
                    <Disbursements />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={`${Routes.DISBURSEMENTS}/:id`}
              element={
                <PrivateRoute
                  acceptedRoles={[
                    "owner",
                    "financial_controller",
                    "business",
                    "initiator",
                    "approver",
                  ]}
                >
                  <InnerPage>
                    <DisbursementDetails />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={Routes.DISBURSEMENT_NEW}
              element={
                <PrivateRoute acceptedRoles={["owner", "financial_controller", "initiator"]}>
                  <InnerPage isNarrow>
                    <DisbursementsNew />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={Routes.DISBURSEMENT_DRAFTS}
              element={
                <PrivateRoute
                  acceptedRoles={["owner", "financial_controller", "initiator", "approver"]}
                >
                  <InnerPage isNarrow>
                    <DisbursementsDrafts />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={`${Routes.DISBURSEMENT_DRAFTS}/:id`}
              element={
                <PrivateRoute
                  acceptedRoles={["owner", "financial_controller", "initiator", "approver"]}
                >
                  <InnerPage isNarrow>
                    <DisbursementDraftDetails />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Receivers */}
            <Route
              path={Routes.RECEIVERS}
              element={
                <PrivateRoute
                  acceptedRoles={[
                    "owner",
                    "financial_controller",
                    "business",
                    "initiator",
                    "approver",
                  ]}
                >
                  <InnerPage>
                    <Receivers />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={`${Routes.RECEIVERS}/:id`}
              element={
                <PrivateRoute
                  acceptedRoles={[
                    "owner",
                    "financial_controller",
                    "business",
                    "initiator",
                    "approver",
                  ]}
                >
                  <InnerPage>
                    <ReceiverDetails />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={`${Routes.RECEIVERS_EDIT}/:id`}
              element={
                <PrivateRoute acceptedRoles={["owner", "financial_controller"]}>
                  <InnerPage isNarrow>
                    <ReceiverDetailsEdit />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Payments */}
            <Route
              path={`${Routes.PAYMENTS}/:id`}
              element={
                <PrivateRoute
                  acceptedRoles={[
                    "owner",
                    "financial_controller",
                    "business",
                    "initiator",
                    "approver",
                  ]}
                >
                  <InnerPage>
                    <PaymentDetails />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={Routes.PAYMENTS}
              element={
                <PrivateRoute
                  acceptedRoles={[
                    "owner",
                    "financial_controller",
                    "business",
                    "initiator",
                    "approver",
                  ]}
                >
                  <InnerPage>
                    <Payments />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Distribution Account */}
            <Route
              path={Routes.DISTRIBUTION_ACCOUNT}
              element={
                <PrivateRoute>
                  <InnerPage>
                    <DistributionAccount />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Wallet Providers */}
            <Route
              path={Routes.WALLET_PROVIDERS}
              element={
                <PrivateRoute>
                  <InnerPage isNarrow>
                    <WalletProviders />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Analytics */}
            <Route
              path={Routes.ANALYTICS}
              element={
                <PrivateRoute>
                  <InnerPage>
                    <Analytics />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Api Keys */}
            <Route
              path={Routes.API_KEYS}
              element={
                <PrivateRoute acceptedRoles={["owner", "developer"]}>
                  <InnerPage>
                    <ApiKeys />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Api Key Details */}
            <Route
              path={`${Routes.API_KEYS}/:id`}
              element={
                <PrivateRoute acceptedRoles={["owner", "developer"]}>
                  <InnerPage>
                    <ApiKeyDetails />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Profile */}
            <Route
              path={Routes.PROFILE}
              element={
                <PrivateRoute>
                  <InnerPage isNarrow>
                    <Profile />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Settings */}
            <Route
              path={Routes.SETTINGS}
              element={
                <PrivateRoute acceptedRoles={["owner"]}>
                  <InnerPage isNarrow>
                    <Settings />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Help */}
            <Route
              path={Routes.HELP}
              element={
                <PrivateRoute>
                  <InnerPage isNarrow>
                    <Help />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Unauthorized */}
            <Route
              path={Routes.UNAUTHORIZED}
              element={
                <PrivateRoute>
                  <InnerPage>
                    <Unauthorized />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* 404 */}
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <InnerPage>
                    <NotFound />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route path="/signin-oidc" element={<SigninOidc />} />
          </RouterRoutes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
};
