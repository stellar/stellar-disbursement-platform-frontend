import React, { useCallback, useEffect, useRef, useState } from "react";

import Recaptcha from "react-google-recaptcha";

import { RECAPTCHA_SITE_KEY, SINGLE_TENANT_MODE } from "@/constants/envVariables";

import { getCaptchaConfig, CaptchaConfig } from "@/api/getCaptchaConfig";

import { getSdpTenantName } from "@/helpers/getSdpTenantName";
import { loadRecaptchaV3Script, executeRecaptchaV3 } from "@/helpers/recaptchaV3";

export const useCaptcha = (recaptchaRef: React.RefObject<Recaptcha | null>) => {
  const lastFetchedOrgName = useRef<string | null>(null);

  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | null>(null);
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
      const config = await getCaptchaConfig(orgName);
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
    const orgName = SINGLE_TENANT_MODE ? "" : getSdpTenantName();
    fetchCaptchaConfig(orgName);
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
      lastFetchedOrgName.current = null;
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

  const isPending = captchaConfigLoading || (isV2 && !recaptchaToken);

  return {
    isV2,
    isV3,
    isCaptchaDisabled,
    isPending,
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
