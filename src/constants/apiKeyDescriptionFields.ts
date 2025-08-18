export interface ApiKeyFieldDescription {
  name: string;
  description: string;
  example: string;
}

export const API_KEY_FIELD_DESCRIPTIONS: ApiKeyFieldDescription[] = [
  {
    name: "id",
    description: "Unique identifier of this key.",
    example: `"94dd6584-43ae-4162-b609-8e5cca0117f1"`,
  },
  {
    name: "name",
    description: "Human-readable name for the key.",
    example: "Reporting Service Key",
  },
  {
    name: "key",
    description:
      "API Key. Only returned during creation, then stored as hashed format.",
    example: `"sdp_123abc..a87c9f8370a8480a3c26bb29e0f6f8b2"`,
  },
  {
    name: "expiry_date",
    description: "Optional expiration date. Null means never expires.",
    example: `"2025-04-25T14:55:12Z"`,
  },
  {
    name: "permissions",
    description:
      "Array of read and write permissions associated with this key.",
    example: `["read:statistics", "read:exports", "read:payments"]`,
  },
  {
    name: "allowed_ips",
    description:
      "IPs and IP ranges allowed. Empty array means no restrictions.",
    example: `["203.0.113.5", "198.51.100.0/24"]`,
  },
  {
    name: "enabled",
    description:
      "Whether the API key is active and can be used for authentication.",
    example: "true",
  },
  {
    name: "created_at",
    description: "Timestamp when this key was created.",
    example: `"2025-04-25T14:55:12Z"`,
  },
  {
    name: "created_by",
    description: "ID of the User that created this API Key.",
    example: `"6b46e82a-35d0-4ad6-bf43-d7125cf82b63"`,
  },
  {
    name: "updated_at",
    description: "Timestamp when this key was last updated.",
    example: `"2025-04-25T14:55:12Z"`,
  },
  {
    name: "updated_by",
    description: "ID of the User that updated this API Key.",
    example: `"8a9fa09c-f5ea-42da-9121-69260f0bdee1"`,
  },
  {
    name: "last_used_at",
    description: "Timestamp when this key was last used.",
    example: `"2025-04-25T14:55:12Z"`,
  },
] as const;
