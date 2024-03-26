import { ForwardedRef, forwardRef, useState } from "react";
import Recaptcha from "react-google-recaptcha";
import { Loader } from "@stellar/design-system";
import { RECAPTCHA_SITE_KEY } from "constants/envVariables";

import "./styles.scss";

export const ReCaptcha = forwardRef(
  (
    {
      onSubmit,
    }: {
      onSubmit: (token: string | null) => void;
    },
    ref: ForwardedRef<Recaptcha>,
  ) => {
    const [isRecaptchaLoading, setIsRecaptchaLoading] = useState(true);

    return (
      <div className="RecaptchaContainer">
        {isRecaptchaLoading ? <Loader /> : null}
        <Recaptcha
          ref={ref}
          size="normal"
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={onSubmit}
          asyncScriptOnLoad={() => {
            setIsRecaptchaLoading(false);
          }}
        />
      </div>
    );
  },
);
