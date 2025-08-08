import { Button, Icon, ThemeSwitch } from "@stellar/design-system";
import { PROJECT_NAME, Routes } from "constants/settings";
import { DropdownMenu } from "components/DropdownMenu";
import { formatDateTimeWithGmt } from "helpers/formatIntlDateTime";
import "./styles.scss";

type PageHeaderProps = {
  username?: string;
  onSignOut?: () => void;
  logoImage?: string;
  companyName?: string;
};

export const PageHeader = ({ username, onSignOut, logoImage, companyName }: PageHeaderProps) => {
  return (
    <div className={`PageHeader ${username ? "PageHeader--internal" : ""}`}>
      <div className="PageHeader__inset">
        <div className="PageHeader__logo">
          {username && (
            <div className="CompanyBrand">
              <div
                className="CompanyBrand__logo"
                style={{ backgroundImage: `url(${logoImage})` }}
              ></div>
              <div className="CompanyBrand__name">{companyName || "Company Name"}</div>
            </div>
          )}
        </div>
      </div>

      <div className="PageHeader__content">
        <div className="PageHeader__inset">
          {username ? (
            <div className="PageHeader--left">
              <div className="DateTime">
                <span className="DateTime__icon">
                  <Icon.Clock />
                </span>
                {formatDateTimeWithGmt()}
              </div>
            </div>
          ) : null}
          <div className="PageHeader--right">
            {username ? (
              <DropdownMenu
                triggerEl={
                  <Button variant="tertiary" size="sm">
                    {username}
                  </Button>
                }
              >
                <DropdownMenu.Item to={Routes.PROFILE}>Profile</DropdownMenu.Item>
                <DropdownMenu.Item to={Routes.HELP}>Help</DropdownMenu.Item>
                <DropdownMenu.Item onClick={onSignOut} isHighlight>
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu>
            ) : null}

            <ThemeSwitch storageKeyId={`stellarTheme:${PROJECT_NAME}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
