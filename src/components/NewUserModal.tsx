import { useEffect, useState } from "react";
import { Button, Icon, Input, Modal, Select, Notification } from "@stellar/design-system";
import { InfoTooltip } from "components/InfoTooltip";
import { ErrorWithExtras } from "components/ErrorWithExtras";
import { USER_ROLES_ARRAY } from "constants/settings";
import { userRoleText } from "helpers/userRoleText";
import { usePrevious } from "hooks/usePrevious";
import { NewUser, UserRole } from "types";

interface NewUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newUser: NewUser) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  errorMessage,
}: NewUserModalProps) => {
  type FormItems = {
    fname?: string;
    lname?: string;
    email?: string;
    role?: UserRole;
  };

  const initForm = {
    fname: "",
    lname: "",
    email: "",
    role: undefined,
  };

  const [formItems, setFormItems] = useState<FormItems>(initForm);
  const [formError, setFormError] = useState<string[]>([]);

  const iPprevVisible = usePrevious(visible);

  useEffect(() => {
    // Clear the form when modal closes
    if (iPprevVisible && !visible) {
      setFormItems({});
      setFormError([]);
    }
  }, [visible, iPprevVisible]);

  const handleClose = () => {
    onClose();
  };

  const filledItems = () => Object.values(formItems).filter((v) => v);

  const canSubmit = formError.length === 0 && filledItems().length === 4;

  const removeItemFromErrors = (id: string) => {
    setFormError(formError.filter((e) => e !== id));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (errorMessage) {
      onResetQuery();
    }
    removeItemFromErrors(event.target.id);
    setFormItems({
      ...formItems,
      [event.target.id]: event.target.value,
    });
  };

  const handleValidate = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (!event.target.value) {
      if (!formError.includes(event.target.value)) {
        setFormError([...formError, event.target.id]);
      }
    }
  };

  const itemHasError = (id: string, label: string) => {
    return formError.includes(id) ? `${label} is required` : undefined;
  };

  const roleDescription = (role?: UserRole) => {
    switch (role) {
      case "business":
        return "Has read access to data, cannot submit new disbursements or manage users";
      case "developer":
        return "Has access to help technically troubleshoot, cannot view data or submit disbursements";
      case "financial_controller":
        return "Has read access to data, can submit new disbursements, cannot manage users";
      case "owner":
        return "Has full access over disbursements and account management";
      default:
        return "Select a role to see the level of permissions";
    }
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>
        <InfoTooltip
          infoText="New users will receive an email invitation to join your
          organization with the defined role"
          placement="bottom"
        >
          Invite team members
        </InfoTooltip>
      </Modal.Heading>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          // Checking all fields manually to make TS happy in onSubmit method
          if (!(formItems.fname && formItems.lname && formItems.email && formItems.role)) {
            return;
          }

          onSubmit({
            first_name: formItems.fname,
            last_name: formItems.lname,
            email: formItems.email,
            role: formItems.role,
          });
        }}
        onReset={handleClose}
      >
        <Modal.Body>
          {errorMessage ? (
            <Notification variant="error" title="Error">
              <ErrorWithExtras
                appError={{
                  message: errorMessage,
                }}
              />
            </Notification>
          ) : null}

          <div className="NewUserForm">
            <Input
              fieldSize="sm"
              id="fname"
              name="fname"
              type="text"
              label="First name"
              value={formItems.fname}
              onChange={handleChange}
              onBlur={handleValidate}
              error={itemHasError("fname", "First name")}
            />
            <Input
              fieldSize="sm"
              id="lname"
              name="lname"
              type="text"
              label="Last name"
              value={formItems.lname}
              onChange={handleChange}
              onBlur={handleValidate}
              error={itemHasError("lname", "Last name")}
            />
            <Input
              fieldSize="sm"
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={formItems.email}
              onChange={handleChange}
              onBlur={handleValidate}
              error={itemHasError("email", "Email address")}
            />
            <Select
              fieldSize="sm"
              id="role"
              name="role"
              label="Role"
              value={formItems.role}
              onChange={handleChange}
              onBlur={handleValidate}
              error={itemHasError("role", "Role")}
            >
              <option></option>
              {USER_ROLES_ARRAY.map((r) => (
                <option value={r} key={r}>
                  {userRoleText(r)}
                </option>
              ))}
            </Select>
            <div className="RoleDescription">
              <Icon.Key01 />
              <span>{roleDescription(formItems.role)}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button size="md" variant="tertiary" type="reset" isLoading={isLoading}>
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            type="submit"
            disabled={!canSubmit}
            isLoading={isLoading}
          >
            Send invite
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};
