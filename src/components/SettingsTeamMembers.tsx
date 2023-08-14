import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Card, Icon, Modal } from "@stellar/design-system";

import { InfoTooltip } from "components/InfoTooltip";
import { DropdownMenu } from "components/DropdownMenu";
import { MoreMenuButton } from "components/MoreMenuButton";
import { Table } from "components/Table";
import { NewUserModal } from "components/NewUserModal";

import { AppDispatch } from "store";
import {
  changeUserRoleAction,
  changeUserStatusAction,
  createNewUserAction,
  getUsersAction,
  resetNewUserAction,
} from "store/ducks/users";
import { USER_ROLES_ARRAY } from "constants/settings";
import { useRedux } from "hooks/useRedux";
import { userRoleText } from "helpers/userRoleText";
import { ApiUser, NewUser, UserRole } from "types";

interface SettingsTeamMembersProps {
  getUserNameText: (firstName?: string, lastName?: string) => void;
}

export const SettingsTeamMembers = ({
  getUserNameText,
}: SettingsTeamMembersProps) => {
  const { users } = useRedux("users");

  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isNewUserModalVisible, setIsNewUserModalVisible] = useState(false);
  const [newRole, setNewRole] = useState<UserRole | null>(null);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!users.status) {
      dispatch(getUsersAction());
    }
  }, [dispatch, users.status]);

  useEffect(() => {
    if (users.updatedUser.actionType) {
      dispatch(getUsersAction());
      hideModal();
    }
  }, [dispatch, users.updatedUser.actionType]);

  useEffect(() => {
    if (users.newUser.id) {
      dispatch(getUsersAction());
      hideModal();
    }
  }, [dispatch, users.newUser.id]);

  const hideModal = () => {
    setIsStatusModalVisible(false);
    setIsRoleModalVisible(false);
    setIsNewUserModalVisible(false);
    setSelectedUser(null);
    setNewRole(null);
  };

  const handleStatusChange = (userId: string, isActive: boolean) => {
    dispatch(changeUserStatusAction({ userId, isActive }));
  };

  const handleRoleChange = (userId: string, userRole: UserRole) => {
    dispatch(changeUserRoleAction({ userId, role: userRole }));
  };

  const handleSubmitNewUser = (newUser: NewUser) => {
    dispatch(createNewUserAction(newUser));
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
        }}
      >
        {`Change role to ${userRoleText(r)}`}
      </DropdownMenu.Item>
    ));
  };

  const renderUsersContent = () => {
    if (users.errorString) {
      return null;
    }

    if (users.items.length === 0) {
      return <div className="Note">There are no team members</div>;
    }

    return (
      <div className="UsersTable">
        <Table>
          <Table.Header>
            <Table.HeaderCell width="12rem">Member</Table.HeaderCell>
            <Table.HeaderCell width="9rem">Role</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell> </Table.HeaderCell>
          </Table.Header>

          <Table.Body>
            {users.items.map((u) => (
              <Table.BodyRow key={u.id}>
                <Table.BodyCell width="12rem">
                  {u.first_name || u.last_name
                    ? `${u.first_name} ${u.last_name}`
                    : u.email}
                </Table.BodyCell>
                <Table.BodyCell width="9rem">
                  {userRoleText(u.roles?.[0])}
                </Table.BodyCell>
                <Table.BodyCell>
                  {u.is_active ? "Active" : "Inactive"}
                </Table.BodyCell>
                <Table.BodyCell>
                  <div className="FlexCellRight">
                    <DropdownMenu triggerEl={<MoreMenuButton />}>
                      <>{renderRoleItems(u)}</>
                      <DropdownMenu.Item
                        onClick={() => {
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
                dispatch(resetNewUserAction());
              }}
            >
              <Icon.PersonAdd />
            </div>
          </div>

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
            } for ${getUserNameText(
              selectedUser?.first_name,
              selectedUser?.last_name,
            )}.`}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            onClick={hideModal}
            isLoading={users.updatedUser.status === "PENDING"}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              if (selectedUser?.id) {
                handleStatusChange(selectedUser.id, !selectedUser?.is_active);
              }
            }}
            isLoading={users.updatedUser.status === "PENDING"}
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
          <Button
            size="sm"
            variant="secondary"
            onClick={hideModal}
            isLoading={users.updatedUser.status === "PENDING"}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              if (selectedUser?.id && newRole) {
                handleRoleChange(selectedUser.id, newRole);
              }
            }}
            isLoading={users.updatedUser.status === "PENDING"}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New user modal */}
      <NewUserModal
        visible={isNewUserModalVisible}
        onClose={hideModal}
        onSubmit={handleSubmitNewUser}
        isLoading={users.newUser.status === "PENDING"}
      />
    </>
  );
};
