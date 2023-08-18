import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Card,
  Heading,
  Button,
  Input,
  Icon,
  Notification,
} from "@stellar/design-system";

import { AppDispatch } from "store";
import {
  getReceiverDetailsAction,
  updateReceiverDetailsAction,
} from "store/ducks/receiverDetails";
import { Routes } from "constants/settings";
import { useRedux } from "hooks/useRedux";

import { Breadcrumbs } from "components/Breadcrumbs";
import { SectionHeader } from "components/SectionHeader";
import { CopyWithIcon } from "components/CopyWithIcon";
import { InfoTooltip } from "components/InfoTooltip";
import { ReceiverEditFields } from "types";

export const ReceiverDetailsEdit = () => {
  const { id: receiverId } = useParams();

  const { receiverDetails } = useRedux("receiverDetails");
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [receiverEditFields, setReceiverEditFields] =
    useState<ReceiverEditFields>({
      email: "",
      externalId: "",
    });

  useEffect(() => {
    if (receiverId) {
      dispatch(getReceiverDetailsAction(receiverId));
    }
  }, [receiverId, dispatch]);

  useEffect(() => {
    setReceiverEditFields({
      email: receiverDetails.email || "",
      externalId: receiverDetails.orgId,
    });
  }, [receiverDetails.email, receiverDetails.orgId]);

  useEffect(() => {
    receiverDetails.verifications.forEach((v) => {
      switch (v.verificationField) {
        case "DATE_OF_BIRTH":
          setDateOfBirth(v.value);
          break;
        case "PIN":
          setPin(v.value);
          break;
        case "NATIONAL_ID_NUMBER":
          setNationalId(v.value);
          break;
      }
    });
  }, [receiverDetails.verifications]);

  const emptyValueIfNotChanged = (newValue: string, oldValue: string) => {
    return newValue === oldValue ? "" : newValue;
  };

  const handleReceiverEditSubmit = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    const { email, externalId } = receiverEditFields;

    if ((email || externalId) && receiverId) {
      dispatch(
        updateReceiverDetailsAction({
          receiverId,
          email: emptyValueIfNotChanged(email, receiverDetails.email || ""),
          externalId: emptyValueIfNotChanged(externalId, receiverDetails.orgId),
        }),
      );
      dispatch(getReceiverDetailsAction(receiverId));
    }
  };

  const handleReceiverEditCancel = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    setReceiverEditFields({
      email: receiverDetails.email || "",
      externalId: receiverDetails.orgId,
    });
    navigate(`${Routes.RECEIVERS}/${receiverId}`);
  };

  const handleDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReceiverEditFields({
      ...receiverEditFields,
      [event.target.name]: event.target.value,
    });
  };

  const renderInfoEditContent = () => {
    const isSubmitDisabled =
      receiverEditFields.email === receiverDetails.email &&
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

        {receiverDetails.errorString && (
          <Notification variant="error" title="Error">
            <div>{receiverDetails.errorString}</div>
          </Notification>
        )}

        {receiverDetails.updateStatus === "SUCCESS" && (
          <Notification variant="success" title="Receiver updated" />
        )}

        <div className="CardStack">
          <Card>
            <div className="CardStack__card">
              <div className="CardStack__title">
                <InfoTooltip infoText="">Receiver info</InfoTooltip>
              </div>

              <form className="CardStack__card">
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
                      id="orgId"
                      name="orgId"
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
                      value={pin}
                      disabled
                    />
                    <Input
                      id="nationalIDNumber"
                      name="nationalIDNumber"
                      label="National ID Number"
                      fieldSize="sm"
                      value={nationalId}
                      disabled
                    />
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      label="Date of Birth"
                      fieldSize="sm"
                      value={dateOfBirth}
                      disabled
                    />
                  </div>
                </div>
              </form>
            </div>
          </Card>
          <div
            className="CardStack__buttons"
            style={{ justifyContent: "space-between" }}
          >
            <Button
              variant="secondary"
              size="xs"
              type="reset"
              icon={<Icon.DeleteForever style={{ color: "#E5484D" }} />}
              onClick={(e) => {
                handleReceiverEditCancel(e);
              }}
            >
              Discard changes
            </Button>
            <Button
              variant="tertiary"
              size="xs"
              type="submit"
              isLoading={receiverDetails.updateStatus === "PENDING"}
              disabled={isSubmitDisabled}
              onClick={(e) => {
                handleReceiverEditSubmit(e);
              }}
            >
              Save receiver info
            </Button>
          </div>
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
