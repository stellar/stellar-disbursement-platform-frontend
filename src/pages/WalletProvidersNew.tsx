import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  Card,
  Checkbox,
  Heading,
  Icon,
  Input,
  Label,
  Modal,
  Notification,
  Toggle,
  Text,
} from "@stellar/design-system";

import { Box } from "@/components/Box";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ErrorWithExtras } from "@/components/ErrorWithExtras";
import { SectionHeader } from "@/components/SectionHeader";
import { Title } from "@/components/Title";

import { Routes } from "@/constants/settings";

import { useAllAssets } from "@/apiQueries/useAllAssets";
import { useWallets } from "@/apiQueries/useWallets";
import { useWalletsAdd } from "@/apiQueries/useWalletsAdd";
import { useWalletsUpdate } from "@/apiQueries/useWalletsUpdate";

import EurocLogoSrc from "@/assets/logo-euroc.svg";
import UsdcLogoSrc from "@/assets/logo-usdc.svg";
import XlmLogoSrc from "@/assets/logo-xlm.svg";

export const WalletProvidersNew = () => {
  type FormFields = {
    name: string;
    homepage: string;
    sep_10_client_domain: string;
    deep_link_schema: string;
    enabled: boolean;
    assetIds: string[];
  };

  type FormField = keyof FormFields;

  const initFormState: FormFields = {
    name: "",
    homepage: "",
    sep_10_client_domain: "",
    deep_link_schema: "",
    enabled: true,
    assetIds: [],
  };

  const assetImage: Record<string, string> = {
    USDC: UsdcLogoSrc,
    EURC: EurocLogoSrc,
    XLM: XlmLogoSrc,
  };

  const { walletId } = useParams();

  const [formFields, setFormFields] = useState<FormFields>(initFormState);
  const [formFieldErrors, setFormFieldErrors] = useState<Partial<Record<keyof FormFields, string>>>(
    {},
  );
  const [isAssetsDropdownVisible, setIsAssetsDropdownVisible] = useState(false);
  const [currentWalletValues, setCurrentWalletValues] = useState<FormFields | null>(null);

  const assetsInputRef = useRef<HTMLDivElement>(null);
  const assetsDropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: addWalletData,
    isPending: isAddWalletPending,
    error: addWalletError,
    mutateAsync: addWallet,
    reset: addWalletReset,
  } = useWalletsAdd();

  const {
    data: updateWalletData,
    isPending: isUpdateWalletPending,
    error: updateWalletError,
    mutateAsync: updateWallet,
    reset: updateWalletReset,
  } = useWalletsUpdate();

  const { data: wallets, error: walletsError } = useWallets({ walletId });

  const isEditMode = Boolean(walletId);
  const selectedWallet = isEditMode ? wallets?.find((w) => w.id === walletId) : undefined;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node;
    const inputElement = assetsInputRef.current?.querySelector(".Input__container");

    if (assetsDropdownRef?.current?.contains(target) || inputElement?.contains(target)) {
      return;
    }

    setIsAssetsDropdownVisible(false);
  }, []);

  useLayoutEffect(() => {
    if (isAssetsDropdownVisible) {
      document.addEventListener("pointerup", handleClickOutside);
    } else {
      document.removeEventListener("pointerup", handleClickOutside);
    }

    return () => {
      document.removeEventListener("pointerup", handleClickOutside);
    };
  }, [isAssetsDropdownVisible, handleClickOutside]);

  // When in edit mode, populate form fields with wallet data
  useEffect(() => {
    if (selectedWallet) {
      const newValues = {
        name: selectedWallet.name,
        homepage: selectedWallet.homepage || "",
        sep_10_client_domain: selectedWallet.sep_10_client_domain || "",
        deep_link_schema: selectedWallet.deep_link_schema || "",
        enabled: selectedWallet.enabled,
        assetIds: selectedWallet.assets.map((a) => a.id),
      };

      setFormFields(newValues);
      setCurrentWalletValues(newValues);
    }
  }, [selectedWallet]);

  const navigate = useNavigate();

  const { data: allAssets } = useAllAssets({ enabled: true });

  const selectedAssets = allAssets?.filter((a) => formFields.assetIds.includes(a.id)) ?? [];

  const updateSelectedAssetIds = (assetId: string) => {
    setFormFields((prev) => {
      if (prev.assetIds.includes(assetId)) {
        return { ...prev, assetIds: prev.assetIds.filter((id) => id !== assetId) };
      }

      return { ...prev, assetIds: [...prev.assetIds, assetId] };
    });
  };

  const handleAddNewWallet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSubmitEnabled()) {
      return;
    }

    const { name, homepage, sep_10_client_domain, deep_link_schema, enabled } = formFields;

    const submitParams = {
      name,
      homepage,
      sep_10_client_domain,
      deep_link_schema,
      enabled,
      assets: formFields.assetIds.map((a) => ({ id: a })),
    };

    addWallet(submitParams);
  };

  const handleUpdateWallet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!walletId || areInputsTheSame() || !isSubmitEnabled()) {
      return;
    }

    const { name, homepage, sep_10_client_domain, deep_link_schema, enabled } = formFields;

    const submitParams = {
      name,
      homepage,
      sep_10_client_domain,
      deep_link_schema,
      enabled,
      assets: formFields.assetIds.map((a) => ({ id: a })),
    };

    updateWallet({ walletId: walletId, request: submitParams });
  };

  const handleCancel = () => {
    addWalletReset();
    updateWalletReset();
    navigate(Routes.WALLET_PROVIDERS);
  };

  const handleDone = () => {
    addWalletReset();
    updateWalletReset();
    navigate(Routes.WALLET_PROVIDERS);
  };

  const isSubmitEnabled = () => {
    const { name, homepage, sep_10_client_domain, deep_link_schema, assetIds } = formFields;
    const hasErrors = Object.keys(formFieldErrors).length > 0;

    return (
      name &&
      homepage &&
      sep_10_client_domain &&
      deep_link_schema &&
      assetIds.length > 0 &&
      !hasErrors
    );
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Accepts: example.com, wallet.example.app
  const isValidDomain = (domain: string) => {
    // Reject if domain contains http:// or https:// prefix
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      return false;
    }

    const parts = domain.split(".");

    // Make sure we have at least two parts and none are empty
    if (parts.length < 2 || parts.some((part) => !part)) {
      return false;
    }

    try {
      new URL(`https://${domain}`);
      return true;
    } catch {
      return false;
    }
  };

  // Accepts: wallet:// or https://wallet.app/deeplink
  const isValidDeepLink = (link: string) => {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.*/.test(link);
  };

  const validateField = (fieldId: FormField, value: string) => {
    let errorMsg = "";

    switch (fieldId) {
      case "name":
        errorMsg = !value ? "Name is required" : "";
        break;
      case "homepage":
        if (!value) {
          errorMsg = "Homepage is required";
        } else {
          errorMsg = isValidUrl(value) ? "" : "Please enter a valid URL";
        }
        break;
      case "sep_10_client_domain":
        if (!value) {
          errorMsg = "SEP10 client domain is required";
        } else {
          errorMsg = isValidDomain(value)
            ? ""
            : "Please enter a valid client domain (must be a domain without http/https prefix)";
        }
        break;
      case "deep_link_schema":
        if (!value) {
          errorMsg = "Deep link schema is required";
        } else {
          errorMsg = isValidDeepLink(value) ? "" : "Please enter a valid deep link schema";
        }
        break;
      default:
      // do nothing
    }

    if (errorMsg) {
      setFormFieldErrors((prev) => ({ ...prev, [fieldId]: errorMsg }));
    } else {
      setFormFieldErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [fieldId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const AssetImage = ({ code, size }: { code: string; size: "sm" | "md" }) => {
    return (
      <span className="WalletProvidersNew__assetImage" data-size={size}>
        {assetImage[code] ? <img src={assetImage[code]} alt={code} /> : null}
      </span>
    );
  };

  const getTitle = () => {
    if (isEditMode) {
      return selectedWallet?.name || "Update wallet";
    }

    return "Add a new wallet";
  };

  const areInputsTheSame = () => {
    return (
      formFields.name === currentWalletValues?.name &&
      formFields.homepage === currentWalletValues?.homepage &&
      formFields.sep_10_client_domain === currentWalletValues?.sep_10_client_domain &&
      formFields.deep_link_schema === currentWalletValues?.deep_link_schema &&
      formFields.enabled === currentWalletValues?.enabled &&
      formFields.assetIds.length === currentWalletValues?.assetIds.length &&
      formFields.assetIds.every((id) => currentWalletValues?.assetIds.includes(id))
    );
  };

  const modalData = isEditMode ? updateWalletData : addWalletData;

  return (
    <>
      <Breadcrumbs
        steps={[
          {
            label: "Wallet Providers",
            route: Routes.WALLET_PROVIDERS,
          },
          {
            label: isEditMode ? "Update wallet" : "Add a new wallet",
          },
        ]}
      />

      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Button
              size="md"
              variant="tertiary"
              icon={<Icon.ArrowLeft />}
              onClick={handleCancel}
              aria-label="Back to Wallet Providers"
            ></Button>

            <Heading as="h2" size="sm">
              {getTitle()}
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <form onSubmit={isEditMode ? handleUpdateWallet : handleAddNewWallet} onReset={handleCancel}>
        <Box gap="lg" addlClassName="WalletProvidersNew">
          <>
            {walletId && !selectedWallet ? (
              <Notification variant="error" title="Error" isFilled={true}>
                Wallet provider with ID {walletId} was not found.
              </Notification>
            ) : null}

            {addWalletError || updateWalletError ? (
              <Notification variant="error" title="Error" isFilled={true}>
                <ErrorWithExtras appError={addWalletError || updateWalletError} />
              </Notification>
            ) : null}

            {walletsError ? (
              <Notification variant="error" title="Error" isFilled={true}>
                <ErrorWithExtras appError={walletsError} />
              </Notification>
            ) : null}
          </>

          <Card>
            <Box gap="xl">
              <Box gap="lg">
                <Title size="md">Wallet details</Title>

                <Box gap="lg">
                  <Input
                    id="name"
                    fieldSize="md"
                    label="Stellar Wallet name"
                    placeholder="Enter Stellar native wallet name"
                    value={formFields.name}
                    error={formFieldErrors.name}
                    onChange={(e) => {
                      setFormFields({ ...formFields, name: e.target.value });
                      validateField("name", e.target.value);
                    }}
                  />
                  <Input
                    id="homepage"
                    fieldSize="md"
                    label="Homepage"
                    placeholder="Enter wallet homepage URL"
                    value={formFields.homepage}
                    error={formFieldErrors.homepage}
                    onChange={(e) => {
                      setFormFields({ ...formFields, homepage: e.target.value });
                      validateField("homepage", e.target.value);
                    }}
                    spellCheck={false}
                  />
                  <Input
                    id="sep_10_client_domain"
                    fieldSize="md"
                    label="SEP10 Client Domain"
                    placeholder="Enter SEP10 client domain"
                    value={formFields.sep_10_client_domain}
                    error={formFieldErrors.sep_10_client_domain}
                    onChange={(e) => {
                      setFormFields({ ...formFields, sep_10_client_domain: e.target.value });
                      validateField("sep_10_client_domain", e.target.value);
                    }}
                    spellCheck={false}
                  />
                  <Input
                    id="deep_link_schema"
                    fieldSize="md"
                    label="Deep Link Schema"
                    placeholder="Enter deep link schema"
                    value={formFields.deep_link_schema}
                    error={formFieldErrors.deep_link_schema}
                    onChange={(e) => {
                      setFormFields({ ...formFields, deep_link_schema: e.target.value });
                      validateField("deep_link_schema", e.target.value);
                    }}
                    spellCheck={false}
                  />

                  <div className="WalletProvidersNew__assetSelector">
                    <div ref={assetsInputRef}>
                      <Input
                        id="supported-assets-trigger"
                        fieldSize="md"
                        label="Supported Assets"
                        placeholder="Select an asset to add"
                        rightElement={
                          isAssetsDropdownVisible ? <Icon.ChevronUp /> : <Icon.ChevronDown />
                        }
                        onFocus={() => setIsAssetsDropdownVisible(true)}
                      />
                    </div>

                    {/* Assets dropdown */}
                    {isAssetsDropdownVisible ? (
                      <div
                        className="WalletProvidersNew__assetSelector__dropdown"
                        ref={assetsDropdownRef}
                      >
                        {allAssets?.map((a) => (
                          <label
                            key={a.id}
                            className="WalletProvidersNew__assetSelector__item"
                            htmlFor={`asset-${a.id}`}
                          >
                            <Checkbox
                              id={`asset-${a.id}`}
                              checked={formFields.assetIds.includes(a.id)}
                              name="supported-assets"
                              fieldSize="md"
                              onChange={() => {
                                updateSelectedAssetIds(a.id);
                              }}
                            />

                            <AssetImage code={a.code} size="md" />

                            {a.code}
                          </label>
                        ))}
                      </div>
                    ) : null}

                    {/* Selected assets */}
                    {selectedAssets.length > 0 ? (
                      <Box
                        gap="sm"
                        direction="row"
                        align="center"
                        wrap="wrap"
                        addlClassName="WalletProvidersNew__selectedAssets"
                      >
                        {selectedAssets.map((s) => (
                          <Button
                            key={s.id}
                            size="md"
                            variant="tertiary"
                            icon={<Icon.X />}
                            iconPosition="right"
                            onClick={() => updateSelectedAssetIds(s.id)}
                          >
                            <AssetImage code={s.code} size="sm" />
                            {s.code}
                          </Button>
                        ))}
                      </Box>
                    ) : null}
                  </div>
                </Box>
              </Box>

              <Box gap="lg" direction="row" align="center" justify="space-between">
                <Label size="lg" htmlFor="enabled">
                  Enable Wallet by default
                </Label>
                <Toggle
                  id="enabled"
                  fieldSize="md"
                  checked={formFields.enabled}
                  onChange={() => {
                    setFormFields((prev) => ({ ...prev, enabled: !prev.enabled }));
                  }}
                />
              </Box>
            </Box>
          </Card>

          <Box gap="lg" direction="row" justify="end">
            <Button
              size="md"
              variant="tertiary"
              type="reset"
              disabled={isAddWalletPending || isUpdateWalletPending}
            >
              Cancel
            </Button>

            {isEditMode ? (
              <Button
                size="md"
                variant="primary"
                disabled={areInputsTheSame() || !isSubmitEnabled()}
                type="submit"
                isLoading={isUpdateWalletPending}
              >
                Update
              </Button>
            ) : (
              <Button
                size="md"
                variant="primary"
                disabled={!isSubmitEnabled()}
                type="submit"
                isLoading={isAddWalletPending}
              >
                Add a new wallet
              </Button>
            )}
          </Box>
        </Box>
      </form>

      {/* Success modal */}
      <Modal visible={Boolean(modalData)} onClose={handleDone}>
        <Modal.Heading>
          {isEditMode
            ? "Wallet has been successfully updated!"
            : "Wallet has been successfully added!"}
        </Modal.Heading>
        <Modal.Body>
          {!isEditMode ? <p>Your wallet has been successfully added to your account.</p> : null}
          <Card>
            <Box gap="md">
              <ResponseItem label="Wallet provider" value={modalData?.name || ""} />
              <ResponseItem label="Homepage" value={modalData?.homepage || ""} />
              <ResponseItem
                label="SEP10 Client Domain"
                value={modalData?.sep_10_client_domain || ""}
              />
              <ResponseItem label="Deep Link Schema" value={modalData?.deep_link_schema || ""} />
              <ResponseItem
                label="Supported Assets"
                value={modalData?.assets?.map((a) => a.code).join(", ") || ""}
              />
              <ResponseItem
                label="Enable Wallet by default"
                value={modalData?.enabled ? "Yes" : "No"}
              />
            </Box>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button size="md" variant="primary" onClick={handleDone}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const ResponseItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <Box gap="sm">
      <Text size="xs" as="div" weight="regular">
        {label}
      </Text>
      <Text
        size="sm"
        as="div"
        weight="regular"
        addlClassName="WalletProvidersNew__responseItem__value"
      >
        {value}
      </Text>
    </Box>
  );
};
