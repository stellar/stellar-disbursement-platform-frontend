import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Notification,
} from "@stellar/design-system";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getAssets } from "api/getAssets";
import { postAssets } from "api/postAssets";
import { deleteAsset } from "api/deleteAsset";
import { InfoTooltip } from "components/InfoTooltip";
import { DropdownMenu } from "components/DropdownMenu";
import { MoreMenuButton } from "components/MoreMenuButton";
import { NotificationWithButtons } from "components/NotificationWithButtons";

import { parseApiError } from "helpers/parseApiError";
import { useSessionToken } from "hooks/useSessionToken";
import { ApiError, StellarAccountBalance } from "types";

import "./styles.scss";

interface WalletTrustlinesProps {
  balances?: StellarAccountBalance[];
  onSuccess: () => void;
}

export const WalletTrustlines = ({
  balances,
  onSuccess,
}: WalletTrustlinesProps) => {
  type FormItems = {
    fassetcode?: string;
    fassetissuer?: string;
  };

  const initForm = {
    fassetcode: "",
    fassetissuer: "",
  };

  type Trustline = {
    id: string | null;
    code: string;
    issuer: string;
    balance: string;
    isNative: boolean;
  };

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [formItems, setFormItems] = useState<FormItems>(initForm);
  const [formError, setFormError] = useState<string[]>([]);
  const [removeAssetId, setRemoveAssetId] = useState<string>();
  const [trustlines, setTrustlines] = useState<Trustline[]>();
  const [successNotification, setSuccessNotification] = useState<
    { title: string; message: string } | undefined
  >();

  const sessionToken = useSessionToken();

  const ASSET_NAME: { [key: string]: string } = {
    XLM: "Stellar Lumens",
    USDC: "USD Coin",
    EUROC: "EURO Coin",
    // SRT is used for testing
    SRT: "Stellar Reference Token",
  };

  const getTrustlines = async () => {
    if (!balances) {
      return [];
    }

    return await getAssets(sessionToken);
  };

  const submitAddTrustline = () => {
    return postAssets(sessionToken, {
      code: formItems.fassetcode!,
      issuer: formItems.fassetissuer!,
    });
  };

  const {
    isFetching: assetsIsFetching,
    data: assets,
    isError: assetsIsError,
    isSuccess: assetsIsSuccess,
    error: assetsError,
    refetch: assetsRefetch,
  } = useQuery({
    queryKey: ["WalletTrustlinesAssets"],
    queryFn: () => (balances ? getTrustlines() : []),
    enabled: Boolean(balances),
  });

  useEffect(() => {
    if (balances?.length && assetsIsSuccess) {
      const test = balances?.map((b) => {
        const id =
          assets?.find(
            (a) => a.code === b?.assetCode && a.issuer === b?.assetIssuer,
          )?.id || null;

        return {
          id,
          code: b?.assetCode || "XLM",
          issuer: b?.assetIssuer || "native",
          balance: b.balance,
          isNative: Boolean(!b.assetCode && !b.assetIssuer),
        };
      });

      setTrustlines(test);
    }
  }, [assets, assetsIsSuccess, balances]);

  const {
    mutate: trustlineAdd,
    isLoading: trustlineAddIsLoading,
    isError: trustlineAddIsError,
    error: trustlineAddError,
    reset: trustlineAddReset,
  } = useMutation({
    mutationFn: submitAddTrustline,
    retry: false,
    onSuccess: (addedAsset) => {
      handleCloseModal();
      onSuccess();
      assetsRefetch();
      setSuccessNotification({
        title: "Trustline added",
        message: `Trustline ${ASSET_NAME[addedAsset.code]} (${
          addedAsset.code
        }) was added.`,
      });
    },
  });

  const {
    mutate: trustlineRemove,
    isLoading: trustlineRemoveIsLoading,
    isError: trustlineRemoveIsError,
    error: trustlineRemoveError,
    reset: trustlineRemoveReset,
  } = useMutation({
    mutationFn: () => deleteAsset(sessionToken, removeAssetId!),
    retry: false,
    onSuccess: (removeAsset) => {
      handleCloseModal();
      onSuccess();
      assetsRefetch();
      setSuccessNotification({
        title: "Trustline removed",
        message: `Trustline ${ASSET_NAME[removeAsset.code]} (${
          removeAsset.code
        }) was removed.`,
      });
    },
  });

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setIsRemoveModalVisible(false);
    setFormItems(initForm);
    setFormError([]);
    setRemoveAssetId(undefined);

    if (trustlineAddIsError) {
      trustlineAddReset();
    }

    if (trustlineRemoveIsError) {
      trustlineRemoveReset();
    }
  };

  const filledItems = () => Object.values(formItems).filter((v) => v);

  const canSubmit = formError.length === 0 && filledItems().length === 2;

  const removeItemFromErrors = (id: string) => {
    setFormError(formError.filter((e) => e !== id));
  };

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    removeItemFromErrors(event.target.id);
    setFormItems({
      ...formItems,
      [event.target.id]: event.target.value,
    });

    if (trustlineAddIsError) {
      trustlineAddReset();
    }
  };

  const handleValidate = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
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

  const renderContent = () => {
    if (assetsIsFetching) {
      return <div className="Note">Loading…</div>;
    }

    if (trustlines?.length === 0) {
      return <div className="Note">There are no trustlines</div>;
    }

    return (
      <>
        {trustlines?.map((a) => {
          const isRemoveEnabled = Number(a.balance) === 0;

          return (
            <div
              className="WalletTrustlines__asset"
              key={`${a.code}-${a.issuer}`}
            >
              <div className="WalletTrustlines__asset__info">
                <div>{ASSET_NAME?.[a.code] || ""}</div>
                <span>{a.code}</span>
              </div>

              {!a.isNative && a.id ? (
                <DropdownMenu triggerEl={<MoreMenuButton />}>
                  <DropdownMenu.Item
                    onClick={() => {
                      if (isRemoveEnabled) {
                        setIsRemoveModalVisible(true);
                        setRemoveAssetId(a.id!);
                      }
                    }}
                    isHighlight
                    aria-disabled={!isRemoveEnabled}
                    title={
                      !isRemoveEnabled
                        ? "You can only remove an asset when the asset balance is 0"
                        : ""
                    }
                  >
                    Remove trustline
                  </DropdownMenu.Item>
                </DropdownMenu>
              ) : null}
            </div>
          );
        })}

        <div className="WalletTrustlines__button">
          <Button
            size="xs"
            variant="tertiary"
            onClick={() => {
              setIsAddModalVisible(true);
            }}
          >
            Add trustline
          </Button>
        </div>
      </>
    );
  };

  const getRemoveAssetConfirmation = () => {
    const asset = assets?.find((a) => a.id === removeAssetId);

    if (asset) {
      return `Are you sure you want to remove ${
        ASSET_NAME[asset.code] ?? asset.code
      }?`;
    }

    return "Something went wrong, the asset was not found.";
  };

  return (
    <>
      {assetsIsError ? (
        <Notification variant="error" title="Error">
          {assetsError as string}
        </Notification>
      ) : null}

      {successNotification ? (
        <NotificationWithButtons
          variant="success"
          title={successNotification.title}
          buttons={[
            {
              label: "Dismiss",
              onClick: () => {
                setSuccessNotification(undefined);
                trustlineAddReset();
                trustlineRemoveReset();
              },
            },
          ]}
        >
          {successNotification.message}
        </NotificationWithButtons>
      ) : null}

      <Card>
        <div className="CardStack__card">
          <div className="CardStack__title">
            <InfoTooltip infoText="Trustlines are how you opt for your Stellar account to interact with an asset issued by a specific account. You must establish a trustline in order to hold an asset.">
              Trustlines
            </InfoTooltip>
          </div>

          {renderContent()}
        </div>
      </Card>

      {/* Add asset modal */}
      <Modal visible={isAddModalVisible} onClose={handleCloseModal}>
        <Modal.Heading>Add trustline</Modal.Heading>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            trustlineAdd();
          }}
          onReset={handleCloseModal}
        >
          <Modal.Body>
            {trustlineAddIsError ? (
              <Notification variant="error" title="Error">
                {parseApiError(trustlineAddError as ApiError)}
              </Notification>
            ) : null}

            <Input
              fieldSize="sm"
              id="fassetcode"
              name="fassetcode"
              type="text"
              label={
                <InfoTooltip infoText="The identifying code of the Stellar asset for which you want to create a trustline (usually a 3-6 character alphanumeric code)">
                  Asset code
                </InfoTooltip>
              }
              value={formItems.fassetcode}
              onChange={handleChange}
              onBlur={handleValidate}
              error={itemHasError("fassetcode", "Asset code")}
            />
            <Input
              fieldSize="sm"
              id="fassetissuer"
              name="fassetissuer"
              type="text"
              label={
                <InfoTooltip infoText="The Stellar public key of the account that issues the asset you want to trust (56-character string starting with 'G'). Asset codes are not unique on their own so make sure you list the correct issuer.">
                  Issuer public key
                </InfoTooltip>
              }
              value={formItems.fassetissuer}
              onChange={handleChange}
              onBlur={handleValidate}
              error={itemHasError("fassetissuer", "Issuer public key")}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              type="reset"
              isLoading={trustlineAddIsLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              disabled={!canSubmit}
              isLoading={trustlineAddIsLoading}
            >
              Add trustline
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Remove asset modal */}
      <Modal
        visible={isRemoveModalVisible && Boolean(removeAssetId)}
        onClose={handleCloseModal}
      >
        <Modal.Heading>Remove trustline</Modal.Heading>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            trustlineRemove();
          }}
          onReset={handleCloseModal}
        >
          <Modal.Body>
            {trustlineRemoveIsError ? (
              <Notification variant="error" title="Error">
                {parseApiError(trustlineRemoveError as ApiError)}
              </Notification>
            ) : null}

            <div>{getRemoveAssetConfirmation()}</div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              type="reset"
              isLoading={trustlineRemoveIsLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              type="submit"
              isLoading={trustlineRemoveIsLoading}
            >
              Remove trustline
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
