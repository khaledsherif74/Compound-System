"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setField } from "@/store/slices/adminUiSlice";

export default function useReduxUIState(key, initialValue) {
  const dispatch = useDispatch();

  const storedValue = useSelector(
    (state) => state.adminUi?.[key],
  );

  const value =
    storedValue === undefined
      ? initialValue
      : storedValue;

  const setValue = useCallback(
    (nextValue) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? nextValue(value)
          : nextValue;

      dispatch(
        setField({
          key,
          value: resolvedValue,
        }),
      );
    },
    [dispatch, key, value],
  );

  return [value, setValue];
}