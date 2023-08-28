import { useEffect } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GitInfo from "generated/gitInfo";

import { store } from "store";
import { Routes } from "constants/settings";
import { PrivateRoute } from "components/PrivateRoute";
import { InnerPage } from "components/InnerPage";
import { UserSession } from "components/UserSession";

import { SignIn } from "pages/SignIn";
import { MFAuth } from "pages/MFAuth";
import { ForgotPassword } from "pages/ForgotPassword";
import { ResetPassword } from "pages/ResetPassword";
import { SetNewPassword } from "pages/SetNewPassword";
import { Home } from "pages/Home";
import { Disbursements } from "pages/Disbursements";
import { DisbursementDetails } from "pages/DisbursementDetails";
import { DisbursementsNew } from "pages/DisbursementsNew";
import { DisbursementDraftDetails } from "pages/DisbursementDraftDetails";
import { DisbursementsDrafts } from "pages/DisbursementsDrafts";
import { Receivers } from "pages/Receivers";
import { ReceiverDetails } from "pages/ReceiverDetails";
import { ReceiverDetailsEdit } from "pages/ReceiverDetailsEdit";
import { PaymentDetails } from "pages/PaymentDetails";
import { Payments } from "pages/Payments";
import { Wallets } from "pages/Wallets";
import { Analytics } from "pages/Analytics";
import { Profile } from "pages/Profile";
import { Settings } from "pages/Settings";
import { Help } from "pages/Help";
import { NotFound } from "pages/NotFound";
import { Unauthorized } from "pages/Unauthorized";
import { SigninOidc } from "pages/Redirect";

import "styles.scss";
// TODO: update favicons

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
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <UserSession />
        <BrowserRouter>
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
                  acceptedRoles={["owner", "financial_controller", "business"]}
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
                <PrivateRoute acceptedRoles={["owner", "financial_controller"]}>
                  <InnerPage>
                    <DisbursementDetails />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={Routes.DISBURSEMENT_NEW}
              element={
                <PrivateRoute acceptedRoles={["owner", "financial_controller"]}>
                  <InnerPage isNarrow>
                    <DisbursementsNew />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={Routes.DISBURSEMENT_DRAFTS}
              element={
                <PrivateRoute acceptedRoles={["owner", "financial_controller"]}>
                  <InnerPage isNarrow>
                    <DisbursementsDrafts />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            <Route
              path={`${Routes.DISBURSEMENT_DRAFTS}/:id`}
              element={
                <PrivateRoute acceptedRoles={["owner", "financial_controller"]}>
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
                  acceptedRoles={["owner", "financial_controller", "business"]}
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
                <PrivateRoute acceptedRoles={["owner", "financial_controller"]}>
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
                <PrivateRoute acceptedRoles={["owner", "financial_controller"]}>
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
                  acceptedRoles={["owner", "financial_controller", "business"]}
                >
                  <InnerPage>
                    <Payments />
                  </InnerPage>
                </PrivateRoute>
              }
            />
            {/* Wallets */}
            <Route
              path={Routes.WALLETS}
              element={
                <PrivateRoute>
                  <InnerPage isNarrow>
                    <Wallets />
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
      </QueryClientProvider>
    </Provider>
  );
};
