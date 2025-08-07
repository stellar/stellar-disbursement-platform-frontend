import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Heading,
  Icon,
  Input,
  Link,
  Select,
  Notification,
  Checkbox,
} from "@stellar/design-system";

import { DropdownMenu } from "components/DropdownMenu";
import { FileUpload } from "components/FileUpload";
import { InfoTooltip } from "components/InfoTooltip";
import { MoreMenuButton } from "components/MoreMenuButton";
import { NotificationWithButtons } from "components/NotificationWithButtons";
import { SectionHeader } from "components/SectionHeader";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { USE_SSO } from "constants/envVariables";
import { Routes } from "constants/settings";
import { singleUserStore } from "helpers/singleSingOn";
import { userRoleText } from "helpers/userRoleText";
import { localStorageSessionToken } from "helpers/localStorageSessionToken";
import { useRedux } from "hooks/useRedux";
import { useIsUserRoleAccepted } from "hooks/useIsUserRoleAccepted";
import { AppDispatch, resetStoreAction } from "store";
import {
  getOrgInfoAction,
  updateOrgInfoAction,
  clearErrorAction as orgClearErrorAction,
  clearUpdateMessageAction as orgClearUpdateMessageAction,
  getOrgLogoAction,
} from "store/ducks/organization";
import {
  clearErrorAction,
  clearUpdateMessageAction,
  getProfileInfoAction,
  updateProfileInfoAction,
} from "store/ducks/profile";
import { AccountProfile } from "types";

export const Profile = () => {
  const { profile, organization } = useRedux("profile", "organization");
  const { isRoleAccepted } = useIsUserRoleAccepted(["owner", "financial_controller"]);
  const [isEditAccount, setIsEditAccount] = useState(false);
  const [isEditOrganization, setIsEditOrganization] = useState(false);
  const [imageFile, setImageFile] = useState<File>();
  const [imageFileUrl, setImageFileUrl] = useState<string>();
  const [isApprovalRequired, setIsApprovalRequired] = useState(false);

  const [accountDetails, setAccountDetails] = useState<AccountProfile>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    role: null,
  });
  const [organizationDetails, setOrganizationDetails] = useState({
    name: "",
    privacyPolicyLink: "",
    logo: "",
  });

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile.updateMessage) {
      setIsEditAccount(false);
      dispatch(getProfileInfoAction());
    }
  }, [profile.updateMessage, dispatch]);

  useEffect(() => {
    if (organization.updateMessage) {
      setIsEditOrganization(false);
      setImageFile(undefined);
      dispatch(getOrgInfoAction());
      dispatch(getOrgLogoAction());
    }
  }, [organization.updateMessage, dispatch]);

  useEffect(() => {
    if (imageFile) {
      setImageFileUrl(URL.createObjectURL(imageFile));
    }
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (imageFileUrl) {
        URL.revokeObjectURL(imageFileUrl);
      }
    };
  }, [imageFileUrl]);

  useEffect(() => {
    return () => {
      dispatch(clearUpdateMessageAction());
      dispatch(orgClearUpdateMessageAction());
    };
  }, [dispatch]);

  useEffect(() => {
    if (organization.data.isApprovalRequired != undefined) {
      setIsApprovalRequired(organization.data.isApprovalRequired);
    }
  }, [organization.data.isApprovalRequired]);

  const ImageUploadInput = ({ isReadOnly }: { isReadOnly?: boolean }) => {
    const getInfoMessage = () => {
      if (isReadOnly) {
        return organization.data.name;
      }

      return imageFile ? imageFile.name : "Drop your file here or click the button";
    };

    const getDisplayImage = () => {
      if (isReadOnly) {
        return (
          <div
            className="CompanyBrand__logo"
            style={{ backgroundImage: `url(${organization.data.logo})` }}
          ></div>
        );
      }

      return imageFile ? (
        <div
          className="CompanyBrand__logo"
          style={{ backgroundImage: `url(${imageFileUrl})` }}
        ></div>
      ) : null;
    };

    return (
      <div className="CardStack__infoItem CardStack__imageUpload">
        <label className="Label Label--sm">Profile image</label>

        <FileUpload
          uploadButton={
            isReadOnly ? undefined : (
              <div className="CsvUploadButton">
                <label className="Button Button--tertiary Button--sm" htmlFor="upload-org-image">
                  Upload image
                  <span className="Button__icon">
                    <Icon.UploadCloud01 />
                  </span>
                </label>
                <input type="file" id="upload-org-image" accept="image/png, image/jpeg" hidden />
              </div>
            )
          }
          onChange={handleImageUploadChange}
          acceptedType={["image/png", "image/jpeg"]}
          infoMessage={getInfoMessage()}
          disabled={Boolean(isReadOnly)}
          extraInfo={<div className="CardStack__imageUpload__image">{getDisplayImage()}</div>}
        />
      </div>
    );
  };

  const emptyValueIfNotChanged = (newValue: string, oldValue: string) => {
    return newValue === oldValue ? "" : newValue;
  };

  const handleAccountEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { firstName, lastName, email } = accountDetails;

    if (firstName || lastName || email) {
      dispatch(
        // Don't submit values that haven't changed
        updateProfileInfoAction({
          firstName: emptyValueIfNotChanged(firstName, profile.data.firstName),
          lastName: emptyValueIfNotChanged(lastName, profile.data.lastName),
          email: emptyValueIfNotChanged(email, profile.data.email),
        }),
      );
    }
  };

  const handleAccountEditCancel = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEditAccount(false);
    setAccountDetails({
      id: profile.data.id,
      firstName: profile.data.firstName,
      lastName: profile.data.lastName,
      email: profile.data.email,
      role: profile.data.role,
    });
    dispatch(clearErrorAction());
  };

  const handleOrganizationEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      organizationDetails.name ||
      organizationDetails.privacyPolicyLink ||
      imageFile ||
      isApprovalRequired
    ) {
      dispatch(
        updateOrgInfoAction({
          name: emptyValueIfNotChanged(organizationDetails.name, organization.data.name),
          privacyPolicyLink: emptyValueIfNotChanged(
            organizationDetails.privacyPolicyLink,
            organization.data.privacyPolicyLink,
          ),
          logo: imageFile,
          isApprovalRequired,
        }),
      );
    }
  };

  const handleOrganizationEditCancel = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsEditOrganization(false);
    setImageFile(undefined);
    setOrganizationDetails({
      name: organization.data.name,
      privacyPolicyLink: organization.data.privacyPolicyLink,
      logo: organization.data.logo,
    });
    setIsApprovalRequired(Boolean(organization.data.isApprovalRequired));
    dispatch(orgClearErrorAction());

    if (imageFileUrl) {
      URL.revokeObjectURL(imageFileUrl);
    }
  };
  const handleAccountDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountDetails({
      ...accountDetails,
      [event.target.name]: event.target.value,
    });
  };

  const handleImageUploadChange = (file?: File) => {
    setImageFile(file);
  };

  const handleOrgDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrganizationDetails({
      ...organizationDetails,
      [event.target.name]: event.target.value,
    });
  };

  const handleSignOut = () => {
    if (USE_SSO) {
      // reset user store (from session storage)
      singleUserStore().then();
    }
    dispatch(resetStoreAction());
    localStorageSessionToken.remove();
  };

  const goToResetPassword = () => {
    navigate(Routes.SET_NEW_PASSWORD);
  };

  const renderAccount = () => {
    const isSubmitDisabled =
      accountDetails.firstName === profile.data.firstName &&
      accountDetails.lastName === profile.data.lastName &&
      accountDetails.email === profile.data.email;

    return (
      <form
        className="CardStack__card"
        {...(isEditAccount
          ? {
              onSubmit: handleAccountEditSubmit,
              onReset: handleAccountEditCancel,
            }
          : {})}
      >
        {isEditAccount ? (
          <div className="CardStack__body">
            <div className="CardStack__grid">
              <Input
                id="firstName"
                name="firstName"
                label="First name"
                fieldSize="sm"
                value={accountDetails.firstName}
                onChange={handleAccountDetailsChange}
              />
              <Input
                id="lastName"
                name="lastName"
                label="Last name"
                fieldSize="sm"
                value={accountDetails.lastName}
                onChange={handleAccountDetailsChange}
              />
              <Input
                id="email"
                name="email"
                label="Email"
                type="email"
                fieldSize="sm"
                value={accountDetails.email}
                onChange={handleAccountDetailsChange}
              />
              <Select id="role" name="role" label="Role" fieldSize="sm" disabled>
                <option>{userRoleText(accountDetails.role)}</option>
              </Select>
            </div>
          </div>
        ) : (
          <div className="CardStack__body">
            <div className="CardStack__grid">
              <div className="CardStack__infoItem">
                <label className="Label Label--sm">First name</label>
                <div className="CardStack__infoItem__value">{profile.data.firstName}</div>
              </div>

              <div className="CardStack__infoItem">
                <label className="Label Label--sm">Last name</label>
                <div className="CardStack__infoItem__value">{profile.data.lastName}</div>
              </div>

              <div className="CardStack__infoItem">
                <label className="Label Label--sm">Email</label>
                <div className="CardStack__infoItem__value">{profile.data.email}</div>
              </div>

              <div className="CardStack__infoItem">
                <label className="Label Label--sm">Role</label>
                <div className="CardStack__infoItem__value">{userRoleText(profile.data.role)}</div>
              </div>

              <div className="CardStack__infoItem">
                <label className="Label Label--sm">Password</label>
                <div className="CardStack__infoItem__value">
                  <Link onClick={goToResetPassword}>Reset password</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditAccount ? (
          <div className="CardStack__buttons">
            <Button variant="tertiary" size="sm" type="reset">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={profile.status === "PENDING"}
              disabled={isSubmitDisabled}
            >
              Confirm
            </Button>
          </div>
        ) : null}
      </form>
    );
  };

  const renderOrganization = () => {
    return (
      <form
        className="CardStack__card"
        {...(isEditOrganization
          ? {
              onSubmit: handleOrganizationEditSubmit,
              onReset: handleOrganizationEditCancel,
            }
          : {})}
      >
        {isEditOrganization ? (
          <div className="CardStack__grid">
            <Input
              id="name"
              name="name"
              label="Name"
              fieldSize="sm"
              value={organizationDetails.name}
              onChange={handleOrgDetailsChange}
            />

            <Input
              id="privacyPolicyLink"
              name="privacyPolicyLink"
              label="Privacy Policy Link"
              fieldSize="sm"
              value={organizationDetails.privacyPolicyLink}
              onChange={handleOrgDetailsChange}
            />
          </div>
        ) : (
          <div className="CardStack__grid">
            <div className="CardStack__infoItem">
              <label className="Label Label--sm">Name</label>
              <div className="CardStack__infoItem__value">{organization.data.name}</div>
            </div>

            <div className="CardStack__infoItem">
              <label className="Label Label--sm">Privacy Policy Link</label>
              <div className="CardStack__infoItem__value">
                {organization.data.privacyPolicyLink ? (
                  <Link href={organization.data.privacyPolicyLink} target="_blank">
                    {organization.data.privacyPolicyLink}
                  </Link>
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>
        )}
        <div className="Label Label--sm">
          <InfoTooltip
            infoText="If the approver flow is enabled, the person who uploads the
            disbursement will not be able to submit it. Another permissioned
            user must approve the disbursement to start it."
          >
            <Checkbox
              fieldSize="sm"
              className="CardStack__infoItem__value"
              id="is-approval-required"
              label="Approval required"
              disabled={
                !isEditOrganization ||
                !["owner", "financial_controller"].includes(profile.data.role || "")
              }
              checked={isApprovalRequired}
              onChange={(e) => setIsApprovalRequired(e.target.checked)}
            />
          </InfoTooltip>
        </div>
        <ImageUploadInput isReadOnly={!isEditOrganization} />

        {isEditOrganization ? (
          <div className="CardStack__buttons">
            <Button variant="tertiary" size="sm" type="reset">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={
                organizationDetails.name === organization.data.name &&
                organizationDetails.privacyPolicyLink === organization.data.privacyPolicyLink &&
                !imageFile &&
                isApprovalRequired === organization.data.isApprovalRequired
              }
              isLoading={profile.status === "PENDING"}
            >
              Confirm
            </Button>
          </div>
        ) : null}
      </form>
    );
  };

  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Profile
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        {profile.errorString ? (
          <Notification variant="error" title="Error">
            <ErrorWithExtras
              appError={{
                message: profile.errorString,
                extras: profile.errorExtras,
              }}
            />
          </Notification>
        ) : null}

        {organization.errorString ? (
          <Notification variant="error" title="Error">
            <ErrorWithExtras
              appError={{
                message: organization.errorString,
                extras: organization.errorExtras,
              }}
            />
          </Notification>
        ) : null}

        {profile.updateMessage || organization.updateMessage ? (
          <NotificationWithButtons
            variant="success"
            title={profile.updateMessage ? "Profile updated" : "Organization updated"}
            buttons={[
              {
                label: "Dismiss",
                onClick: () => {
                  dispatch(clearUpdateMessageAction());
                  dispatch(orgClearUpdateMessageAction());
                },
              },
            ]}
          >
            {profile.updateMessage || organization.updateMessage}
          </NotificationWithButtons>
        ) : null}

        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <InfoTooltip infoText="View your personal account details as set up by your account owner">
                Personal details
              </InfoTooltip>

              {isEditAccount ? null : (
                <DropdownMenu triggerEl={<MoreMenuButton />}>
                  <DropdownMenu.Item
                    onClick={() => {
                      setIsEditAccount(true);
                      setAccountDetails({
                        id: profile.data.id,
                        firstName: profile.data.firstName,
                        lastName: profile.data.lastName,
                        email: profile.data.email,
                        role: profile.data.role,
                      });
                    }}
                  >
                    Edit details
                  </DropdownMenu.Item>
                </DropdownMenu>
              )}
            </div>

            {renderAccount()}
          </div>
        </Card>

        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">
              <InfoTooltip infoText="View your organization’s account details as set up by your account owner">
                Organization
              </InfoTooltip>

              {!isRoleAccepted || isEditOrganization ? null : (
                <DropdownMenu triggerEl={<MoreMenuButton />}>
                  <DropdownMenu.Item
                    onClick={() => {
                      setIsEditOrganization(true);
                      setOrganizationDetails({
                        name: organization.data.name,
                        privacyPolicyLink: organization.data.privacyPolicyLink,
                        logo: organization.data.logo,
                      });
                      setIsApprovalRequired(Boolean(organization.data.isApprovalRequired));
                    }}
                  >
                    Edit details
                  </DropdownMenu.Item>
                </DropdownMenu>
              )}
            </div>

            {renderOrganization()}
          </div>
        </Card>

        <Card>
          <div className="CardStack__card">
            <div className="CardStack__title">Sign out</div>

            <div className="CardStack__body">
              <div className="Note">
                <Link onClick={handleSignOut}>Click here</Link> to end your session and sign out of
                the dashboard.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
