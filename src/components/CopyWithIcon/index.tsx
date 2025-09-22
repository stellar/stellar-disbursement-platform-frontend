import { CopyText, Icon } from "@stellar/design-system";
import "./styles.scss";

interface CopyWithIconProps {
  textToCopy: string;
  doneLabel?: string;
  children: React.ReactNode | string;
  iconSizeRem: string;
}

export const CopyWithIcon = ({
  textToCopy,
  doneLabel = "Copied",
  children,
  iconSizeRem,
}: CopyWithIconProps) => {
  const customStyle = {
    width: `${iconSizeRem}rem`,
    height: `${iconSizeRem}rem`,
  } as React.CSSProperties;

  return (
    <CopyText textToCopy={textToCopy} doneLabel={doneLabel} tooltipPlacement="right">
      <div className="CopyWithIcon">
        {children}
        <div className="CopyWithIcon__icon" style={customStyle}>
          <Icon.Copy01 />
        </div>
      </div>
    </CopyText>
  );
};
