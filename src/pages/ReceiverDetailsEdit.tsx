import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Heading, Button, Input, Icon, Notification } from "@stellar/design-system";

import { useReceiversReceiverId } from "apiQueries/useReceiversReceiverId";
import { GENERIC_ERROR_MESSAGE, Routes } from "constants/settings";

import { Breadcrumbs } from "components/Breadcrumbs";
import { CopyWithIcon } from "components/CopyWithIcon";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { InfoTooltip } from "components/InfoTooltip";
import { LoadingContent } from "components/LoadingContent";
import { NotificationWithButtons } from "components/NotificationWithButtons";
import { SectionHeader } from "components/SectionHeader";

import {
  DisbursementVerificationField,
  ReceiverDetails,
  ReceiverEditFields,
  ReceiverVerification,
  VerificationFieldMap,
} from "types";
import { useUpdateReceiverDetails } from "apiQueries/useUpdateReceiverDetails";

export const ReceiverDetailsEdit = () => {
  const { id: receiverId } = useParams();

  const navigate = useNavigate();

  const [receiverEditFields, setReceiverEditFields] = useState<ReceiverEditFields>({
    email: "",
    phoneNumber: "",
    externalId: "",
    dateOfBirth: "",
    yearMonth: "",
    pin: "",
    nationalId: "",
  });

  const {
    data: receiverDetails,
    isSuccess: isReceiverDetailsSuccess,
    isLoading: isReceiverDetailsLoading,
    error: receiverDetailsError,
    refetch,
  } = useReceiversReceiverId<ReceiverDetails>({
    receiverId,
    dataFormat: "receiver",
  });

  const {
    isSuccess: isUpdateSuccess,
    isPending: isUpdatePending,
    error: updateError,
    mutateAsync,
    reset: resetUpdateState,
  } = useUpdateReceiverDetails(receiverId);

  const getReadyOnlyValue = useCallback(
    (field: DisbursementVerificationField) => {
      return receiverDetails?.verifications.find((v) => v.verificationField === field)?.value ?? "";
    },
    [receiverDetails?.verifications],
  );

  const isVerificationFieldSubmitted = (field: DisbursementVerificationField): boolean => {
    const verification: ReceiverVerification | undefined = receiverDetails?.verifications.find(
      (v) => v.verificationField === field,
    );
    return verification !== undefined;
  };

  const isVerificationFieldConfirmed = (field: DisbursementVerificationField): boolean => {
    const verification: ReceiverVerification | undefined = receiverDetails?.verifications.find(
      (v) => v.verificationField === field,
    );
    return !verification ? false : verification.confirmedAt !== null;
  };

  useEffect(() => {
    if (isReceiverDetailsSuccess) {
      setReceiverEditFields({
        email: receiverDetails?.email ?? "",
        phoneNumber: receiverDetails?.phoneNumber ?? "",
        externalId: receiverDetails?.orgId ?? "",
        yearMonth: getReadyOnlyValue("YEAR_MONTH"),
        dateOfBirth: getReadyOnlyValue("DATE_OF_BIRTH"),
        pin: getReadyOnlyValue("PIN"),
        nationalId: getReadyOnlyValue("NATIONAL_ID_NUMBER"),
      });
    }
  }, [
    isReceiverDetailsSuccess,
    receiverDetails?.email,
    receiverDetails?.phoneNumber,
    receiverDetails?.orgId,
    getReadyOnlyValue,
  ]);

  useEffect(() => {
    if (isUpdateSuccess && receiverId) {
      refetch();
    }
  }, [isUpdateSuccess, receiverId, resetUpdateState, refetch]);
  useEffect(() => {
    return () => {
      if (updateError) {
        resetUpdateState();
      }
    };
  }, [updateError, resetUpdateState]);

  const emptyValueIfNotChanged = (newValue: string, oldValue: string) => {
    return newValue === oldValue ? "" : newValue;
  };

  const handleReceiverEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, phoneNumber, externalId, dateOfBirth, yearMonth, pin, nationalId } =
      receiverEditFields;

    if (receiverId) {
      try {
        await mutateAsync({
          email: emptyValueIfNotChanged(email, receiverDetails?.email ?? ""),
          phoneNumber: emptyValueIfNotChanged(phoneNumber, receiverDetails?.phoneNumber ?? ""),
          externalId: emptyValueIfNotChanged(externalId, receiverDetails?.orgId ?? ""),
          dataOfBirth: emptyValueIfNotChanged(dateOfBirth, getReadyOnlyValue("DATE_OF_BIRTH")),
          yearMonth: emptyValueIfNotChanged(yearMonth, getReadyOnlyValue("YEAR_MONTH")),
          pin: emptyValueIfNotChanged(pin, getReadyOnlyValue("PIN")),
          nationalId: emptyValueIfNotChanged(nationalId, getReadyOnlyValue("NATIONAL_ID_NUMBER")),
        });
      } catch {
        // do nothing
      }
    }
  };

  const handleReceiverEditCancel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReceiverEditFields({
      email: receiverDetails?.email ?? "",
      phoneNumber: receiverDetails?.phoneNumber ?? "",
      externalId: receiverDetails?.orgId ?? "",
      dateOfBirth: getReadyOnlyValue("DATE_OF_BIRTH"),
      yearMonth: getReadyOnlyValue("YEAR_MONTH"),
      pin: getReadyOnlyValue("PIN"),
      nationalId: getReadyOnlyValue("NATIONAL_ID_NUMBER"),
    });
    navigate(`${Routes.RECEIVERS}/${receiverId}`);
  };

  const handleDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (updateError) {
      resetUpdateState();
    }

    const { name, value } = event.target;
    // Format yearMonth input to YYYY-MM
    const formattedValue = name === "yearMonth" ? value.substring(0, 7) : value;

    setReceiverEditFields({
      ...receiverEditFields,
      [name]: formattedValue,
    });
  };

  const renderInfoEditContent = () => {
    if (isReceiverDetailsLoading) {
      return <LoadingContent />;
    }

    if (receiverDetailsError || !receiverDetails) {
      return (
        <Notification variant="error" title="Error">
          <ErrorWithExtras appError={receiverDetailsError || { message: GENERIC_ERROR_MESSAGE }} />
        </Notification>
      );
    }

    const isSubmitDisabled =
      receiverEditFields.email === receiverDetails?.email &&
      receiverEditFields.phoneNumber === receiverDetails?.phoneNumber &&
      receiverEditFields.externalId === receiverDetails.orgId &&
      receiverEditFields.dateOfBirth === getReadyOnlyValue("DATE_OF_BIRTH") &&
      receiverEditFields.yearMonth === getReadyOnlyValue("YEAR_MONTH") &&
      receiverEditFields.pin === getReadyOnlyValue("PIN") &&
      receiverEditFields.nationalId === getReadyOnlyValue("NATIONAL_ID_NUMBER");

    const alreadyConfirmedText = "This field was already confirmed by the user.";
    const notConfirmedText = "This field has not been confirmed by the user yet.";
    const dummyInputPlaceholder = "******";

    return (
      <>
        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h2" size="sm">
                {receiverDetails?.phoneNumber ? (
                  <CopyWithIcon textToCopy={receiverDetails.phoneNumber} iconSizeRem="1.5">
                    {receiverDetails.phoneNumber}
                  </CopyWithIcon>
                ) : null}
                {receiverDetails?.email ? (
                  <CopyWithIcon textToCopy={receiverDetails.email} iconSizeRem="1.5">
                    {receiverDetails.email}
                  </CopyWithIcon>
                ) : null}
              </Heading>
            </SectionHeader.Content>
          </SectionHeader.Row>
        </SectionHeader>

        <div className="CardStack">
          {updateError ? (
            <Notification variant="error" title="Error">
              <ErrorWithExtras appError={updateError} />
            </Notification>
          ) : null}

          {isUpdateSuccess ? (
            <NotificationWithButtons
              variant="success"
              title="Success"
              buttons={[
                {
                  label: "Dismiss",
                  onClick: resetUpdateState,
                },
                {
                  label: "Return to receiver details",
                  onClick: () => {
                    navigate(`${Routes.RECEIVERS}/${receiverId}`);
                  },
                },
              ]}
            >
              Receiver details updated successfully
            </NotificationWithButtons>
          ) : null}

          <form
            className="CardStack__card"
            onSubmit={handleReceiverEditSubmit}
            onReset={handleReceiverEditCancel}
          >
            <Card>
              <div className="CardStack__card">
                <div className="CardStack__title">
                  <InfoTooltip infoText="Information unique to this individual, such as their email address, phone number, the ID you use to track them, and verification information">
                    Receiver info
                  </InfoTooltip>
                </div>

                <div className="CardStack__body">
                  <div className="CardStack__grid">
                    <Input
                      id="email"
                      name="email"
                      label="Email"
                      fieldSize="sm"
                      value={receiverEditFields.email}
                      onChange={handleDetailsChange}
                    />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      label="Phone Number"
                      fieldSize="sm"
                      value={receiverEditFields.phoneNumber}
                      onChange={handleDetailsChange}
                    />
                    <Input
                      id="externalId"
                      name="externalId"
                      label="External ID"
                      fieldSize="sm"
                      value={receiverEditFields.externalId}
                      onChange={handleDetailsChange}
                    />
                    <Input
                      id="pin"
                      name="pin"
                      label={
                        <InfoTooltip
                          hideTooltip={!isVerificationFieldSubmitted("PIN")}
                          icon={isVerificationFieldConfirmed("PIN") ? "check" : "info"}
                          infoText={
                            isVerificationFieldConfirmed("PIN")
                              ? alreadyConfirmedText
                              : notConfirmedText
                          }
                        >
                          Personal PIN
                        </InfoTooltip>
                      }
                      fieldSize="sm"
                      placeholder={receiverEditFields.pin === "" ? "" : dummyInputPlaceholder}
                      onChange={handleDetailsChange}
                    />
                    <Input
                      id="nationalId"
                      name="nationalId"
                      label={
                        <InfoTooltip
                          hideTooltip={!isVerificationFieldSubmitted("NATIONAL_ID_NUMBER")}
                          icon={
                            isVerificationFieldConfirmed("NATIONAL_ID_NUMBER") ? "check" : "info"
                          }
                          infoText={
                            isVerificationFieldConfirmed("NATIONAL_ID_NUMBER")
                              ? alreadyConfirmedText
                              : notConfirmedText
                          }
                        >
                          {VerificationFieldMap["NATIONAL_ID_NUMBER"]}
                        </InfoTooltip>
                      }
                      fieldSize="sm"
                      placeholder={
                        receiverEditFields.nationalId === "" ? "" : dummyInputPlaceholder
                      }
                      onChange={handleDetailsChange}
                    />
                    <Input
                      id="yearMonth"
                      name="yearMonth"
                      label={
                        <InfoTooltip
                          hideTooltip={!isVerificationFieldSubmitted("YEAR_MONTH")}
                          icon={isVerificationFieldConfirmed("YEAR_MONTH") ? "check" : "info"}
                          infoText={
                            isVerificationFieldConfirmed("YEAR_MONTH")
                              ? alreadyConfirmedText
                              : notConfirmedText
                          }
                        >
                          Date of Birth (Year & Month only)
                        </InfoTooltip>
                      }
                      fieldSize="sm"
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleDetailsChange}
                    />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      label={
                        <InfoTooltip
                          hideTooltip={!isVerificationFieldSubmitted("DATE_OF_BIRTH")}
                          icon={isVerificationFieldConfirmed("DATE_OF_BIRTH") ? "check" : "info"}
                          infoText={
                            isVerificationFieldConfirmed("DATE_OF_BIRTH")
                              ? alreadyConfirmedText
                              : notConfirmedText
                          }
                        >
                          {VerificationFieldMap["DATE_OF_BIRTH"]}
                        </InfoTooltip>
                      }
                      fieldSize="sm"
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleDetailsChange}
                    />
                  </div>
                </div>
              </div>
            </Card>
            <div className="CardStack__buttons CardStack__buttons--spaceBetween">
              <Button
                variant="error"
                size="sm"
                type="reset"
                icon={<Icon.Trash01 />}
                isLoading={isUpdatePending}
              >
                Discard changes
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isUpdatePending}
                disabled={isSubmitDisabled}
              >
                Save receiver info
              </Button>
            </div>
          </form>
        </div>
      </>
    );
  };

  return (
    <>
      <Breadcrumbs
        steps={[
          {
            label: "Receivers",
            route: Routes.RECEIVERS,
          },
          {
            label: "Receiver details",
            route: `${Routes.RECEIVERS}/${receiverId}`,
          },
          {
            label: "Edit receiver",
          },
        ]}
      />

      {renderInfoEditContent()}
    </>
  );
};
