import React, { useCallback, useEffect, useRef, useState } from "react";

import Recaptcha from "react-google-recaptcha";

import { RECAPTCHA_SITE_KEY, SINGLE_TENANT_MODE } from "@/constants/envVariables";

import { getCaptchaConfig, CaptchaConfig } from "@/api/getCaptchaConfig";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { loadRecaptchaV3Script, executeRecaptchaV3 } from "@/helpers/recaptchaV3";

export const useCaptcha = (recaptchaRef: React.RefObject<Recaptcha | null>) => {
  const lastFetchedOrgName = useRef("");

  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | null>(null);
  const [captchaConfigLoading, setCaptchaConfigLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const isCaptchaDisabled = captchaConfig?.captcha_disabled === true;
  const isV3 = !isCaptchaDisabled && captchaConfig?.captcha_type === "GOOGLE_RECAPTCHA_V3";
  const isV2 = !isCaptchaDisabled && !isV3;

  const fetchCaptchaConfig = useCallback(async (orgName: string) => {
    if (!orgName || orgName === lastFetchedOrgName.current) {
      return;
    }

    lastFetchedOrgName.current = orgName;
    setCaptchaConfigLoading(true);

    try {
      const config = await getCaptchaConfig(orgName);
      setCaptchaConfig(config);
    } catch {
      setCaptchaConfig(null);
    } finally {
      setCaptchaConfigLoading(false);
    }
  }, []);

  // Fetch config for prefilled org name on mount
  useEffect(() => {
    const prefilled = getSdpTenantName();
    if (!SINGLE_TENANT_MODE && prefilled) {
      fetchCaptchaConfig(prefilled);
    }
  }, [fetchCaptchaConfig]);

  // Load v3 script when needed
  useEffect(() => {
    if (isV3) {
      loadRecaptchaV3Script(RECAPTCHA_SITE_KEY).catch((err) => {
        console.error("Failed to load reCAPTCHA v3:", err);
      });
    }
  }, [isV3]);

  const onRecaptchaV2Change = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  const onOrgNameChange = (orgName: string) => {
    if (orgName !== lastFetchedOrgName.current) {
      setCaptchaConfig(null);
      setRecaptchaToken("");
    }
  };

  const onOrgNameBlur = (orgName: string) => {
    if (!SINGLE_TENANT_MODE && orgName) {
      fetchCaptchaConfig(orgName);
    }
  };

  /** Get the recaptcha token for form submission. For v3, executes at call time. */
  const getToken = async (action: string): Promise<string> => {
    if (isCaptchaDisabled) {
      return "";
    }

    if (isV3) {
      return executeRecaptchaV3(RECAPTCHA_SITE_KEY, action);
    }

    return recaptchaToken;
  };

  const resetCaptcha = () => {
    if (isV2) {
      recaptchaRef.current?.reset();
    }
    setRecaptchaToken("");
  };

  return {
    isV2,
    isV3,
    isCaptchaDisabled,
    captchaConfigLoading,
    recaptchaToken,
    siteKey: RECAPTCHA_SITE_KEY,
    onRecaptchaV2Change,
    onOrgNameChange,
    onOrgNameBlur,
    getToken,
    resetCaptcha,
  };
};
