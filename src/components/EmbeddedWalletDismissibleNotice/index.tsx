import { useMemo, useState, type ComponentProps, type ReactNode } from "react";

import { Link, Notification } from "@stellar/design-system";

import { useEmbeddedWalletNotices } from "@/components/EmbeddedWalletNoticesProvider";

import {
  localStorageWalletNotices,
  type WalletNoticeKey,
} from "@/helpers/localStorageWalletNotices";

import "./styles.scss";

type EmbeddedWalletNotificationProps = ComponentProps<typeof Notification>;

interface EmbeddedWalletDismissibleNoticeProps extends EmbeddedWalletNotificationProps {
  children: ReactNode;
  noticeId: string;
  credentialId?: string;
  noticeKey?: WalletNoticeKey;
  dismissLabel?: string;
}

export const EmbeddedWalletDismissibleNotice = ({
  children,
  noticeId,
  credentialId,
  noticeKey,
  dismissLabel = "Dismiss",
  ...notificationProps
}: EmbeddedWalletDismissibleNoticeProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { removeNotice } = useEmbeddedWalletNotices();

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
    removeNotice(noticeId);
  };

  if (isDismissed || isStoredDismissed) {
    return null;
  }

  const dismissAction = (
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
