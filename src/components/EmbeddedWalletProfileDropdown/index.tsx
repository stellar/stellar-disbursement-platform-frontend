import { Avatar, Button, Icon } from "@stellar/design-system";

import { DropdownMenu } from "@/components/DropdownMenu";

import { EmbeddedWalletReceiverContact } from "@/types";

import "./styles.scss";

type Props = {
  contact: EmbeddedWalletReceiverContact;
  onOpenProfile: () => void;
  onLogout: () => void;
};

const MenuItem = ({
  icon: IconComponent,
  label,
  onClick,
  isDanger,
}: {
  icon: typeof Icon.UserCircle;
  label: string;
  onClick: () => void;
  isDanger?: boolean;
}) => (
  <button
    type="button"
    className={`WalletHeaderProfileMenu__item ${isDanger ? "WalletHeaderProfileMenu__item--danger" : ""}`}
    onClick={onClick}
  >
    <IconComponent className="WalletHeaderProfileMenu__itemIcon" />
    <span>{label}</span>
  </button>
);

export const EmbeddedWalletProfileDropdown = ({ contact, onOpenProfile, onLogout }: Props) => {
  const contactValue = contact.value.trim() || "—";
  const contactType = contact.type.trim().toUpperCase();
  const ContactIcon =
    contactType === "PHONE_NUMBER"
      ? Icon.Phone01
      : contactType === "EMAIL"
        ? Icon.Mail01
        : Icon.UserCircle;

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
        <div className="WalletHeaderProfileMenu__contact">
          <ContactIcon className="WalletHeaderProfileMenu__contactIcon" />
          <span className="WalletHeaderProfileMenu__contactValue">{contactValue}</span>
        </div>

        <div className="WalletHeaderProfileMenu__divider" aria-hidden="true" />

        <MenuItem icon={Icon.UserCircle} label="My profile" onClick={onOpenProfile} />

        <MenuItem icon={Icon.LogOut01} label="Log out" onClick={onLogout} isDanger />
      </div>
    </DropdownMenu>
  );
};
