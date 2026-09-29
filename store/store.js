import { configureStore } from "@reduxjs/toolkit";

import accessLogsReducer from "./slices/accessLogsSlice";
import dashboardHeaderReducer from "./slices/dashboardHeaderSlice";
import profileReducer from "./slices/profileSlice";
import tableLogsReducer from "./slices/tableLogsSlice";
import registrationReducer from "./slices/registrationSlice";
import ownerDashboardReducer from "./slices/ownerDashboardSlice";
import supervisorDashboardReducer from "./slices/supervisorDashboardSlice";
import rollerSupervisorEmployeeReducer from "./slices/rollerSupervisorEmployeeSlice";
import rollerRegOwnerReducer from "./slices/rollerRegOwnerSlice";
import employeeCarsReducer from "./slices/employeeCarsSlice";
import ownerRegistrationReducer from "./slices/ownerRegistrationSlice";
import registryReducer from "./slices/registrySlice";
import authReducer from "./slices/authSlice";
import adminUiReducer from "./slices/adminUiSlice";
import usersReducer from "./slices/usersSlice";
export const store = configureStore({
  reducer: {
    accessLogs: accessLogsReducer,
    dashboardHeader: dashboardHeaderReducer,
    profile: profileReducer,
    tableLogs: tableLogsReducer,
    registration: registrationReducer,
    ownerDashboard: ownerDashboardReducer,
    supervisorDashboard: supervisorDashboardReducer,
    rollerSupervisorEmployee: rollerSupervisorEmployeeReducer,
    rollerRegOwner: rollerRegOwnerReducer,
    employeeCars: employeeCarsReducer,
    ownerRegistration: ownerRegistrationReducer,
    registry: registryReducer,
    auth: authReducer,
    adminUi: adminUiReducer,
    users: usersReducer,
  },
});

export default store;
