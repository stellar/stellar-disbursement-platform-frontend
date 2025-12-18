import { Avatar, Button, Icon } from "@stellar/design-system";

import { DropdownMenu } from "@/components/DropdownMenu";
import { EmbeddedWalletReceiverContact } from "@/types";

import "./styles.scss";

type Props = {
  contact: EmbeddedWalletReceiverContact;
  onOpenProfile: () => void;
  onLogout: () => void;
};

const CONTACT_ICON_MAP: Record<string, typeof Icon.UserCircle> = {
  PHONE_NUMBER: Icon.Phone01,
  EMAIL: Icon.Mail01,
};

export const EmbeddedWalletProfileDropdown = ({ contact, onOpenProfile, onLogout }: Props) => {
  const contactValue = contact.value.trim() || "—";
  const IconComponent = CONTACT_ICON_MAP[contact?.type?.toUpperCase() || ""] || Icon.UserCircle;

  return (
    <DropdownMenu
      triggerEl={
        <Button variant="tertiary" size="lg" className="WalletHeaderProfileTrigger">
          <Avatar userName={contactValue} size="sm" />
          <span className="WalletHeaderProfileTrigger__label">
            <span className="WalletHeaderProfileTrigger__name">{contactValue}</span>
            <Icon.ChevronDown className="WalletHeaderProfileTrigger__chevron" />
          </span>
        </Button>
      }
    >
      <div className="WalletHeaderProfileMenu" role="menu">
        <div className="WalletHeaderProfileMenu__info">
          <IconComponent className="WalletHeaderProfileMenu__infoIcon" />
          <span className="WalletHeaderProfileMenu__infoValue">{contactValue}</span>
        </div>

        <div className="WalletHeaderProfileMenu__divider" aria-hidden="true" />

        <Button
          variant="tertiary"
          size="md"
          type="button"
          className="WalletHeaderProfileMenu__item"
          onClick={onOpenProfile}
          role="menuitem"
        >
          <Icon.UserCircle className="WalletHeaderProfileMenu__itemIcon" />
          <span>My profile</span>
        </Button>

        <Button
          variant="tertiary"
          size="md"
          type="button"
          className="WalletHeaderProfileMenu__item WalletHeaderProfileMenu__item--danger"
          onClick={onLogout}
          role="menuitem"
        >
          <Icon.LogOut01 className="WalletHeaderProfileMenu__itemIcon" />
          <span>Log out</span>
        </Button>
      </div>
    </DropdownMenu>
  );
};
