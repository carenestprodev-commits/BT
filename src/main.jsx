import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { ToastProvider } from "./Context/ToastContext";
import { AuthProvider } from "./Context/AuthContext";
import { NotificationProvider } from "./Context/NotificationContext";

import { RouterProvider } from "react-router-dom";
import { router } from "./Routes/router";
import { loadHourlyRatePolicies } from "./constants/hourlyRates";

loadHourlyRatePolicies();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
