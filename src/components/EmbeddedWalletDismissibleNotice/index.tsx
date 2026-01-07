import { Link, Notification } from "@stellar/design-system";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";

import {
  localStorageWalletNotices,
  type WalletNoticeKey,
} from "@/helpers/localStorageWalletNotices";

import "./styles.scss";

type EmbeddedWalletNotificationProps = ComponentProps<typeof Notification>;

type DismissActionRenderProps = {
  onDismiss: () => void;
  dismissLabel: string;
};

interface EmbeddedWalletDismissibleNoticeProps extends EmbeddedWalletNotificationProps {
  children: ReactNode;
  credentialId?: string;
  noticeKey?: WalletNoticeKey;
  dismissLabel?: string;
  onDismiss?: () => void;
  renderDismissAction?: (props: DismissActionRenderProps) => ReactNode;
}

export const EmbeddedWalletDismissibleNotice = ({
  children,
  credentialId,
  noticeKey,
  dismissLabel = "Dismiss",
  onDismiss,
  renderDismissAction,
  ...notificationProps
}: EmbeddedWalletDismissibleNoticeProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const isStoredDismissed = useMemo(() => {
    if (noticeKey && credentialId) {
      const noticeState = localStorageWalletNotices.get(credentialId);
      return Boolean(noticeState[noticeKey]);
    }

    return false;
  }, [credentialId, noticeKey]);

  const handleDismiss = () => {
    if (noticeKey && credentialId) {
      localStorageWalletNotices.set(credentialId, {
        [noticeKey]: true,
      });
    }

    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed || isStoredDismissed) {
    return null;
  }

  const dismissAction = renderDismissAction ? (
    renderDismissAction({ onDismiss: handleDismiss, dismissLabel })
  ) : (
    <Link
      role="button"
      variant="primary"
      onClick={handleDismiss}
      addlClassName="EmbeddedWalletDismissibleNotice__dismiss"
    >
      {dismissLabel}
    </Link>
  );

  return (
    <div className="EmbeddedWalletLayout__noticeItem">
      <Notification {...notificationProps}>
        <div className="EmbeddedWalletDismissibleNotice__content">
          <div>{children}</div>
          {dismissAction}
        </div>
      </Notification>
    </div>
  );
};
