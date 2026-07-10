import { useEffect, useMemo, useState } from "react";

import { Button, Modal, Notification, Select } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { USER_ROLES_ARRAY } from "@/constants/settings";

import { useGrantWalletMembership } from "@/apiQueries/useGrantWalletMembership";
import { useRevokeWalletMembership } from "@/apiQueries/useRevokeWalletMembership";
import { useUsers } from "@/apiQueries/useUsers";
import { useWalletMemberships } from "@/apiQueries/useWalletMemberships";

import { userRoleText } from "@/helpers/userRoleText";

import { UserRole } from "@/types";

// The owner role is always tenant-wide, so it cannot be granted per account.
const WALLET_SCOPED_ROLES: UserRole[] = USER_ROLES_ARRAY.filter((r) => r !== "owner");

interface ManageWalletAccessModalProps {
  visible: boolean;
  walletId: string | null;
  walletName: string;
  onClose: () => void;
}

// Owner-only "Manage access" panel for one distribution account: shows who has access, grants a
// user access at a wallet-scoped role, and revokes access.
export const ManageWalletAccessModal: React.FC<ManageWalletAccessModalProps> = ({
  visible,
  walletId,
  walletName,
  onClose,
}: ManageWalletAccessModalProps) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  // Which membership is mid-revoke, so only its button shows a spinner (not every row's).
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const { data: memberships, isLoading: membershipsLoading } = useWalletMemberships(
    visible ? walletId : null,
  );
  const { data: users } = useUsers();
  const grant = useGrantWalletMembership();
  const revoke = useRevokeWalletMembership();

  useEffect(() => {
    if (!visible) {
      setUserId("");
      setRole("");
      setRevokingId(null);
      grant.reset();
      revoke.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const usersById = useMemo(() => {
    const map: Record<string, string> = {};
    (users ?? []).forEach((u) => {
      map[u.id] = `${u.first_name} ${u.last_name} (${u.email})`;
    });
    return map;
  }, [users]);

  // Active users who are not tenant owners (owners already see every account) are grantable.
  const grantableUsers = useMemo(
    () => (users ?? []).filter((u) => u.is_active && !(u.roles ?? []).includes("owner")),
    [users],
  );

  const handleGrant = (event: React.FormEvent) => {
    event.preventDefault();
    if (!walletId || !userId || !role) {
      return;
    }
    grant.mutate(
      { walletId, userId, role },
      {
        onSuccess: () => {
          setUserId("");
          setRole("");
        },
      },
    );
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>{`Manage access — ${walletName}`}</Modal.Heading>
      <Modal.Body>
        {grant.error ? (
          <Notification variant="error" title="Could not grant access" isFilled={true}>
            <ErrorWithExtras appError={grant.error} />
          </Notification>
        ) : null}
        {revoke.error ? (
          <Notification variant="error" title="Could not revoke access" isFilled={true}>
            <ErrorWithExtras appError={revoke.error} />
          </Notification>
        ) : null}

        <div className="Note" style={{ marginBottom: "0.75rem" }}>
          Owners have access to every account and are not listed here. Only members granted below
          can act on this account.
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          {membershipsLoading ? (
            <span className="Note">Loading…</span>
          ) : memberships && memberships.length > 0 ? (
            memberships.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--sds-clr-gray-06)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{usersById[m.user_id] ?? m.user_id}</div>
                  <div className="Note">{userRoleText(m.role)}</div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (!walletId) {
                      return;
                    }
                    setRevokingId(m.id);
                    revoke.mutate(
                      { walletId, membershipId: m.id },
                      { onSettled: () => setRevokingId(null) },
                    );
                  }}
                  isLoading={revoke.isPending && revokingId === m.id}
                  disabled={revoke.isPending}
                >
                  Revoke
                </Button>
              </div>
            ))
          ) : (
            <span className="Note">No members yet. Grant access below.</span>
          )}
        </div>

        <form onSubmit={handleGrant}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
            <Select
              fieldSize="sm"
              id="grant-user"
              name="grant-user"
              label="User"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">Select a user</option>
              {grantableUsers.map((u) => (
                <option value={u.id} key={u.id}>
                  {`${u.first_name} ${u.last_name} (${u.email})`}
                </option>
              ))}
            </Select>
            <Select
              fieldSize="sm"
              id="grant-role"
              name="grant-role"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="">Select a role</option>
              {WALLET_SCOPED_ROLES.map((r) => (
                <option value={r} key={r}>
                  {userRoleText(r)}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={!userId || !role}
              isLoading={grant.isPending}
            >
              Grant
            </Button>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button size="md" variant="tertiary" onClick={onClose}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
