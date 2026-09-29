import {
  User,
  ShieldCheck,
  UserRound,
  Car
} from "lucide-react";


const MANAGEMENT_BUTTONS = [
  {
    id: "security",
    label: "Add Supervisor",
    description: "Manage supervisor staff",
    icon: ShieldCheck,
    route: "/roller/Roller_supervisor_reg",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-200",
    hoverBg: "hover:bg-blue-50/50",
  },
  {
    id: "owner",
    label: "Add Owner",
    description: "Manage owner employees",
    icon: UserRound,
    // route: "/owner_dashboard/owner_reg_form",
    route: "/roller/reg_owners",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    hoverBorder: "hover:border-indigo-200",
    hoverBg: "hover:bg-indigo-50/50",
  },
  {
    id: "car",
    label: "Add Employee Car",
    description: "Manage employee vehicles",
    icon: Car,
    route: "/roller/employee_cars",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    hoverBorder: "hover:border-green-200",
    hoverBg: "hover:bg-green-50/50",
  },
];


export {rollerData,MANAGEMENT_BUTTONS}