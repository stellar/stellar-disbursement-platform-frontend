import { Fragment } from "react";
import { Icon } from "@stellar/design-system";
import { Link } from "react-router-dom";
import "./styles.scss";

type Breadcrumb = {
  label: string;
  route?: string;
};

export const Breadcrumbs = ({ steps }: { steps: Breadcrumb[] }) => (
  <nav className="Breadcrumbs" aria-label="breadcrumbs">
    {steps.map((step, index) => {
      if (step.route) {
        return (
          <Fragment key={`step-${index}`}>
            <Link className="Link Link--primary" to={step.route}>
              {step.label}
            </Link>
            <span className="Breadcrumbs__separator" aria-hidden="true">
              <Icon.ChevronRight />
            </span>
          </Fragment>
        );
      }

      return (
        <span aria-current="location" key="step-current">
          {step.label}
        </span>
      );
    })}
  </nav>
);
