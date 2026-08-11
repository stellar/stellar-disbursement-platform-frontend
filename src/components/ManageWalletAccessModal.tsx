import { useEffect, useMemo, useState } from "react";

import { Button, Modal, Notification, RadioButton, Select } from "@stellar/design-system";

import { ErrorWithExtras } from "@/components/ErrorWithExtras";

import { USER_ROLES_ARRAY } from "@/constants/settings";

import { useGrantWalletMembership } from "@/apiQueries/useGrantWalletMembership";
import { useRevokeWalletMembership } from "@/apiQueries/useRevokeWalletMembership";
import { useUsers } from "@/apiQueries/useUsers";
import { useWalletMemberships } from "@/apiQueries/useWalletMemberships";
import {
  WalletCapabilities,
  useWalletRoleCapabilities,
} from "@/apiQueries/useWalletRoleCapabilities";

import { userRoleText } from "@/helpers/userRoleText";

import { UserRole } from "@/types";

// The owner role is always tenant-wide, so it cannot be granted per account.
const WALLET_SCOPED_ROLES: UserRole[] = USER_ROLES_ARRAY.filter((r) => r !== "owner");

// Human labels for the write actions the capabilities endpoint reports, grouped so a full set
// reads as two short phrases instead of seven. WHICH role yields which of these is only ever the
// server's answer — this list names the actions, it does not map them to roles.
const CAPABILITY_GROUPS: {
  title: string;
  actions: { key: keyof WalletCapabilities; verb: string }[];
}[] = [
  {
    title: "Disbursements",
    actions: [
      { key: "can_create_disbursement", verb: "create" },
      { key: "can_start_disbursement", verb: "start" },
      { key: "can_pause_disbursement", verb: "pause" },
      { key: "can_cancel_disbursement", verb: "cancel" },
    ],
  },
  {
    title: "Payments",
    actions: [
      { key: "can_create_payment", verb: "create" },
      { key: "can_retry_payment", verb: "retry" },
      { key: "can_cancel_payment", verb: "cancel" },
    ],
  },
];

// An empty write set is "view only", not "nothing": the membership row itself is what makes the
// account visible to the member, and read visibility is deliberately outside the capability
// matrix. That is why such roles are annotated rather than disabled — granting an account's
// activity to someone read-only is a real thing an owner may want, and disabling the option would
// take it away while claiming the grant is a no-op, which it isn't.
const VIEW_ONLY_TEXT = "View only — can see this account, but cannot act on it";

// One line saying what the server reports this role would yield here.
const capabilitiesText = (capabilities: WalletCapabilities) => {
  const granted = CAPABILITY_GROUPS.flatMap(({ title, actions }) => {
    const verbs = actions.filter(({ key }) => capabilities[key]).map(({ verb }) => verb);
    return verbs.length > 0 ? [`${title}: ${verbs.join(", ")}`] : [];
  });

  return granted.length > 0 ? granted.join(" · ") : VIEW_ONLY_TEXT;
};

// The outcome lines above stand alone, so they start capitalised; this splices one mid-sentence.
const lowerFirst = (text: string) => `${text.charAt(0).toLowerCase()}${text.slice(1)}`;

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
  // Revoking is a money-permission change, so it is two-step: the first click arms one row
  // (swapping its action to Cancel / Confirm revoke), the second actually revokes.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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
      setConfirmingId(null);
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

  // Owners are withheld from the picker rather than allowed and rejected on submit: an owner
  // short-circuits both gates, so the row would confer nothing and the backend 400s it. Counting
  // them lets the UI say why the list is shorter than the team.
  const hiddenOwnerCount = useMemo(
    () => (users ?? []).filter((u) => u.is_active && (u.roles ?? []).includes("owner")).length,
    [users],
  );

  const selectedUser = useMemo(
    () => grantableUsers.find((u) => u.id === userId) ?? null,
    [grantableUsers, userId],
  );
  const selectedUserName = selectedUser ? selectedUser.first_name : "this user";
  const selectedUserRoleText = userRoleText(selectedUser?.roles?.[0]);

  // What each role would actually yield for the chosen grantee on this account. Nothing is
  // requested until a grantee is picked, and the answers come from the server — the frontend
  // does not hold a copy of the capability matrix.
  const {
    byRole,
    isLoading: capabilitiesLoading,
    error: capabilitiesError,
  } = useWalletRoleCapabilities(visible ? walletId : null, userId || null, WALLET_SCOPED_ROLES);

  const roleOutcomes = useMemo(
    () =>
      byRole.map(({ role: outcomeRole, capabilities }) => ({
        role: outcomeRole,
        text: capabilities ? capabilitiesText(capabilities) : null,
      })),
    [byRole],
  );

  // For some grantees every role produces an identical answer — a global developer fails the
  // tenant-wide write gate before any membership is consulted, so the five options differ only in
  // what gets stored. Say that once rather than repeating one annotation five times.
  const uniformOutcome = useMemo(() => {
    if (roleOutcomes.length === 0 || roleOutcomes.some((outcome) => outcome.text === null)) {
      return null;
    }
    const [first, ...rest] = roleOutcomes;
    return rest.every((outcome) => outcome.text === first.text) ? first.text : null;
  }, [roleOutcomes]);

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
                {confirmingId === m.id ? (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className="Note">Remove this member's access?</span>
                    <Button
                      size="sm"
                      variant="tertiary"
                      onClick={() => setConfirmingId(null)}
                      disabled={revoke.isPending}
                    >
                      Cancel
                    </Button>
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
                          {
                            onSettled: () => {
                              setRevokingId(null);
                              setConfirmingId(null);
                            },
                          },
                        );
                      }}
                      isLoading={revoke.isPending && revokingId === m.id}
                      disabled={revoke.isPending}
                    >
                      Confirm revoke
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmingId(m.id)}
                    disabled={revoke.isPending}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))
          ) : (
            <span className="Note">No members yet. Grant access below.</span>
          )}
        </div>

        <form onSubmit={handleGrant}>
          <Select
            fieldSize="sm"
            id="grant-user"
            name="grant-user"
            label="User"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              // A role picked for the previous grantee can mean something entirely different for
              // this one, so make the operator choose again against the new annotations.
              setRole("");
            }}
          >
            <option value="">Select a user</option>
            {grantableUsers.map((u) => (
              <option value={u.id} key={u.id}>
                {`${u.first_name} ${u.last_name} (${u.email})`}
              </option>
            ))}
          </Select>

          {hiddenOwnerCount > 0 ? (
            <div className="Note" style={{ marginTop: "0.5rem" }}>
              {`${hiddenOwnerCount === 1 ? "1 owner is" : `${hiddenOwnerCount} owners are`} not listed. An owner already acts on every account, so a membership for one would change nothing.`}
            </div>
          ) : null}

          <fieldset style={{ border: "none", padding: 0, margin: "1rem 0 0" }}>
            <legend
              style={{ padding: 0, marginBottom: "0.25rem", fontSize: "0.875rem", fontWeight: 500 }}
            >
              Role on this account
            </legend>

            <div className="Note" style={{ marginBottom: "0.5rem" }}>
              {selectedUser
                ? `A membership can only narrow ${selectedUserName}'s tenant-wide role${
                    selectedUserRoleText ? ` (${selectedUserRoleText})` : ""
                  } on this account — it never adds capability they do not already have.`
                : "Select a user first: what a role grants depends on the tenant-wide role of the person you grant it to."}
            </div>

            {selectedUser && capabilitiesLoading ? (
              <div className="Note" style={{ marginBottom: "0.5rem" }}>
                Checking what each role would grant…
              </div>
            ) : null}

            {selectedUser && capabilitiesError ? (
              <Notification variant="warning" title="Could not check what each role would grant">
                <ErrorWithExtras appError={capabilitiesError} />
              </Notification>
            ) : null}

            {/* Every role yields the same thing for this grantee: the picker is decorative, and
                saying so once beats five identical annotations. */}
            {uniformOutcome ? (
              <div className="Note" style={{ marginBottom: "0.5rem" }}>
                {`Every role below gives ${selectedUserName} exactly the same access here: ${lowerFirst(uniformOutcome)}. The role you pick is recorded, but it does not change what they can do on this account.`}
              </div>
            ) : null}

            {WALLET_SCOPED_ROLES.map((r) => {
              // In the uniform case the per-role line is suppressed: it is already stated above.
              const annotation = uniformOutcome
                ? null
                : (roleOutcomes.find((outcome) => outcome.role === r)?.text ?? null);

              return (
                <div key={r} style={{ padding: "0.25rem 0" }}>
                  <RadioButton
                    fieldSize="sm"
                    id={`grant-role-${r}`}
                    name="grant-role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    disabled={!userId || grant.isPending}
                    label={
                      <span style={{ display: "block" }}>
                        <span style={{ display: "block" }}>{userRoleText(r)}</span>
                        {annotation ? (
                          <span className="Note" style={{ display: "block" }}>
                            {annotation}
                          </span>
                        ) : null}
                      </span>
                    }
                  />
                </div>
              );
            })}
          </fieldset>

          <div style={{ marginTop: "1rem" }}>
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
