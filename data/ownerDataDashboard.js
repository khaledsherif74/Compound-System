export const ownerInfo = {
  ownerName: "Ahmed Mohamed",
  unitNumber: "A-102",
  phoneNumber: "+20 100 123 4567",
  email: "ahmed.mohamed@example.com",
};

// export const initialVehicles = [
//   {
//     id: 1,
//     name: "Vehicle 1",
//     plateNumber: "أ ب ج-1234",
//     brand: "Toyota",
//     model: "Corolla",
//     color: "White",
//   },
//    {
//     id: 2,
//     name: "Vehicle 2",
//     plateNumber: "ع ف ق-1234",
//     brand: "Toyota",
//     model: "Corolla",
//     color: "White",
//   },
// ];

// export const logsData = [
//   {
//     id: 1,
//     vehicle: "ج د و-1234",
//     action: "Entry",
//     date: "10 Aug 2026",
//     time: "08:35 AM",
//     gateNum: "Gate 1",
//     brand: "Toyota",
//     color: "White",
//   },
//   {
//     id: 2,
//     vehicle: "ب ث ر-1234",
//     action: "Exit",
//     date: "10 Aug 2026",
//     time: "01:20 PM",
//     gateNum: "Gate 2",
//     brand: "Hyundai",
//     color: "Black",
//   },
//   {
//     id: 3,
//     vehicle: "ط د م-5678",
//     action: "Entry",
//     date: "09 Aug 2026",
//     time: "06:45 PM",
//     gateNum: "Gate 1",
//     brand: "Kia",
//     color: "Silver",
//   },
//   {
//     id: 4,
//     vehicle: "س ث ش-9012",
//     action: "Entry",
//     date: "09 Aug 2026",
//     time: "07:15 AM",
//     gateNum: "Gate 3",
//     brand: "Nissan",
//     color: "Red",
//   },
//   {
//     id: 5,
//     vehicle: "م ص ر-9012",
//     action: "Exit",
//     date: "09 Aug 2026",
//     time: "03:40 PM",
//     gateNum: "Gate 2",
//     brand: "Toyota",
//     color: "Blue",
//   },
// ];
export const OWNER_VEHICLE_COLUMNS = [
  // {
  //   key: "name",
  //   label: "Vehicle",
  //   searchable: true,
  //   sortable: true,
  //   cellClassName: "px-4 py-4 font-semibold text-gray-800",
  // },
  {
    key: "plateNumber",
    label: "Plate Number",
    searchable: true,
    sortable: true,
    cellClassName: "px-4 py-4 font-mono text-gray-600",
  },
  { key: "brand", label: "Brand", searchable: true, sortable: true },
  // { key: "model", label: "Model", searchable: true, sortable: true },
  { key: "color", label: "Color", searchable: true, sortable: true },
  { key: "status", label: "Status", searchable: false, sortable: true },
];

export const OWNER_LOG_COLUMNS = [
  {
    key: "vehicle",
    label: "Vehicle",
    searchable: true,
    sortable: true,
    cellClassName: "px-4 py-4 font-semibold text-gray-800",
  },
  { key: "brand", label: "Brand", searchable: true, sortable: true },
  { key: "color", label: "Color", searchable: true, sortable: true },
  {
    key: "gateNum",
    label: "Gate Number",
    searchable: true,
    sortable: true,
    cellClassName: "px-4 py-4 font-mono font-bold text-blue-600",
  },
  { key: "action", label: "Action", searchable: true, sortable: true },
  { key: "date", label: "Date", searchable: true, sortable: true },
  { key: "time", label: "Time", searchable: true, sortable: true },
];