"use client";

import { useEffect } from "react";

export default function useClickOutside(
  ref,
  onOutsideClick,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        onOutsideClick(event);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [ref, onOutsideClick, enabled]);
}