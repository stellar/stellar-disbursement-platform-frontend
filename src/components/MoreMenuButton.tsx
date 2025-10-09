import { Icon } from "@stellar/design-system";

export const MoreMenuButton = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="CardStack__dropdownMenu" {...props}>
    <Icon.DotsVertical />
  </div>
);
