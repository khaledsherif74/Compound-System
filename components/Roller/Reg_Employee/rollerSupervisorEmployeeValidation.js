export const INITIAL_EMPLOYEE_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
};

// =========================================================
// REGEX
// =========================================================

const NAME_REGEX =
  /^[A-Za-z\u0600-\u06FF]+(?:\s+[A-Za-z\u0600-\u06FF]+)*$/;

const EGYPTIAN_PHONE_REGEX =
  /^(010|011|012|015)\d{8}$/;

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const ID_REGEX =
  /^\d+$/;

const USERNAME_REGEX =
  /^[A-Za-z0-9._-]+$/;

// =========================================================
// VALIDATE IDENTIFIER
// =========================================================

function validateIdentifier(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Email, ID, or username is required.";
  }

  // ---------------------------------------------------------
  // EMAIL
  // ---------------------------------------------------------

  if (trimmedValue.includes("@")) {
    if (!EMAIL_REGEX.test(trimmedValue)) {
      return "Enter a valid email, ID, or username.";
    }

    return "";
  }

  // ---------------------------------------------------------
  // ID
  // ---------------------------------------------------------

  if (ID_REGEX.test(trimmedValue)) {
    return "";
  }

  // ---------------------------------------------------------
  // USERNAME
  // ---------------------------------------------------------

  if (!USERNAME_REGEX.test(trimmedValue)) {
    return "Use a valid email, ID, or username.";
  }

  if (trimmedValue.length < 3) {
    return "Username must contain at least 3 characters.";
  }

  if (trimmedValue.length > 50) {
    return "Username must not exceed 50 characters.";
  }

  return "";
}

// =========================================================
// VALIDATE SINGLE FIELD
// =========================================================

export function validateEmployeeField(
  name,
  value,
  editingId
) {
  const trimmedValue = value.trim();

  switch (name) {
    // =======================================================
    // FIRST NAME
    // =======================================================

    case "firstName":
      if (!trimmedValue) {
        return "First name is required.";
      }

      if (!NAME_REGEX.test(trimmedValue)) {
        return "First name can contain letters and spaces only.";
      }

      if (trimmedValue.length < 2) {
        return "First name must contain at least 2 characters.";
      }

      return "";

    // =======================================================
    // LAST NAME
    // =======================================================

    case "lastName":
      if (!trimmedValue) {
        return "Last name is required.";
      }

      if (!NAME_REGEX.test(trimmedValue)) {
        return "Last name can contain letters and spaces only.";
      }

      if (trimmedValue.length < 2) {
        return "Last name must contain at least 2 characters.";
      }

      return "";

    // =======================================================
    // PHONE
    // =======================================================

    case "phone":
      if (!trimmedValue) {
        return "Phone number is required.";
      }

      if (!/^\d+$/.test(trimmedValue)) {
        return "Phone number can contain numbers only.";
      }

      if (!EGYPTIAN_PHONE_REGEX.test(trimmedValue)) {
        return "Enter a valid Egyptian mobile number.";
      }

      return "";

    // =======================================================
    // EMAIL / ID / USERNAME
    // =======================================================

    case "email":
      return validateIdentifier(
        trimmedValue
      );

    // =======================================================
    // PASSWORD
    // =======================================================

    case "password":
      if (
        editingId &&
        !trimmedValue
      ) {
        return "";
      }

      if (!trimmedValue) {
        return "Password is required.";
      }

      if (trimmedValue.length < 8) {
        return "Password must contain at least 8 characters.";
      }

      return "";

    default:
      return "";
  }
}

// =========================================================
// NORMALIZE IDENTIFIER
// =========================================================

function normalizeIdentifier(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

// =========================================================
// GET EMPLOYEE IDENTIFIERS
// =========================================================

function getEmployeeIdentifiers(employee) {
  const identifiers = [];

  if (
    employee.email !== undefined &&
    employee.email !== null
  ) {
    const email =
      normalizeIdentifier(
        employee.email
      );

    if (email) {
      identifiers.push(email);
    }
  }

  if (
    employee.username !== undefined &&
    employee.username !== null
  ) {
    const username =
      normalizeIdentifier(
        employee.username
      );

    if (username) {
      identifiers.push(username);
    }
  }

  if (
    employee.employeeId !== undefined &&
    employee.employeeId !== null
  ) {
    const employeeId =
      normalizeIdentifier(
        employee.employeeId
      );

    if (employeeId) {
      identifiers.push(employeeId);
    }
  }

  if (
    employee.id !== undefined &&
    employee.id !== null
  ) {
    const id =
      normalizeIdentifier(
        employee.id
      );

    if (id) {
      identifiers.push(id);
    }
  }

  return identifiers;
}

// =========================================================
// VALIDATE ENTIRE FORM
// =========================================================

export function validateEmployeeForm(
  form,
  employees,
  editingId
) {
  const errors = {};

  // =======================================================
  // VALIDATE FIELDS
  // =======================================================

  Object.keys(form).forEach(
    (field) => {
      const error =
        validateEmployeeField(
          field,
          form[field],
          editingId
        );

      if (error) {
        errors[field] = error;
      }
    }
  );

  const normalizedIdentifier =
    normalizeIdentifier(
      form.email
    );

  const normalizedPhone =
    String(form.phone ?? "").trim();

  // =======================================================
  // DUPLICATE EMAIL / ID / USERNAME
  // =======================================================

  const duplicateIdentifier =
    employees.some(
      (employee) => {
        if (
          employee?.id ===
          editingId
        ) {
          return false;
        }

        const identifiers =
          getEmployeeIdentifiers(
            employee
          );

        return identifiers.includes(
          normalizedIdentifier
        );
      }
    );

  if (duplicateIdentifier) {
    errors.email =
      "This email, ID, or username is already registered.";
  }

  // =======================================================
  // DUPLICATE PHONE
  // =======================================================

  const duplicatePhone =
    employees.some(
      (employee) =>
        String(
          employee?.phone ?? ""
        ).trim() ===
          normalizedPhone &&
        employee?.id !==
          editingId
    );

  if (duplicatePhone) {
    errors.phone =
      "This phone number is already registered.";
  }

  return errors;
}

// =========================================================
// NORMALIZE INPUT
// =========================================================

export function normalizeEmployeeField(
  name,
  value
) {
  let normalizedValue = value;

  // =======================================================
  // NAMES
  // =======================================================

  if (
    name === "firstName" ||
    name === "lastName"
  ) {
    normalizedValue = value
      .replace(
        /[^A-Za-z\u0600-\u06FF\s]/g,
        ""
      )
      .replace(
        /\s{2,}/g,
        " "
      )
      .replace(
        /^\s+/,
        ""
      );
  }

  // =======================================================
  // PHONE
  // =======================================================

  if (name === "phone") {
    normalizedValue = value
      .replace(/\D/g, "")
      .slice(0, 11);
  }

  // =======================================================
  // EMAIL / ID / USERNAME
  // =======================================================

  if (name === "email") {
    normalizedValue = value
      .replace(/\s/g, "")
      .toLowerCase();
  }

  return normalizedValue;
}