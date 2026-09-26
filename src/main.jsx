import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ShopProvider } from "./context/ShopContext";
import { AdminProvider } from "./context/AdminContext";
import "@fontsource-variable/inter";
import "@fontsource-variable/bodoni-moda";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ShopProvider>
        <AdminProvider>
          <App />
        </AdminProvider>
      </ShopProvider>
    </BrowserRouter>
  </React.StrictMode>
);
