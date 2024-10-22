import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Heading,
  Button,
  Input,
  Icon,
  Notification,
} from "@stellar/design-system";

import { useReceiversReceiverId } from "apiQueries/useReceiversReceiverId";
import { GENERIC_ERROR_MESSAGE, Routes } from "constants/settings";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { CopyWithIcon } from "components/CopyWithIcon";
import { InfoTooltip } from "components/InfoTooltip";
import { LoadingContent } from "components/LoadingContent";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import {
  ReceiverDetails,
  ReceiverEditFields,
  ReceiverVerification,
} from "types";
import { useUpdateReceiverDetails } from "apiQueries/useUpdateReceiverDetails";

type VerificationFieldType =
  | "DATE_OF_BIRTH"
  | "YEAR_MONTH"
  | "PIN"
  | "NATIONAL_ID_NUMBER";

export const ReceiverDetailsEdit = () => {
  const { id: receiverId } = useParams();

  const navigate = useNavigate();

  const [receiverEditFields, setReceiverEditFields] =
    useState<ReceiverEditFields>({
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
    isLoading: isUpdateLoading,
    error: updateError,
    mutateAsync,
    reset,
  } = useUpdateReceiverDetails(receiverId);

  const getReadyOnlyValue = useCallback(
    (field: VerificationFieldType) => {
      return (
        receiverDetails?.verifications.find(
          (v) => v.verificationField === field,
        )?.value ?? ""
      );
    },
    [receiverDetails?.verifications],
  );

  const isVerificationFieldConfirmed = (
    field: VerificationFieldType,
  ): boolean => {
    const verification: ReceiverVerification | undefined =
      receiverDetails?.verifications.find((v) => v.verificationField === field);
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
      reset();
      refetch();
      navigate(`${Routes.RECEIVERS}/${receiverId}`);
    }
  }, [isUpdateSuccess, receiverId, navigate, reset, refetch]);

  useEffect(() => {
    return () => {
      if (updateError) {
        reset();
      }
    };
  }, [updateError, reset]);

  const emptyValueIfNotChanged = (newValue: string, oldValue: string) => {
    return newValue === oldValue ? "" : newValue;
  };

  const handleReceiverEditSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const {
      email,
      phoneNumber,
      externalId,
      dateOfBirth,
      yearMonth,
      pin,
      nationalId,
    } = receiverEditFields;

    if (receiverId) {
      try {
        await mutateAsync({
          email: emptyValueIfNotChanged(email, receiverDetails?.email ?? ""),
          phoneNumber: emptyValueIfNotChanged(
            phoneNumber,
            receiverDetails?.phoneNumber ?? "",
          ),
          externalId: emptyValueIfNotChanged(
            externalId,
            receiverDetails?.orgId ?? "",
          ),
          dataOfBirth: emptyValueIfNotChanged(
            dateOfBirth,
            getReadyOnlyValue("DATE_OF_BIRTH"),
          ),
          yearMonth: emptyValueIfNotChanged(
            yearMonth,
            getReadyOnlyValue("YEAR_MONTH"),
          ),
          pin: emptyValueIfNotChanged(pin, getReadyOnlyValue("PIN")),
          nationalId: emptyValueIfNotChanged(
            nationalId,
            getReadyOnlyValue("NATIONAL_ID_NUMBER"),
          ),
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
      reset();
    }

    setReceiverEditFields({
      ...receiverEditFields,
      [event.target.name]: event.target.value,
    });
  };

  const renderInfoEditContent = () => {
    if (isReceiverDetailsLoading) {
      return <LoadingContent />;
    }

    if (receiverDetailsError || !receiverDetails) {
      return (
        <Notification variant="error" title="Error">
          <ErrorWithExtras
            appError={
              receiverDetailsError || { message: GENERIC_ERROR_MESSAGE }
            }
          />
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

    return (
      <>
        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h2" size="sm">
                {receiverDetails?.phoneNumber ? (
                  <CopyWithIcon
                    textToCopy={receiverDetails.phoneNumber}
                    iconSizeRem="1.5"
                  >
                    {receiverDetails.phoneNumber}
                  </CopyWithIcon>
                ) : null}
                {receiverDetails?.email ? (
                  <CopyWithIcon
                    textToCopy={receiverDetails.email}
                    iconSizeRem="1.5"
                  >
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
                      label="Personal PIN"
                      fieldSize="sm"
                      value={receiverEditFields.pin}
                      onChange={handleDetailsChange}
                      disabled={isVerificationFieldConfirmed("PIN")}
                    />
                    <Input
                      id="nationalId"
                      name="nationalId"
                      label="National ID Number"
                      fieldSize="sm"
                      value={receiverEditFields.nationalId}
                      onChange={handleDetailsChange}
                      disabled={isVerificationFieldConfirmed(
                        "NATIONAL_ID_NUMBER",
                      )}
                    />
                    <Input
                      id="yearMonth"
                      name="yearMonth"
                      label="Date of Birth (Year & Month only)"
                      fieldSize="sm"
                      value={receiverEditFields.yearMonth}
                      onChange={handleDetailsChange}
                      disabled={isVerificationFieldConfirmed("YEAR_MONTH")}
                    />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      label="Date of Birth"
                      fieldSize="sm"
                      value={receiverEditFields.dateOfBirth}
                      onChange={handleDetailsChange}
                      disabled={isVerificationFieldConfirmed("DATE_OF_BIRTH")}
                    />
                  </div>
                </div>
              </div>
            </Card>
            <div className="CardStack__buttons CardStack__buttons--spaceBetween">
              <Button
                variant="error"
                size="xs"
                type="reset"
                icon={<Icon.DeleteForever />}
                isLoading={isUpdateLoading}
              >
                Discard changes
              </Button>
              <Button
                variant="primary"
                size="xs"
                type="submit"
                isLoading={isUpdateLoading}
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
