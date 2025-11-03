import { Card, Input, Select, Notification } from "@stellar/design-system";
import { BigNumber } from "bignumber.js";

import { useAssetsByWallet } from "@/apiQueries/useAssetsByWallet";
import { useRegistrationContactTypes } from "@/apiQueries/useRegistrationContactTypes";
import { useVerificationTypes } from "@/apiQueries/useVerificationTypes";
import { useWallets } from "@/apiQueries/useWallets";
import { AssetAmount } from "@/components/AssetAmount";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Title } from "@/components/Title";
import { formatRegistrationContactType } from "@/helpers/formatRegistrationContactType";
import { formatUploadedFileDisplayName } from "@/helpers/formatUploadedFileDisplayName";
import { useAllBalances } from "@/hooks/useAllBalances";
import {
  AccountBalanceItem,
  ApiAsset,
  ApiWallet,
  Disbursement,
  DisbursementStep,
  hasWallet,
  isUserManagedWalletEnabled,
  RegistrationContactType,
  VerificationFieldMap,
} from "@/types";

import "./styles.scss";

const NONE_VERIFICATION_VALUE = "None";
const SEP24_VERIFICATION_VALUE = "SEP24_REGISTRATION";
const SDP_EMBEDDED_WALLET_NAME = "sdp embedded wallet";

const isSdpEmbeddedWallet = (walletName: string): boolean =>
  walletName.trim().toLowerCase() === SDP_EMBEDDED_WALLET_NAME;

interface DisbursementDetailsProps {
  variant: DisbursementStep;
  details?: Disbursement;
  futureBalance?: number;
  csvFile?: File;
  onChange?: (state: Disbursement) => void;
  onValidate?: (isValid: boolean) => void;
}

const initDetails: Disbursement = {
  id: "",
  name: "",
  registrationContactType: undefined,
  asset: {
    id: "",
    code: "",
  },
  wallet: {
    id: "",
    name: "",
  },
  verificationField: "",
  createdAt: "",
  status: "DRAFT",
  statusHistory: [],
  receiverRegistrationMessageTemplate: "",
  stats: undefined,
};

enum FieldId {
  NAME = "name",
  REGISTRATION_CONTACT_TYPE = "registration_contact_type",
  ASSET_CODE = "asset_code",
  WALLET_ID = "wallet_id",
  VERIFICATION_FIELD = "verification_field",
}

const isDisbursementValid = (inputs: Disbursement): boolean => {
  if (!inputs.name) {
    return false;
  }

  if (!inputs.registrationContactType) {
    return false;
  }

  if (!inputs.asset.code) {
    return false;
  }

  if (!hasWallet(inputs.registrationContactType)) {
    if (!inputs.wallet.id || !inputs.verificationField) {
      return false;
    }
  }

  return true;
};

interface DerivedFormState {
  isWalletAddressProvided: boolean;
  isWalletRegistrationEnabled: boolean;
  registrationOptions: RegistrationContactType[];
  walletOptions: ApiWallet[];
  assetOptions: ApiAsset[];
  verificationOptions: string[];
  selectValues: {
    registrationContactType: string;
    walletId: string;
    assetId: string;
    verificationField: string;
  };
  labels: {
    walletProvider: string;
    verification: string;
  };
  disabled: {
    registrationContactType: boolean;
    wallet: boolean;
    asset: boolean;
    verification: boolean;
  };
}

interface DeriveFormStateArgs {
  details: Disbursement;
  wallets?: ApiWallet[];
  walletAssets?: ApiAsset[];
  registrationContactTypes?: RegistrationContactType[];
  verificationTypes?: string[];
  allBalances?: AccountBalanceItem[];
  loading: {
    registrationContactTypes: boolean;
    wallets: boolean;
    walletAssets: boolean;
    verificationTypes: boolean;
  };
}

const deriveFormState = ({
  details,
  wallets,
  walletAssets,
  registrationContactTypes,
  verificationTypes,
  allBalances,
  loading,
}: DeriveFormStateArgs): DerivedFormState => {
  const isWalletAddressProvided = hasWallet(details.registrationContactType);
  const isWalletRegistrationEnabled = isUserManagedWalletEnabled(wallets);
  const isEmbeddedWallet = isSdpEmbeddedWallet(details.wallet.name);

  const enabledWallets = (wallets ?? []).filter((wallet) => wallet.enabled);
  const enabledUserManagedWallets = enabledWallets.find((wallet) => wallet.user_managed);

  const registrationOptions =
    registrationContactTypes?.filter((type) => !hasWallet(type) || isWalletRegistrationEnabled) ??
    [];

  const walletOptions = enabledWallets.filter((wallet) =>
    isWalletAddressProvided ? true : !wallet.user_managed,
  );

  const allVerificationTypes = verificationTypes ?? [];
  const verificationOptions = (() => {
    if (isEmbeddedWallet) {
      return [NONE_VERIFICATION_VALUE, SEP24_VERIFICATION_VALUE];
    }

    if (isWalletAddressProvided) {
      return [NONE_VERIFICATION_VALUE];
    }

    return allVerificationTypes.filter((type) => type !== SEP24_VERIFICATION_VALUE);
  })();

  const assetOptions = (walletAssets ?? []).filter((asset) => {
    if (asset.code === "XLM" && asset.issuer === "") {
      return true;
    }

    return !!allBalances?.find(
      (balance) => balance.assetCode === asset.code && balance.assetIssuer === asset.issuer,
    );
  });

  const selectValues = {
    registrationContactType: details.registrationContactType ?? "",
    walletId: isWalletAddressProvided ? (enabledUserManagedWallets?.id ?? "") : details.wallet.id,
    assetId: details.asset.id,
    verificationField: isWalletAddressProvided
      ? NONE_VERIFICATION_VALUE
      : (details.verificationField ?? ""),
  };

  const labels = {
    walletProvider: details.wallet.name
      ? details.wallet.name
      : isWalletAddressProvided
        ? (enabledUserManagedWallets?.name ?? "-")
        : "-",
    verification: details.verificationField
      ? VerificationFieldMap[details.verificationField] || details.verificationField
      : isWalletAddressProvided
        ? NONE_VERIFICATION_VALUE
        : "-",
  };

  const disabled = {
    registrationContactType: loading.registrationContactTypes,
    wallet:
      loading.wallets ||
      !registrationContactTypes ||
      !details.registrationContactType ||
      isWalletAddressProvided,
    asset:
      loading.walletAssets ||
      (!details.wallet.id && (!isWalletAddressProvided || !details.registrationContactType)),
    verification:
      loading.verificationTypes ||
      !registrationContactTypes ||
      !details.registrationContactType ||
      isWalletAddressProvided,
  };

  return {
    isWalletAddressProvided,
    isWalletRegistrationEnabled,
    registrationOptions,
    walletOptions,
    assetOptions,
    verificationOptions,
    selectValues,
    labels,
    disabled,
  };
};

export const DisbursementDetails: React.FC<DisbursementDetailsProps> = ({
  variant,
  details = initDetails,
  futureBalance = 0,
  csvFile,
  onChange,
  onValidate,
}: DisbursementDetailsProps) => {
  const { data: wallets, error: walletsError, isLoading: isWalletsLoading } = useWallets({});
  const {
    data: registrationContactTypes,
    error: registrationContactTypesError,
    isLoading: areRegistrationContactTypesLoading,
  } = useRegistrationContactTypes();

  const {
    data: walletAssets,
    error: walletError,
    isFetching: isWalletAssetsFetching,
  } = useAssetsByWallet({
    walletId: details.wallet.id,
    registrationContactType: details.registrationContactType,
  });

  const {
    data: verificationTypes,
    error: verificationTypesError,
    isFetching: isVerificationTypesFetching,
  } = useVerificationTypes();

  const { allBalances } = useAllBalances();

  const derived = deriveFormState({
    details,
    wallets,
    walletAssets,
    registrationContactTypes,
    verificationTypes,
    allBalances,
    loading: {
      registrationContactTypes: areRegistrationContactTypesLoading,
      wallets: isWalletsLoading,
      walletAssets: isWalletAssetsFetching,
      verificationTypes: isVerificationTypesFetching,
    },
  });

  const apiErrors = [
    registrationContactTypesError?.message,
    walletsError?.message,
    walletError?.message,
    verificationTypesError?.message,
  ]
    .filter(Boolean)
    .map(String);

  const updateDetails = (next: Partial<Disbursement>) => {
    const updatedDetails = {
      ...details,
      ...next,
    };

    onChange?.(updatedDetails);
    onValidate?.(isDisbursementValid(updatedDetails));
  };

  const handleRegistrationContactTypeChange = (value: string) => {
    const registrationContactType = registrationContactTypes?.find((type) => type === value);
    const nextHasWallet = hasWallet(registrationContactType);
    const currentHasWallet = hasWallet(details.registrationContactType);

    const updates: Partial<Disbursement> = {
      registrationContactType,
    };

    if (!registrationContactType || nextHasWallet) {
      updates.wallet = { id: "", name: "" };
      updates.verificationField = "";
    }

    if (!registrationContactType || nextHasWallet !== currentHasWallet) {
      updates.asset = { id: "", code: "" };
    }

    updateDetails(updates);
  };

  const handleWalletChange = (value: string) => {
    const wallet = wallets?.find((wallet) => wallet.id === value);

    updateDetails({
      wallet: {
        id: wallet?.id ?? "",
        name: wallet?.name ?? "",
      },
    });
  };

  const handleAssetChange = (value: string) => {
    const asset = walletAssets?.find((item) => item.id === value);

    updateDetails({
      asset: {
        id: asset?.id ?? "",
        code: asset?.code ?? "",
      },
    });
  };

  const handleVerificationFieldChange = (value: string) => {
    updateDetails({ verificationField: value });
  };

  const handleNameChange = (value: string) => {
    updateDetails({ name: value });
  };

  const handleFieldChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { id, value } = event.target;

    switch (id) {
      case FieldId.REGISTRATION_CONTACT_TYPE:
        handleRegistrationContactTypeChange(value);
        break;
      case FieldId.WALLET_ID:
        handleWalletChange(value);
        break;
      case FieldId.ASSET_CODE:
        handleAssetChange(value);
        break;
      case FieldId.VERIFICATION_FIELD:
        handleVerificationFieldChange(value);
        break;
      case FieldId.NAME:
        handleNameChange(value);
        break;
      default:
        break;
    }
  };

  const renderDropdownDefault = (isLoading: boolean) => (
    <option>{isLoading ? "Loading…" : ""}</option>
  );

  const renderSummaryFields = () => (
    <>
      <div>
        <label className="Label Label--sm">Registration Contact Type</label>
        <div className="DisbursementDetailsFields__value">
          {formatRegistrationContactType(details.registrationContactType)}
        </div>
      </div>

      <div>
        <label className="Label Label--sm">Wallet provider</label>
        <div className="DisbursementDetailsFields__value">{derived.labels.walletProvider}</div>
      </div>

      <div>
        <label className="Label Label--sm">Asset</label>
        <div className="DisbursementDetailsFields__value">{details.asset.code}</div>
      </div>

      <div>
        <label className="Label Label--sm">Verification Type</label>
        <div className="DisbursementDetailsFields__value">{derived.labels.verification}</div>
      </div>

      <div>
        <label className="Label Label--sm">Disbursement name</label>
        <div className="DisbursementDetailsFields__value">{details.name}</div>
      </div>

      <div>
        <label className="Label Label--sm">Future balance</label>
        <div
          className={`DisbursementDetailsFields__value ${
            BigNumber(futureBalance).gte(0) ? "" : "DisbursementDetailsFields__negative"
          }`}
        >
          <AssetAmount amount={futureBalance.toString()} assetCode={details.asset.code} />
        </div>
      </div>

      {variant === "confirmation" ? (
        <div>
          <label className="Label Label--sm">CSV</label>
          <div className="DisbursementDetailsFields__value">
            {csvFile ? formatUploadedFileDisplayName(csvFile) : ""}
          </div>
        </div>
      ) : null}
    </>
  );

  const renderFormFields = () => (
    <>
      <Select
        id={FieldId.REGISTRATION_CONTACT_TYPE}
        label={
          <InfoTooltip
            hideTooltip={derived.isWalletRegistrationEnabled}
            infoText="Registering receivers wallet directly is disabled. It can be enabled in the 'Wallet Providers' section."
          >
            Registration Contact Type
          </InfoTooltip>
        }
        fieldSize="sm"
        onChange={handleFieldChange}
        value={derived.selectValues.registrationContactType}
        disabled={derived.disabled.registrationContactType}
      >
        {renderDropdownDefault(areRegistrationContactTypesLoading)}
        {derived.registrationOptions.map((option) => (
          <option key={option} value={option}>
            {formatRegistrationContactType(option)}
          </option>
        ))}
      </Select>

      <Select
        id={FieldId.WALLET_ID}
        label="Wallet provider"
        fieldSize="sm"
        onChange={handleFieldChange}
        value={derived.selectValues.walletId}
        disabled={derived.disabled.wallet}
      >
        {renderDropdownDefault(isWalletsLoading)}
        {derived.walletOptions.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
          </option>
        ))}
      </Select>

      <Select
        id={FieldId.ASSET_CODE}
        label="Asset"
        fieldSize="sm"
        onChange={handleFieldChange}
        value={derived.selectValues.assetId}
        disabled={derived.disabled.asset}
      >
        {renderDropdownDefault(isWalletAssetsFetching)}
        {derived.assetOptions.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.code}
          </option>
        ))}
      </Select>

      <Select
        id={FieldId.VERIFICATION_FIELD}
        label="Verification type"
        fieldSize="sm"
        onChange={handleFieldChange}
        value={derived.selectValues.verificationField}
        disabled={derived.disabled.verification}
      >
        {renderDropdownDefault(isVerificationTypesFetching)}
        {derived.verificationOptions.map((option) => (
          <option key={option} value={option}>
            {VerificationFieldMap[option] || option}
          </option>
        ))}
      </Select>

      <Input
        id={FieldId.NAME}
        label="Disbursement name"
        fieldSize="sm"
        onChange={handleFieldChange}
        value={details.name}
      />
    </>
  );

  const renderContent = () => {
    if (variant === "preview" || variant === "confirmation") {
      return renderSummaryFields();
    }

    return renderFormFields();
  };

  return (
    <>
      {apiErrors.length ? (
        <Notification variant="error" title="Error" isFilled={true}>
          {apiErrors.map((errorMessage) => (
            <div key={`error-${errorMessage}`}>{errorMessage}</div>
          ))}
        </Notification>
      ) : null}

      <Card>
        <InfoTooltip infoText="Select each field and give your disbursement a unique name">
          <Title size="md">Disbursement details</Title>
        </InfoTooltip>

        <div className="DisbursementDetailsFields__inputs">{renderContent()}</div>
      </Card>
    </>
  );
};
