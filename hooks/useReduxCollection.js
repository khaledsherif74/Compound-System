"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  initializeCollection,
  setCollection,
  addItem as addItemAction,
  updateItem as updateItemAction,
  removeItem as removeItemAction,
  clearCollection as clearCollectionAction,
} from "@/store/slices/registrySlice";

/**
 * useReduxCollection
 *
 * Stores collection data in Redux under:
 *
 * state.registry.collections[key]
 *
 * Example:
 *
 * const {
 *   items,
 *   setItems,
 *   addItem,
 *   updateItem,
 *   removeItem,
 *   clearItems,
 * } = useReduxCollection("gates", []);
 */
export default function useReduxCollection(key, initialItems = []) {
  const dispatch = useDispatch();

  const isInitialized = useSelector((state) =>
    Boolean(state.registry?.initialized?.[key]),
  );

  const storedItems = useSelector(
    (state) => state.registry?.collections?.[key],
  );

  /*
   * Keep the initial value stable.
   *
   * This prevents an inline [] or object passed by the component
   * from causing unnecessary initialization behaviour.
   */
  const initialItemsRef = useRef(initialItems);

  useEffect(() => {
    initialItemsRef.current = initialItems;
  }, [initialItems]);

  /*
   * Initialize the collection only once.
   */
  useEffect(() => {
    if (!key || isInitialized) {
      return;
    }

    dispatch(
      initializeCollection({
        key,
        items: Array.isArray(initialItemsRef.current)
          ? initialItemsRef.current
          : [],
      }),
    );
  }, [dispatch, key, isInitialized]);

  /*
   * Once Redux has initialized the collection, always use Redux data.
   *
   * Before initialization, use the provided initial value.
   */
  const items = isInitialized
    ? Array.isArray(storedItems)
      ? storedItems
      : []
    : Array.isArray(initialItems)
      ? initialItems
      : [];

  /*
   * Replace the complete collection.
   *
   * Supports:
   *
   * setItems([])
   *
   * and:
   *
   * setItems((prev) => [...prev, newItem])
   */
  const setItems = useCallback(
    (value) => {
      if (!key) {
        return;
      }

      const currentItems = Array.isArray(items) ? items : [];

      const nextValue =
        typeof value === "function"
          ? value(currentItems)
          : value;

      dispatch(
        setCollection({
          key,
          items: Array.isArray(nextValue) ? nextValue : [],
        }),
      );
    },
    [dispatch, key, items],
  );

  /*
   * Add one item.
   */
  const addItem = useCallback(
    (item) => {
      if (!key) {
        return;
      }

      dispatch(
        addItemAction({
          key,
          item,
        }),
      );
    },
    [dispatch, key],
  );

  /*
   * Update one item.
   */
  const updateItem = useCallback(
    (id, changes) => {
      if (!key) {
        return;
      }

      dispatch(
        updateItemAction({
          key,
          id,
          changes,
        }),
      );
    },
    [dispatch, key],
  );

  /*
   * Remove one item.
   */
  const removeItem = useCallback(
    (id) => {
      if (!key) {
        return;
      }

      dispatch(
        removeItemAction({
          key,
          id,
        }),
      );
    },
    [dispatch, key],
  );

  /*
   * Clear collection.
   */
  const clearItems = useCallback(() => {
    if (!key) {
      return;
    }

    dispatch(
      clearCollectionAction({
        key,
      }),
    );
  }, [dispatch, key]);

  return {
    items,

    setItems,
    addItem,
    updateItem,
    removeItem,
    clearItems,

    // Compatibility aliases.
    data: items,
    collection: items,
    setCollection: setItems,
    clearCollection: clearItems,

    dispatch,
  };
}