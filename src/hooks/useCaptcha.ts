import React, { useCallback, useEffect, useRef, useState } from "react";

import Recaptcha from "react-google-recaptcha";

import { getAppConfig, AppConfig } from "@/api/getAppConfig";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { loadRecaptchaV3Script, executeRecaptchaV3 } from "@/helpers/recaptchaV3";

export const useCaptcha = (recaptchaRef: React.RefObject<Recaptcha | null>) => {
  const lastFetchedOrgName = useRef<string | null>(null);

  const [captchaConfig, setCaptchaConfig] = useState<AppConfig | null>(null);
  const [captchaConfigLoading, setCaptchaConfigLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const isCaptchaDisabled = captchaConfig?.captcha_disabled === true;
  const isV3 =
    Boolean(captchaConfig) &&
    !isCaptchaDisabled &&
    captchaConfig?.captcha_type === "GOOGLE_RECAPTCHA_V3";
  const isV2 = Boolean(captchaConfig) && !isCaptchaDisabled && !isV3;

  const fetchCaptchaConfig = useCallback(async (orgName: string) => {
    if (orgName === lastFetchedOrgName.current) {
      return;
    }

    setCaptchaConfigLoading(true);

    try {
      const config = await getAppConfig();
      lastFetchedOrgName.current = orgName;
      setCaptchaConfig(config);
    } catch {
      lastFetchedOrgName.current = null;
      setCaptchaConfig(null);
    } finally {
      setCaptchaConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptchaConfig(getSdpTenantName());
  }, [fetchCaptchaConfig]);

  const siteKey = captchaConfig?.captcha_site_key ?? "";

  // Load v3 script when needed
  useEffect(() => {
    if (isV3 && siteKey) {
      loadRecaptchaV3Script(siteKey).catch((err) => {
        console.error("Failed to load reCAPTCHA v3:", err);
      });
    }
  }, [isV3, siteKey]);

  const onRecaptchaV2Change = (token: string | null) => {
    if (token) {
      setRecaptchaToken(token);
    }
  };

  const onOrgNameChange = (orgName: string) => {
    if (orgName !== lastFetchedOrgName.current) {
      lastFetchedOrgName.current = null;
      setCaptchaConfig(null);
      setRecaptchaToken("");
    }
  };

  const onOrgNameBlur = (orgName: string) => {
    if (orgName) {
      fetchCaptchaConfig(orgName);
    }
  };

  /** Get the recaptcha token for form submission. For v3, executes at call time. */
  const getToken = async (action: string): Promise<string> => {
    if (isCaptchaDisabled) {
      return "";
    }

    if (isV3) {
      return executeRecaptchaV3(siteKey, action);
    }

    return recaptchaToken;
  };

  const resetCaptcha = () => {
    if (isV2) {
      recaptchaRef.current?.reset();
    }
    setRecaptchaToken("");
  };

  const isPending = captchaConfigLoading || (isV2 && !recaptchaToken);

  return {
    isV2,
    isV3,
    isCaptchaDisabled,
    isPending,
    captchaConfigLoading,
    recaptchaToken,
    siteKey,
    onRecaptchaV2Change,
    onOrgNameChange,
    onOrgNameBlur,
    getToken,
    resetCaptcha,
  };
};
