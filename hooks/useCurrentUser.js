"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import api from "@/Services/api";

import {
  setProfileUser,
  setProfileFormData,
  setOriginalProfileData,
  setProfileSaving,
  setProfileMessage,
  setProfileMessageType,
} from "@/store/slices/profileSlice";

import { requestUserRefetch } from "@/store/slices/supervisorDashboardSlice";

// ============================================================
// GET USER NAME
// ============================================================

const getUserName = (user) => {
  if (!user) {
    return "";
  }

  // Backend returns name
  if (typeof user.name === "string" && user.name.trim()) {
    return user.name;
  }

  // Backend returns firstName + lastName
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  // Other possible backend naming
  if (typeof user.fullName === "string" && user.fullName.trim()) {
    return user.fullName;
  }

  return "";
};

// ============================================================
// GET UNIT
// ============================================================

const getUnit = (user) => {
  if (!user) {
    return "";
  }

  /*
   * Example:
   *
   * unit: {
   *   id: "...",
   *   unitCode: "A-101"
   * }
   */

  if (user.unit && typeof user.unit === "object") {
    return (
      user.unit.unitCode ||
      user.unit.code ||
      user.unit.number ||
      user.unit.name ||
      ""
    );
  }

  /*
   * Example:
   *
   * unit: "A-101"
   */

  if (typeof user.unit === "string") {
    return user.unit;
  }

  /*
   * Possible direct unit fields
   */

  if (user.unitCode) {
    return user.unitCode;
  }

  if (user.unitNumber) {
    return user.unitNumber;
  }

  return "";
};

// ============================================================
// NORMALIZE USER RESPONSE
// ============================================================

export const normalizeUser = (user) => {
  if (!user) {
    return {
      name: "",
      email: "",
      phone: "",
      unit: "",
      role: "",
    };
  }

  return {
    name: getUserName(user),

    email: user.email || "",

    phone: user.phone || user.phoneNumber || "",

    unit: getUnit(user),

    role: user.role || user.userRole || "",
  };
};

// ============================================================
// EXTRACT USER FROM /auth/me RESPONSE
// ============================================================

const extractUser = (responseData) => {
  if (responseData?.data?.user) {
    return responseData.data.user;
  }

  if (responseData?.data) {
    return responseData.data;
  }

  if (responseData?.user) {
    return responseData.user;
  }

  return responseData;
};

// ============================================================
// useCurrentUser
// ============================================================

export default function useCurrentUser() {
  const dispatch = useDispatch();

  const { profileUser, formData, saving, message, messageType } = useSelector(
    (state) => state.profile,
  );

const refetchIndex = useSelector(
  (state) => state.ownerDashboard?.refetchCurrentUser ?? 0,
);

  /*
   * We derive the normalized user from the raw Redux user.
   */

  const user = normalizeUser(profileUser);

  /*
   * Loading is represented by the profile slice's saving
   * state only during updates, so the initial fetch needs
   * a dedicated flag.
   *
   * We use a simple module-level initialization marker to
   * avoid putting duplicated state into the hook.
   */

  const isInitialized = profileUser !== null;

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        dispatch(setProfileSaving(true));
        dispatch(setProfileMessage(""));
        dispatch(setProfileMessageType(""));

        const response = await api.get("/auth/me");

        const extracted = extractUser(response.data);

        if (!extracted || typeof extracted !== "object") {
          throw new Error("User data was not returned from the server.");
        }

        if (!mounted) {
          return;
        }

        const normalizedUser = normalizeUser(extracted);

        dispatch(setProfileUser(extracted));

        dispatch(setProfileFormData(normalizedUser));

        dispatch(setOriginalProfileData(normalizedUser));
      } catch (err) {
        if (!mounted) {
          return;
        }

        dispatch(
          setProfileMessage(
            err.response?.data?.message ||
              err.response?.data?.error ||
              err.message ||
              "Failed to load profile.",
          ),
        );

        dispatch(setProfileMessageType("error"));
      } finally {
        if (mounted) {
          dispatch(setProfileSaving(false));
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [dispatch, refetchIndex]);

  const refetch = () => {
    dispatch(requestUserRefetch());
  };

  return {
    user,
    rawUser: profileUser,
    loading: !isInitialized,
    error: messageType === "error" ? message : "",
    refetch,
  };
}
