import { useEffect, useState } from "react";
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

import { ReceiverDetails, ReceiverEditFields } from "types";
import { useUpdateReceiverDetails } from "apiQueries/useUpdateReceiverDetails";

export const ReceiverDetailsEdit = () => {
  const { id: receiverId } = useParams();

  const navigate = useNavigate();

  const [receiverEditFields, setReceiverEditFields] =
    useState<ReceiverEditFields>({
      email: "",
      externalId: "",
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

  useEffect(() => {
    if (isReceiverDetailsSuccess) {
      setReceiverEditFields({
        email: receiverDetails?.email || "",
        externalId: receiverDetails?.orgId || "",
      });
    }
  }, [
    isReceiverDetailsSuccess,
    receiverDetails?.email,
    receiverDetails?.orgId,
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

  const getReadyOnlyValue = (
    field: "DATE_OF_BIRTH" | "PIN" | "NATIONAL_ID_NUMBER",
  ) => {
    return (
      receiverDetails?.verifications.find((v) => v.verificationField === field)
        ?.value || ""
    );
  };

  const emptyValueIfNotChanged = (newValue: string, oldValue: string) => {
    return newValue === oldValue ? "" : newValue;
  };

  const handleReceiverEditSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const { email, externalId } = receiverEditFields;

    if (receiverId) {
      try {
        await mutateAsync({
          email: emptyValueIfNotChanged(email, receiverDetails?.email || ""),
          externalId: emptyValueIfNotChanged(
            externalId,
            receiverDetails?.orgId || "",
          ),
        });
      } catch (e) {
        // do nothing
      }
    }
  };

  const handleReceiverEditCancel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReceiverEditFields({
      email: receiverDetails?.email || "",
      externalId: receiverDetails?.orgId || "",
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
          <div>{receiverDetailsError?.message || GENERIC_ERROR_MESSAGE}</div>
        </Notification>
      );
    }

    const isSubmitDisabled =
      receiverEditFields.email === receiverDetails?.email &&
      receiverEditFields.externalId === receiverDetails.orgId;

    return (
      <>
        <SectionHeader>
          <SectionHeader.Row>
            <SectionHeader.Content>
              <Heading as="h2" size="sm">
                <CopyWithIcon
                  textToCopy={receiverDetails.phoneNumber}
                  iconSizeRem="1.5"
                >
                  {receiverDetails.phoneNumber}
                </CopyWithIcon>
              </Heading>
            </SectionHeader.Content>
          </SectionHeader.Row>
        </SectionHeader>

        <div className="CardStack">
          {updateError ? (
            <Notification variant="error" title="Error">
              <div>{updateError?.message}</div>
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
                  {/* TODO: info text */}
                  <InfoTooltip infoText="">Receiver info</InfoTooltip>
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
                      id="externalId"
                      name="externalId"
                      label="External ID"
                      fieldSize="sm"
                      value={receiverEditFields.externalId}
                      onChange={handleDetailsChange}
                    />
                    <Input
                      id="personalPIN"
                      name="personalPIN"
                      label="Personal PIN"
                      fieldSize="sm"
                      value={getReadyOnlyValue("PIN")}
                      disabled
                    />
                    <Input
                      id="nationalIDNumber"
                      name="nationalIDNumber"
                      label="National ID Number"
                      fieldSize="sm"
                      value={getReadyOnlyValue("NATIONAL_ID_NUMBER")}
                      disabled
                    />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      label="Date of Birth"
                      fieldSize="sm"
                      value={getReadyOnlyValue("DATE_OF_BIRTH")}
                      disabled
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
