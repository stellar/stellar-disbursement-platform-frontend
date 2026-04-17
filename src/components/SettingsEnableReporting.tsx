import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import { Card, Loader, Notification, Toggle } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { getOrgInfoAction } from "@/store/ducks/organization";

import { useUpdateOrgReportingEnabled } from "@/apiQueries/useUpdateOrgReportingEnabled";

import { useRedux } from "@/hooks/useRedux";

import { AppDispatch } from "@/store";

export const SettingsEnableReporting = () => {
  const { organization } = useRedux("organization");

  const dispatch: AppDispatch = useDispatch();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgReportingEnabled();

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
      queryClient.invalidateQueries({ queryKey: ["appConfig"] });
    }
  }, [dispatch, isSuccess, queryClient]);

  const handleToggleChange = () => {
    mutateAsync(!organization.data.reporting_enabled);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="reporting-enabled">
              Enable Reports
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="reporting-enabled"
                checked={Boolean(organization.data.reporting_enabled)}
                onChange={handleToggleChange}
                disabled={isPending}
                fieldSize="sm"
              />
            </div>
          </div>
          <div className="Note">
            Toggle this option to enable the Reports page for this organization. When enabled, users
            can download wallet statements and individual transaction notices as PDFs.
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {error ? (
        <Notification variant="error" title="Error" isFilled={true}>
          <ErrorWithExtras appError={error} />
        </Notification>
      ) : null}

      <Card>
        <div className="CardStack__card">{renderContent()}</div>
      </Card>
    </>
  );
};
