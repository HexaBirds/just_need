import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer, toast } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./store/AuthContext.jsx";

import ServiceContext from "./store/ServiceContext.jsx";

import PolicyProvider from "./store/PrivacyPolicy.jsx";

import BannerProvider from "./store/BannerContext.jsx";
import ListingProvider from "./store/ListingContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ServiceContext>

        <AuthProvider>
          <PolicyProvider>
            <BannerProvider>
              <ListingProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </ListingProvider>
            </BannerProvider>
          </PolicyProvider>
        </AuthProvider>

    </ServiceContext>
    <ToastContainer />
  </StrictMode>
);
