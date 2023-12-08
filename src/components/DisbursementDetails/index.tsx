import {
  Card,
  Input,
  Select,
  Title,
  Notification,
} from "@stellar/design-system";

import { useWallets } from "apiQueries/useWallets";
import { useAssetsByWallet } from "apiQueries/useAssetsByWallet";
import { useCountries } from "apiQueries/useCountries";
import { useVerificationTypes } from "apiQueries/useVerificationTypes";
import { InfoTooltip } from "components/InfoTooltip";
import { formatUploadedFileDisplayName } from "helpers/formatUploadedFileDisplayName";
import {
  ApiAsset,
  ApiCountry,
  ApiWallet,
  Disbursement,
  DisbursementStep,
  DisbursementVerificationField,
} from "types";

import "./styles.scss";

interface DisbursementDetailsProps {
  variant: DisbursementStep;
  details?: Disbursement;
  csvFile?: File;
  onChange?: (state: Disbursement) => void;
  onValidate?: (isValid: boolean) => void;
}

const initDetails: Disbursement = {
  id: "",
  name: "",
  country: {
    name: "",
    code: "",
  },
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
};

export const DisbursementDetails: React.FC<DisbursementDetailsProps> = ({
  variant,
  details = initDetails,
  csvFile,
  onChange,
  onValidate,
}: DisbursementDetailsProps) => {
  enum FieldId {
    NAME = "name",
    COUNTRY_CODE = "country_code",
    ASSET_CODE = "asset_code",
    WALLET_ID = "wallet_id",
    VERIFICATION_FIELD = "verification_field",
  }

  const {
    data: wallets,
    error: walletsError,
    isLoading: isWalletsLoading,
  } = useWallets();

  const {
    data: countries,
    error: countriesError,
    isLoading: isCountriesLoading,
  } = useCountries();

  const {
    data: walletAssets,
    error: walletError,
    isFetching: isWalletAssetsFetching,
  } = useAssetsByWallet(details.wallet.id);

  const {
    data: verificationTypes,
    error: verificationTypesError,
    isFetching: isVerificationTypesFetching,
  } = useVerificationTypes();

  const apiErrors = [
    countriesError?.message,
    walletsError?.message,
    walletError?.message,
    verificationTypesError?.message,
  ];

  const typeLabels: Record<DisbursementVerificationField | string, string> = {
    DATE_OF_BIRTH: "Date of Birth",
    PIN: "PIN",
    NATIONAL_ID_NUMBER: "National ID Number",
  };

  const sanitizedApiErrors = apiErrors.filter((e) => Boolean(e));

  const validateInputs = (inputs: Disbursement) => {
    const missingFields = [];

    if (!inputs.name) {
      missingFields.push(FieldId.NAME);
    } else if (!inputs.country.code) {
      missingFields.push(FieldId.COUNTRY_CODE);
    } else if (!inputs.wallet.id) {
      missingFields.push(FieldId.WALLET_ID);
    } else if (!inputs.asset.code) {
      missingFields.push(FieldId.ASSET_CODE);
    } else if (!inputs.verificationField) {
      missingFields.push(FieldId.VERIFICATION_FIELD);
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

  const updateDraftDetails = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { id, value } = event.target;

    switch (id) {
      case FieldId.COUNTRY_CODE:
        // eslint-disable-next-line no-case-declarations
        const country = countries?.find((c: ApiCountry) => c.code === value);

        updateState({
          country: {
            name: country?.name || "",
            code: country?.code || "",
          },
        });

        break;
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

  const renderContent = () => {
    if (variant === "preview" || variant === "confirmation") {
      return (
        <>
          <div>
            <label className="Label Label--sm">Country</label>
            <div className="DisbursementDetailsFields__value">
              {details.country.name}
            </div>
          </div>

          <div>
            <label className="Label Label--sm">Wallet provider</label>
            <div className="DisbursementDetailsFields__value">
              {details.wallet.name}
            </div>
          </div>

          <div>
            <label className="Label Label--sm">Asset</label>
            <div className="DisbursementDetailsFields__value">
              {details.asset.code}
            </div>
          </div>

          <div>
            <label className="Label Label--sm">Verification Type</label>
            <div className="DisbursementDetailsFields__value">
              {typeLabels[details.verificationField ?? ""] ||
                details.verificationField}
            </div>
          </div>

          <div>
            <label className="Label Label--sm">Disbursement name</label>
            <div className="DisbursementDetailsFields__value">
              {details.name}
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

    // "edit" variant by default
    return (
      <>
        <Select
          id={FieldId.COUNTRY_CODE}
          label="Country"
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={details.country.code}
          disabled={isCountriesLoading}
        >
          {renderDropdownDefault(isCountriesLoading)}
          {countries?.map((country: ApiCountry) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Select>

        <Select
          id={FieldId.WALLET_ID}
          label="Wallet provider"
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={details.wallet.id}
          disabled={isWalletsLoading}
        >
          {renderDropdownDefault(isWalletsLoading)}
          {wallets &&
            wallets
              .filter((wallet) => wallet.enabled)
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
          disabled={isWalletAssetsFetching || !details.wallet.id}
        >
          {renderDropdownDefault(isWalletAssetsFetching)}
          {walletAssets?.map((asset: ApiAsset) => (
            <option key={asset.id} value={asset.id}>
              {asset.code}
            </option>
          ))}
        </Select>

        <Select
          id={FieldId.VERIFICATION_FIELD}
          label="Verification type"
          fieldSize="sm"
          onChange={updateDraftDetails}
          value={details.verificationField}
          disabled={isVerificationTypesFetching}
        >
          {renderDropdownDefault(isVerificationTypesFetching)}
          {verificationTypes?.map((type: DisbursementVerificationField) => (
            <option key={type} value={type}>
              {typeLabels[type] || type}
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

        <div className="DisbursementDetailsFields__inputs">
          {renderContent()}
        </div>
      </Card>
    </>
  );
};
