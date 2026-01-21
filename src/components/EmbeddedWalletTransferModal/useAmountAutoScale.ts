import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

const FONT_SIZE_PRECISION = 10;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const roundFontSize = (value: number) =>
  Math.floor(value * FONT_SIZE_PRECISION) / FONT_SIZE_PRECISION;

const readCssNumber = (styles: CSSStyleDeclaration, property: string) => {
  const value = styles.getPropertyValue(property);
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const readMarginLeft = (styles: CSSStyleDeclaration) => {
  const marginValue = styles.marginLeft || "0";
  return Number.parseFloat(marginValue) || 0;
};

const readGap = (styles: CSSStyleDeclaration) => {
  const gapValue = styles.columnGap || styles.gap || "0";
  return Number.parseFloat(gapValue) || 0;
};

const getChevronWidth = (assetButton: HTMLButtonElement | null) =>
  assetButton?.querySelector("svg")?.getBoundingClientRect().width ?? 0;

const setTextContent = (ref: RefObject<HTMLElement | null>, text: string) => {
  if (ref.current) {
    ref.current.textContent = text;
  }
};

const measureTextWidth = (
  amountMeasure: HTMLSpanElement,
  assetMeasure: HTMLSpanElement,
  fontSize: number,
) => {
  const nextFontSize = `${fontSize}px`;
  amountMeasure.style.fontSize = nextFontSize;
  assetMeasure.style.fontSize = nextFontSize;

  return amountMeasure.getBoundingClientRect().width + assetMeasure.getBoundingClientRect().width;
};

const getAvailableTextWidth = (rowWidth: number, assetButton: HTMLButtonElement | null) => {
  if (!assetButton) {
    return rowWidth;
  }

  const assetStyles = window.getComputedStyle(assetButton);
  const assetMarginLeft = readMarginLeft(assetStyles);
  const assetGap = readGap(assetStyles);
  const chevronWidth = getChevronWidth(assetButton);

  return rowWidth - assetMarginLeft - assetGap - chevronWidth;
};

type UseAmountAutoScaleArgs = {
  isOpen: boolean;
  displayAmount: string;
  assetCode: string;
  assetButtonRef: RefObject<HTMLButtonElement | null>;
};

type UseAmountAutoScaleResult = {
  amountRowRef: RefObject<HTMLDivElement | null>;
  amountMeasureRef: RefObject<HTMLSpanElement | null>;
  assetMeasureRef: RefObject<HTMLSpanElement | null>;
};

// Auto-scale the amount row font size to avoid wrapping.
export const useAmountAutoScale = ({
  isOpen,
  displayAmount,
  assetCode,
  assetButtonRef,
}: UseAmountAutoScaleArgs): UseAmountAutoScaleResult => {
  const amountRowRef = useRef<HTMLDivElement | null>(null);
  const amountMeasureRef = useRef<HTMLSpanElement | null>(null);
  const assetMeasureRef = useRef<HTMLSpanElement | null>(null);
  const amountFontSizeRef = useRef<number | null>(null);

  const setRowFontSize = useCallback((size: number) => {
    const row = amountRowRef.current;
    if (!row) {
      return;
    }
    const currentSize = amountFontSizeRef.current;
    if (currentSize !== null && Math.abs(currentSize - size) < 0.05) {
      return;
    }
    const nextValue = `${size}px`;
    const shouldDisableTransition = currentSize !== null && size < currentSize;
    if (shouldDisableTransition) {
      row.style.setProperty("--ew-amount-transition", "none");
    } else {
      row.style.removeProperty("--ew-amount-transition");
    }
    row.style.setProperty("--ew-amount-font-size", nextValue);
    amountFontSizeRef.current = size;
    if (shouldDisableTransition) {
      requestAnimationFrame(() => {
        if (amountRowRef.current) {
          amountRowRef.current.style.removeProperty("--ew-amount-transition");
        }
      });
    }
  }, []);

  const updateAmountFontSize = useCallback(() => {
    const row = amountRowRef.current;
    const amountMeasure = amountMeasureRef.current;
    const assetMeasure = assetMeasureRef.current;
    const assetButton = assetButtonRef.current;

    if (!row || !amountMeasure || !assetMeasure) {
      return;
    }

    const rowWidth = row.getBoundingClientRect().width;
    if (!rowWidth) {
      return;
    }

    const rowStyles = window.getComputedStyle(row);
    const maxFontSize = readCssNumber(rowStyles, "--ew-amount-font-size-max");
    const minFontSize = readCssNumber(rowStyles, "--ew-amount-font-size-min");
    if (!maxFontSize || !minFontSize) {
      return;
    }

    const amountText = amountMeasure.textContent ?? "";
    if (!amountText) {
      setRowFontSize(maxFontSize);
      return;
    }

    const availableTextWidth = getAvailableTextWidth(rowWidth, assetButton);

    if (availableTextWidth <= 0) {
      setRowFontSize(minFontSize);
      return;
    }

    const totalTextWidth = measureTextWidth(amountMeasure, assetMeasure, maxFontSize);

    if (!totalTextWidth || totalTextWidth <= availableTextWidth) {
      setRowFontSize(maxFontSize);
      return;
    }

    const rawFontSize = (availableTextWidth / totalTextWidth) * maxFontSize;
    const clampedFontSize = clamp(rawFontSize, minFontSize, maxFontSize);
    setRowFontSize(roundFontSize(clampedFontSize));
  }, [assetButtonRef, setRowFontSize]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    setTextContent(amountMeasureRef, displayAmount);
    setTextContent(assetMeasureRef, assetCode);
    updateAmountFontSize();
  }, [assetCode, displayAmount, isOpen, updateAmountFontSize]);

  useEffect(() => {
    if (!isOpen || typeof ResizeObserver === "undefined") {
      return;
    }

    const row = amountRowRef.current;
    const amountMeasure = amountMeasureRef.current;
    const assetMeasure = assetMeasureRef.current;
    if (!row || !amountMeasure || !assetMeasure) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateAmountFontSize();
    });

    observer.observe(row);
    observer.observe(amountMeasure);
    observer.observe(assetMeasure);

    return () => {
      observer.disconnect();
    };
  }, [isOpen, updateAmountFontSize]);

  return { amountRowRef, amountMeasureRef, assetMeasureRef };
};
