import { useEffect, useState } from "react";
import { Button, Card, Icon, Modal, Notification, Select } from "@stellar/design-system";

import { InfoTooltip } from "@/components/InfoTooltip";
import { DropdownMenu } from "@/components/DropdownMenu";
import { MoreMenuButton } from "@/components/MoreMenuButton";
import { Table } from "@/components/Table";
import { NewUserModal } from "@/components/NewUserModal";
import { LoadingContent } from "@/components/LoadingContent";
import { NotificationWithButtons } from "@/components/NotificationWithButtons";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { USER_ROLES_ARRAY } from "@/constants/settings";
import { userRoleText } from "@/helpers/userRoleText";

import { useUsers } from "@/apiQueries/useUsers";
import { useUpdateUserRole } from "@/apiQueries/useUpdateUserRole";
import { useUpdateUserStatus } from "@/apiQueries/useUpdateUserStatus";
import { useCreateNewUser } from "@/apiQueries/useCreateNewUser";
import { useDistributionWallets } from "@/apiQueries/useDistributionWallets";

import { useRedux } from "@/hooks/useRedux";

import { ApiUser, NewUser, UserRole } from "@/types";

export const SettingsTeamMembers = () => {
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isNewUserModalVisible, setIsNewUserModalVisible] = useState(false);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [updatedUser, setUpdatedUser] = useState<{
    id: string;
    role?: UserRole | null;
    isActive?: boolean;
  } | null>(null);
  // An invite whose form is filled in but whose distribution account is still unchosen.
  const [pendingUser, setPendingUser] = useState<NewUser | null>(null);
  const [inviteWalletId, setInviteWalletId] = useState("");

  const { userAccount } = useRedux("userAccount");
  const { data: distributionWallets } = useDistributionWallets(userAccount.isAuthenticated);
  const isMultiWallet = (distributionWallets?.length ?? 0) >= 2;

  const {
    data: usersData,
    error: usersError,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    refetch: getUsers,
  } = useUsers();

  const {
    error: roleError,
    isPending: isRolePending,
    isSuccess: isRoleSuccess,
    isError: isRoleError,
    mutateAsync: updateRole,
    reset: resetRole,
  } = useUpdateUserRole();

  const {
    error: statusError,
    isPending: isStatusPending,
    isSuccess: isStatusSuccess,
    isError: isStatusError,
    mutateAsync: updateStatus,
    reset: resetStatus,
  } = useUpdateUserStatus();

  const {
    data: newUser,
    error: newUserError,
    isPending: isNewUserPending,
    isSuccess: isNewUserSuccess,
    isError: isNewUserError,
    mutateAsync: createNewUser,
    reset: resetNewUser,
  } = useCreateNewUser();

  useEffect(() => {
    if (isRoleSuccess || isStatusSuccess) {
      getUsers();
      hideModal();
    }

    if (isRoleError || isStatusError) {
      hideModal();
    }

    return () => {
      if (isRoleSuccess || isRoleError) {
        resetRole();
      }

      if (isStatusSuccess || isStatusError) {
        resetStatus();
      }
    };
  }, [
    getUsers,
    isRoleError,
    isRoleSuccess,
    isStatusError,
    isStatusSuccess,
    resetRole,
    resetStatus,
  ]);

  useEffect(() => {
    if (isNewUserSuccess) {
      getUsers();
      hideModal();
    }

    return () => {
      if (isNewUserSuccess) {
        resetNewUser();
      }
    };
  }, [getUsers, isNewUserSuccess, resetNewUser]);

  const getUserNameText = (firstName?: string, lastName?: string) => {
    if (firstName || lastName) {
      return `${firstName} ${lastName}`;
    }

    return "this user";
  };

  const hideModal = () => {
    setIsStatusModalVisible(false);
    setIsRoleModalVisible(false);
    setIsNewUserModalVisible(false);
    setSelectedUser(null);
    setNewRole(null);
    setPendingUser(null);
    setInviteWalletId("");
  };

  // Whether this invite has an account scope to decide. Owners are tenant-wide and get no
  // membership row at all (the backend 400s on owner + wallet_id), and on a single-account
  // tenant there is nothing to pick — in both cases asking would be noise, the same reason
  // ActiveWalletBar drops its switcher below two accounts.
  const needsAccountChoice = (role: UserRole) => isMultiWallet && role !== "owner";

  const submitInvite = (newUser: NewUser) => {
    const t = setTimeout(() => {
      createNewUser(newUser);
      clearTimeout(t);
    }, 100);
  };

  // Abandons the invite, dropping a failed attempt with it so the error does not follow the
  // next one into the form — the same clean-up NewUserModal does on its own close.
  const cancelAccountStep = () => {
    hideModal();

    if (isNewUserError) {
      resetNewUser();
    }
  };

  const renderRoleItems = (user: ApiUser) => {
    const currentRole = user?.roles?.[0];
    const acceptedRoles = USER_ROLES_ARRAY;
    const displayRoles = acceptedRoles.filter((r) => r !== currentRole);

    return displayRoles.map((r) => (
      <DropdownMenu.Item
        key={`${user.id}-${r}`}
        onClick={() => {
          setSelectedUser(user);
          setIsRoleModalVisible(true);
          setNewRole(r);
          resetRole();
          resetStatus();
        }}
      >
        {`Change role to ${userRoleText(r)}`}
      </DropdownMenu.Item>
    ));
  };

  const renderUpdateUserSuccessMessage = () => {
    const user = usersData?.find((u) => u.id === updatedUser?.id);

    if (isStatusSuccess) {
      return `Account of ${getUserNameText(
        user?.first_name,
        user?.last_name,
      )} was updated successfully. New status is ${updatedUser?.isActive ? "active" : "inactive"}.`;
    }

    if (isRoleSuccess) {
      return `Account of ${getUserNameText(
        user?.first_name,
        user?.last_name,
      )} was updated successfully. New role is ${userRoleText(updatedUser?.role)}.`;
    }

    return "Account was updated successfully.";
  };

  const renderUsersContent = () => {
    if (isUsersLoading || isUsersFetching) {
      return <LoadingContent />;
    }

    if (!usersData || usersError) {
      return null;
    }

    if (usersData?.length === 0) {
      return <div className="Note">There are no team members</div>;
    }

    return (
      <div className="UsersTable">
        <Table>
          <Table.Header>
            <Table.HeaderCell>Member</Table.HeaderCell>
            <Table.HeaderCell width="12rem">Email</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell> </Table.HeaderCell>
          </Table.Header>

          <Table.Body>
            {usersData.map((u) => (
              <Table.BodyRow key={u.id}>
                <Table.BodyCell>
                  {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : u.email}
                </Table.BodyCell>
                <Table.BodyCell width="12rem">{u.email}</Table.BodyCell>
                <Table.BodyCell>{userRoleText(u.roles?.[0])}</Table.BodyCell>
                <Table.BodyCell>{u.is_active ? "Active" : "Inactive"}</Table.BodyCell>
                <Table.BodyCell>
                  <div className="FlexCellRight">
                    <DropdownMenu triggerEl={<MoreMenuButton />}>
                      <>{renderRoleItems(u)}</>
                      <DropdownMenu.Item
                        onClick={() => {
                          resetRole();
                          resetStatus();
                          setSelectedUser(u);
                          setIsStatusModalVisible(true);
                        }}
                        isHighlight
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenu.Item>
                    </DropdownMenu>
                  </div>
                </Table.BodyCell>
              </Table.BodyRow>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  };

  return (
    <>
      <Card>
        <div className="CardStack__card">
          <div className="CardStack__title">
            <InfoTooltip infoText="All the users you have invited to your organization">
              Team members
            </InfoTooltip>

            <div
              role="button"
              className="CardStack__dropdownMenu"
              onClick={() => {
                setIsNewUserModalVisible(true);

                if (isNewUserSuccess) {
                  resetNewUser();
                }
              }}
            >
              <Icon.UserPlus02 />
            </div>
          </div>

          {usersError || roleError || statusError ? (
            <Notification variant="error" title="Error" isFilled={true}>
              <ErrorWithExtras appError={usersError || roleError || statusError} />
            </Notification>
          ) : null}

          {isRoleSuccess || isStatusSuccess ? (
            <NotificationWithButtons
              variant="success"
              title="Team member updated"
              buttons={[
                {
                  label: "Dismiss",
                  onClick: () => {
                    if (isRoleSuccess) {
                      resetRole();
                    }
                    if (isStatusSuccess) {
                      resetStatus();
                    }
                    setUpdatedUser(null);
                  },
                },
              ]}
            >
              {renderUpdateUserSuccessMessage()}
            </NotificationWithButtons>
          ) : null}

          {isNewUserSuccess ? (
            <NotificationWithButtons
              variant="success"
              title="New team member added"
              buttons={[
                {
                  label: "Dismiss",
                  onClick: () => {
                    resetNewUser();
                  },
                },
              ]}
            >
              {`Team member ${newUser.first_name} ${newUser.last_name} with role ${userRoleText(
                newUser.roles[0],
              )} was added successfully.`}
            </NotificationWithButtons>
          ) : null}

          {renderUsersContent()}
        </div>
      </Card>

      {/* Status modal */}
      <Modal visible={isStatusModalVisible} onClose={hideModal}>
        <Modal.Heading>
          {selectedUser?.is_active ? "Deactivate account" : "Activate account"}
        </Modal.Heading>
        <Modal.Body>
          <div>
            {`Please confirm account ${
              selectedUser?.is_active ? "deactivation" : "activation"
            } for ${getUserNameText(selectedUser?.first_name, selectedUser?.last_name)}.`}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button size="md" variant="tertiary" onClick={hideModal} isLoading={isStatusPending}>
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={() => {
              if (selectedUser?.id) {
                updateStatus({
                  userId: selectedUser.id,
                  isActive: !selectedUser?.is_active,
                });
                setUpdatedUser({
                  id: selectedUser.id,
                  isActive: !selectedUser?.is_active,
                });
              }
            }}
            isLoading={isStatusPending}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Role modal */}
      <Modal visible={isRoleModalVisible} onClose={hideModal}>
        <Modal.Heading>Change role</Modal.Heading>
        <Modal.Body>
          <div>
            {`Please confirm the role change from "${userRoleText(
              selectedUser?.roles?.[0],
            )}" to "${userRoleText(newRole)}" for ${getUserNameText(
              selectedUser?.first_name,
              selectedUser?.last_name,
            )}.`}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button size="md" variant="tertiary" onClick={hideModal} isLoading={isRolePending}>
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={() => {
              if (selectedUser?.id && newRole) {
                updateRole({ userId: selectedUser.id, role: newRole });
                setUpdatedUser({
                  id: selectedUser.id,
                  role: newRole,
                });
              }
            }}
            isLoading={isRolePending}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New user modal */}
      <NewUserModal
        visible={isNewUserModalVisible}
        onClose={() => {
          hideModal();

          if (isNewUserError) {
            resetNewUser();
          }
        }}
        onSubmit={(newUser: NewUser) => {
          if (isNewUserError) {
            resetNewUser();
          }

          // On a multi-account tenant a non-owner invite has to say which account it is for,
          // otherwise the backend silently scopes the member to the tenant default.
          if (needsAccountChoice(newUser.role)) {
            setIsNewUserModalVisible(false);
            setPendingUser(newUser);
            return;
          }

          submitInvite(newUser);
        }}
        onResetQuery={() => {
          resetNewUser();
        }}
        isLoading={isNewUserPending}
        errorMessage={newUserError?.message}
      />

      {/* Distribution account modal: the final step of an invite that has an account scope to
          decide, so a new member's access is chosen explicitly instead of defaulted silently. */}
      <Modal visible={Boolean(pendingUser)} onClose={cancelAccountStep}>
        <Modal.Heading>Select distribution account</Modal.Heading>
        <Modal.Body>
          {newUserError ? (
            <Notification variant="error" title="Error" isFilled={true}>
              <ErrorWithExtras appError={newUserError} />
            </Notification>
          ) : null}

          <div>
            {`${getUserNameText(
              pendingUser?.first_name,
              pendingUser?.last_name,
            )} will join as ${userRoleText(
              pendingUser?.role,
            )} and will only see and act on the account you choose here. An owner can change this later from Manage access.`}
          </div>

          <Select
            fieldSize="sm"
            id="invite-wallet"
            name="invite-wallet"
            label="Distribution account"
            value={inviteWalletId}
            onChange={(event) => {
              if (isNewUserError) {
                resetNewUser();
              }
              setInviteWalletId(event.target.value);
            }}
          >
            <option value="">Select an account</option>
            {(distributionWallets ?? []).map((w) => (
              <option value={w.id} key={w.id}>
                {`${w.name}${w.is_default ? " (default)" : ""}`}
              </option>
            ))}
          </Select>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="md"
            variant="tertiary"
            onClick={cancelAccountStep}
            isLoading={isNewUserPending}
          >
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={() => {
              if (pendingUser && inviteWalletId) {
                submitInvite({ ...pendingUser, wallet_id: inviteWalletId });
              }
            }}
            disabled={!inviteWalletId}
            isLoading={isNewUserPending}
          >
            Send invite
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
