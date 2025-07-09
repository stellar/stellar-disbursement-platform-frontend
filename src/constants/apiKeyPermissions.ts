export interface PermissionResource {
  key: string;
  label: string;
  hasWrite: boolean;
}

export const API_KEY_PERMISSION_RESOURCES: PermissionResource[] = [
  { key: "disbursements", label: "Disbursements", hasWrite: true },
  { key: "receivers", label: "Receivers", hasWrite: true },
  { key: "payments", label: "Payments", hasWrite: true },
  { key: "organization", label: "Organization", hasWrite: true },
  { key: "users", label: "Users", hasWrite: true },
  { key: "wallets", label: "Wallets", hasWrite: true },
  { key: "statistics", label: "Statistics", hasWrite: false },
  { key: "exports", label: "Exports", hasWrite: false },
] as const;
