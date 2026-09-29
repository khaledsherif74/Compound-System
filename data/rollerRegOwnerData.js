export const DISALLOWED_PLATE_LETTERS =
  new Set([
    "ت",
    "ث",
    "ح",
    "خ",
    "ذ",
    "ز",
    "ش",
    "ض",
    "ظ",
    "غ",
    "ك",
  ]);

export const VEHICLE_COLORS = [
  {
    name: "White",
    arabic: "أبيض",
    value: "White",
    hex: "#FFFFFF",
  },

  {
    name: "Black",
    arabic: "أسود",
    value: "Black",
    hex: "#111827",
  },

  {
    name: "Gray",
    arabic: "رمادي",
    value: "Gray",
    hex: "#6B7280",
  },

  {
    name: "Silver",
    arabic: "فضي",
    value: "Silver",
    hex: "#C0C0C0",
  },

  {
    name: "Red",
    arabic: "أحمر",
    value: "Red",
    hex: "#EF4444",
  },

  {
    name: "Blue",
    arabic: "أزرق",
    value: "Blue",
    hex: "#3B82F6",
  },

  {
    name: "Dark Blue",
    arabic: "أزرق داكن",
    value: "Dark Blue",
    hex: "#1E3A8A",
  },

  {
    name: "Green",
    arabic: "أخضر",
    value: "Green",
    hex: "#22C55E",
  },

  {
    name: "Dark Green",
    arabic: "أخضر داكن",
    value: "Dark Green",
    hex: "#166534",
  },

  {
    name: "Yellow",
    arabic: "أصفر",
    value: "Yellow",
    hex: "#EAB308",
  },

  {
    name: "Orange",
    arabic: "برتقالي",
    value: "Orange",
    hex: "#F97316",
  },

  {
    name: "Brown",
    arabic: "بني",
    value: "Brown",
    hex: "#92400E",
  },

  {
    name: "Beige",
    arabic: "بيج",
    value: "Beige",
    hex: "#D6C6A5",
  },

  {
    name: "Gold",
    arabic: "ذهبي",
    value: "Gold",
    hex: "#D4AF37",
  },

  {
    name: "Purple",
    arabic: "بنفسجي",
    value: "Purple",
    hex: "#8B5CF6",
  },

  {
    name: "Maroon",
    arabic: "نبيتي",
    value: "Maroon",
    hex: "#800000",
  },
];

export const VEHICLE_LIMIT_OPTIONS = [
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
];

export const CAR_STATUS_OPTIONS = [
  {
    value: "allowed",
    label: "Allowed",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
  },

  {
    value: "pending",
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 border-amber-200",
  },

  {
    value: "blocked",
    label: "Blocked",
    className:
      "bg-red-100 text-red-700 border-red-200",
  },
];

export const EMPTY_OWNER_FORM = {
  firstName: "",
  lastName: "",
  unitNumber: "",
  phone: "",
  email: "",
  vehicleLimit: "1",
};

export const EMPTY_VEHICLE_FORM = {
  plateLetters: ["", "", ""],
  plateNumbers: "",
  model: "",
  brand: "",
  color: "",
  licenseFile: null,
  licenseFileName: "",
};

// No dummy data.
// Owners must only ever come from GET /users.