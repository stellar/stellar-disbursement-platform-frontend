import { Card, Input, Select, Notification } from "@stellar/design-system";
import { BigNumber } from "bignumber.js";

import { useWallets } from "apiQueries/useWallets";
import { useAssetsByWallet } from "apiQueries/useAssetsByWallet";
import { useRegistrationContactTypes } from "apiQueries/useRegistrationContactTypes";
import { useVerificationTypes } from "apiQueries/useVerificationTypes";
import { AssetAmount } from "components/AssetAmount";
import { InfoTooltip } from "components/InfoTooltip";
import { Title } from "components/Title";
import { formatRegistrationContactType } from "helpers/formatRegistrationContactType";
import { formatUploadedFileDisplayName } from "helpers/formatUploadedFileDisplayName";
import { useAllBalances } from "hooks/useAllBalances";
import {
  ApiAsset,
  ApiWallet,
  Disbursement,
  DisbursementStep,
  hasWallet,
  isUserManagedWalletEnabled,
  RegistrationContactType,
  VerificationFieldMap,
} from "types";

import "./styles.scss";

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

export const DisbursementDetails: React.FC<DisbursementDetailsProps> = ({
  variant,
  details = initDetails,
  futureBalance = 0,
  csvFile,
  onChange,
  onValidate,
}: DisbursementDetailsProps) => {
  enum FieldId {
    NAME = "name",
    REGISTRATION_CONTACT_TYPE = "registration_contact_type",
    ASSET_CODE = "asset_code",
    WALLET_ID = "wallet_id",
    VERIFICATION_FIELD = "verification_field",
  }

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

  // Get balances for distribution account
  const { allBalances } = useAllBalances();

  const apiErrors = [
    registrationContactTypesError?.message,
    walletsError?.message,
    walletError?.message,
    verificationTypesError?.message,
  ];

  const sanitizedApiErrors = apiErrors.filter((e) => Boolean(e));

  const validateInputs = (inputs: Disbursement) => {
    const missingFields = [];

    if (!inputs.name) {
      missingFields.push(FieldId.NAME);
    } else if (!inputs.registrationContactType) {
      missingFields.push(FieldId.REGISTRATION_CONTACT_TYPE);
    } else if (!inputs.asset.code) {
      missingFields.push(FieldId.ASSET_CODE);
    }

    if (!hasWallet(inputs.registrationContactType)) {
      if (!inputs.wallet.id) {
        missingFields.push(FieldId.WALLET_ID);
      } else if (!inputs.verificationField) {
        missingFields.push(FieldId.VERIFICATION_FIELD);
      }
    }

    const isValid = missingFields.length === 0;

    if (onValidate) {
      onValidate(isValid);
    }
  };

  const updateState = <T,>(updatedDetail: T) => {
    const updatedState = {
      ...details,
      ...updatedDetail,
    };

    // Updating parent state
    if (onChange) {
      onChange(updatedState);
    }

    validateInputs(updatedState);
  };

  const updateDraftDetails = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { id, value } = event.target;

    switch (id) {
      case FieldId.REGISTRATION_CONTACT_TYPE: {
        const registrationContactType = registrationContactTypes?.find(
          (rct: RegistrationContactType) => rct === value,
        );

        const newState = {
          registrationContactType,
          wallet: details.wallet,
          verificationField: details.verificationField,
          asset: details.asset,
        };
        if (!registrationContactType || hasWallet(registrationContactType)) {
          // registrationContactType was erased or changed to a wallet type
          newState.wallet = { id: "", name: "" };
          newState.verificationField = "";
        }

        if (
          !registrationContactType ||
          hasWallet(registrationContactType) !== hasWallet(details.registrationContactType)
        ) {
          // registrationContactType was erased or changed to a different type
          newState.asset = { id: "", code: "" };
        }

        updateState({ ...newState });
        break;
      }

      case FieldId.WALLET_ID:
        // eslint-disable-next-line no-case-declarations
        const wallet = wallets?.find((w: ApiWallet) => w.id === value);

        updateState({
          wallet: {
            id: wallet?.id || "",
            name: wallet?.name || "",
          },
        });
        break;

      case FieldId.ASSET_CODE:
        // eslint-disable-next-line no-case-declarations
        const asset = walletAssets?.find((a: ApiAsset) => a.id === value);

        updateState({
          asset: {
            id: asset?.id || "",
            code: asset?.code || "",
          },
        });
        break;

      case FieldId.NAME:
        updateState({
          name: value,
        });
        break;

      case FieldId.VERIFICATION_FIELD:
        updateState({
          verificationField: value,
        });
        break;

      default:
      // do nothing
    }
  };

  const renderDropdownDefault = (isLoading: boolean) => {
    return <option>{isLoading ? "Loading…" : ""}</option>;
  };

  const renderWalletProviderText = (): string => {
    if (details.wallet.name) {
      return details.wallet.name;
    }

    if (hasWallet(details.registrationContactType)) {
      return wallets?.find((w) => w.enabled && w.user_managed)?.name || "-";
    }

    return "-";
  };

  const renderVerificationTypeText = (): string => {
    if (details.verificationField) {
      return VerificationFieldMap[details.verificationField] || details.verificationField;
    }

    if (hasWallet(details.registrationContactType)) {
      return "None";
    }

    return "-";
  };

  const renderContent = () => {
    if (variant === "preview" || variant === "confirmation") {
      return (
        <>
          <div>
            <label className="Label Label--sm">Registration Contact Type</label>
            <div className="DisbursementDetailsFields__value">
              {formatRegistrationContactType(details.registrationContactType)}
            </div>
          </div>

          <div>
            <label className="Label Label--sm">Wallet provider</label>
            <div className="DisbursementDetailsFields__value">{renderWalletProviderText()}</div>
          </div>

          <div>
            <label className="Label Label--sm">Asset</label>
            <div className="DisbursementDetailsFields__value">{details.asset.code}</div>
          </div>

          <div>
            <label className="Label Label--sm">Verification Type</label>
            <div className="DisbursementDetailsFields__value">{renderVerificationTypeText()}</div>
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
    }

    const isWalletRegistrationEnabled = isUserManagedWalletEnabled(wallets);

    // "edit" variant by default
    return (
      <>
        <Select
          id={FieldId.REGISTRATION_CONTACT_TYPE}
          label={
            <InfoTooltip
              hideTooltip={isWalletRegistrationEnabled}
              infoText="Registering receivers wallet directly is disabled. It can be enabled in the 'Wallet Providers' section."
            >
              Registration Contact Type
            </InfoTooltip>
          }
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={details.registrationContactType}
          disabled={areRegistrationContactTypesLoading}
        >
          {renderDropdownDefault(areRegistrationContactTypesLoading)}
          {registrationContactTypes
            ?.filter(
              (registrationContactType) =>
                !hasWallet(registrationContactType) || isWalletRegistrationEnabled,
            )
            .map((registrationContactType: RegistrationContactType) => (
              <option key={registrationContactType} value={registrationContactType}>
                {formatRegistrationContactType(registrationContactType)}
              </option>
            ))}
        </Select>
        <Select
          id={FieldId.WALLET_ID}
          label="Wallet provider"
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={
            hasWallet(details.registrationContactType) // in case of a WALLET_ADDRESS registration type, pre-populate the WALLET provider
              ? wallets?.find((w) => w.enabled && w.user_managed)?.id
              : details.wallet.id
          }
          disabled={
            isWalletsLoading ||
            !registrationContactTypes ||
            !details.registrationContactType ||
            hasWallet(details.registrationContactType)
          }
        >
          {renderDropdownDefault(isWalletsLoading)}
          {wallets &&
            wallets
              .filter((wallet) => wallet.enabled)
              .filter((wallet) =>
                hasWallet(details.registrationContactType) // This allows to pre-populate the WALLET provider in case of a WALLET_ADDRESS registration type
                  ? true
                  : !wallet.user_managed,
              )
              .map((wallet: ApiWallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
        </Select>

        <Select
          id={FieldId.ASSET_CODE}
          label="Asset"
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={details.asset.id}
          disabled={
            isWalletAssetsFetching ||
            (!details.wallet.id &&
              (!hasWallet(details.registrationContactType) || !details.registrationContactType))
          }
        >
          {renderDropdownDefault(isWalletAssetsFetching)}
          {walletAssets
            ?.filter((wa: ApiAsset) => {
              // Check for the default native asset
              if (wa.code === "XLM" && wa.issuer === "") {
                return true;
              }
              // Check that the asset is a non-native asset that has a distribution account balance
              return !!allBalances?.find(
                (balance) => balance.assetCode === wa.code && balance.assetIssuer === wa.issuer,
              );
            })
            ?.map((wa: ApiAsset) => (
              <option key={wa.id} value={wa.id}>
                {wa.code}
              </option>
            ))}
        </Select>

        <Select
          id={FieldId.VERIFICATION_FIELD}
          label="Verification type"
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={hasWallet(details.registrationContactType) ? "None" : details.verificationField}
          disabled={
            isVerificationTypesFetching ||
            !registrationContactTypes ||
            !details.registrationContactType ||
            hasWallet(details.registrationContactType)
          }
        >
          {renderDropdownDefault(isVerificationTypesFetching)}
          {[
            ...(verificationTypes ?? []),
            ...(hasWallet(details.registrationContactType) ? ["None"] : []),
          ].map((type: string) => (
            <option key={type} value={type}>
              {VerificationFieldMap[type] || type}
            </option>
          ))}
        </Select>

        <Input
          id={FieldId.NAME}
          label="Disbursement name"
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={details.name}
        />
      </>
    );
  };

  return (
    <>
      {sanitizedApiErrors && sanitizedApiErrors.length > 0 ? (
        <Notification variant="error" title="Error">
          {sanitizedApiErrors.map((e) => (
            <div key={`error-${e}`}>{e}</div>
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
