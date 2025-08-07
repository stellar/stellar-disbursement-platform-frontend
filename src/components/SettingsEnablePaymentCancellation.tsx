import { useEffect, useState } from "react";
import { Button, Card, Input, Notification, Toggle, Loader } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { DropdownMenu } from "components/DropdownMenu";
import { MoreMenuButton } from "components/MoreMenuButton";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { useUpdateOrgPaymentCancellationPeriodDays } from "apiQueries/useUpdateOrgPaymentCancellationPeriodDays";
import { useRedux } from "hooks/useRedux";
import { AppDispatch } from "store";
import { getOrgInfoAction } from "store/ducks/organization";

export const SettingsEnablePaymentCancellation = () => {
  const { organization } = useRedux("organization");

  const [paymentCancellationPeriodDays, setPaymentCancellationPeriodDays] = useState<number | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const { mutateAsync, isPending, error, isSuccess } = useUpdateOrgPaymentCancellationPeriodDays();

  useEffect(() => {
    setPaymentCancellationPeriodDays(organization.data.paymentCancellationPeriodDays);
  }, [organization.data.paymentCancellationPeriodDays]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(getOrgInfoAction());
      setIsEditMode(false);
    }
  }, [dispatch, isSuccess]);

  const handleToggleChange = () => {
    // Default period is 5 days
    mutateAsync(organization.data.paymentCancellationPeriodDays === 0 ? 5 : 0);
  };

  const handlePaymentCancellationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (paymentCancellationPeriodDays) {
      mutateAsync(paymentCancellationPeriodDays);
    }
  };

  const handlePaymentCancellationReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEditMode(false);
    setPaymentCancellationPeriodDays(organization.data.paymentCancellationPeriodDays);
  };

  const renderContent = () => {
    return (
      <div className="SdpSettings">
        <div className="SdpSettings__row">
          <div className="SdpSettings__item">
            <label className="SdpSettings__label" htmlFor="payment-cancellation">
              Enable automatic payments cancellation
            </label>
            <div className="Toggle__wrapper">
              {isPending ? <Loader size="1rem" /> : null}
              <Toggle
                id="payment-cancellation"
                checked={Boolean(organization.data.paymentCancellationPeriodDays)}
                onChange={handleToggleChange}
                disabled={isPending}
                fieldSize="sm"
              />
            </div>
          </div>
          <div className="Note">
            Select this option to automatically cancel pending payments after a certain time period.
            Uncompleted payments will not be made once they are canceled, even if the receiver tries
            to claim funds. Completed payments are always final.
          </div>
        </div>

        {organization.data.paymentCancellationPeriodDays ? (
          <div className="SdpSettings__row">
            <form
              className="SdpSettings__form"
              onSubmit={handlePaymentCancellationSubmit}
              onReset={handlePaymentCancellationReset}
            >
              <div className="SdpSettings__form__row">
                <Input
                  fieldSize="sm"
                  id="payment-cancellation-period"
                  label="Payments Cancellation Period (days)"
                  type="number"
                  value={paymentCancellationPeriodDays ?? ""}
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      setPaymentCancellationPeriodDays(Number(e.target.value));
                    } else {
                      setPaymentCancellationPeriodDays(null);
                    }
                  }}
                  disabled={!isEditMode}
                  error={
                    paymentCancellationPeriodDays == 0 ? "Cancellation period cannot be 0" : ""
                  }
                />
                {!isEditMode ? (
                  <DropdownMenu triggerEl={<MoreMenuButton />}>
                    <DropdownMenu.Item onClick={() => setIsEditMode(true)}>Edit</DropdownMenu.Item>
                  </DropdownMenu>
                ) : null}
              </div>
              {isEditMode ? (
                <div className="SdpSettings__form__buttons">
                  <Button variant="tertiary" size="sm" type="reset" isLoading={isPending}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isPending}
                    disabled={
                      !paymentCancellationPeriodDays ||
                      paymentCancellationPeriodDays ===
                        organization.data.paymentCancellationPeriodDays
                    }
                  >
                    Update
                  </Button>
                </div>
              ) : null}
            </form>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {error ? (
        <Notification variant="error" title="Error">
          <ErrorWithExtras appError={error} />
        </Notification>
      ) : null}

      <Card>
        <div className="CardStack__card">{renderContent()}</div>
      </Card>
    </>
  );
};
