import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./Responsive.css";
import { ClockProvider } from "./context/ClockContext";
import { MobileNavProvider } from "./context/MobileNavContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <ThemeProvider>
      <ClockProvider>
        <MobileNavProvider>
            <App />
        </MobileNavProvider>
      </ClockProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
