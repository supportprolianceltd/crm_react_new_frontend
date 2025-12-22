import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SelectedFeaturesProvider } from "../../context/SelectedFeaturesContext";
import "./CRMLandingpage.css";
import NavBar from "./NavBar";
import Home from "./Home";
import Contact from "./Contact";
import RequestDemo from "./RequestDemo";
import LoginPage from "./Login";
import RegisterPage from "./Register";
import AuthPage from "./AuthPage";
import CodeVerificationPage from "./CodeVerification";
import ForgotPasswordPage from "./ForgotPassword";
import NewPasswordPage from "./NewPassword";
import JobApplication from "./JobApplication";
import Recruitment from "./Features/Recruitment";
import AssetsManagement from "./Features/AssetsManagement";
import AuditCompliance from "./Features/AuditCompliance";
import Finance from "./Features/Finance";
import HumanResources from "./Features/HumanResources";
import Rostering from "./Features/Rostering";
import Training from "./Features/Training";
import ApplicantDashboard from "../ApplicantDashboard/Dashboard";
import TermsAndConditionsPage from "./TermsAndConditionsPage";
import CreateOrEditTenantPage from "../Tenants/CreateOrEditTenantPage";
import TenantsListPage from "../Tenants/TenantsListPage";
import TenantDetailsPage from "../Tenants/TenantDetailsPage";
import CreatePublicExternalRequestPage from "./CreatePublicExternalRequestPage";
import Footer from "./Footer";
import About from "./About";
import SupportChat from "./SupportChat";
import Admin from "./Features/Admin";
import BookDemo from "./BookDemo";
import PrivacyPolicy from "./PrivacyPolicy";

const CRMLandingpage = () => {
  const location = useLocation();

  const regPagePaths = ["/login", "/register", "/code-verification"];
  const isRegPage = regPagePaths.includes(location.pathname);

  const isApplicantDashboard = location.pathname.startsWith(
    "/application-dashboard"
  );

  return (
    <SelectedFeaturesProvider>
      <div
        className={`CRMLandingpagee 
          ${isRegPage ? "Reg_Page" : ""} 
          ${isApplicantDashboard ? "application-dashboard-nav" : ""}`}
      >
        <NavBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/support-chat" element={<SupportChat />} />
          <Route path="/request-for-demo" element={<RequestDemo />} />
          <Route path="/book-a-demo" element={<BookDemo />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/code-verification" element={<CodeVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/jobs/:unique_link" element={<JobApplication />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/assets-management" element={<AssetsManagement />} />
          <Route path="/audit-compliance" element={<AuditCompliance />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/human-resources" element={<HumanResources />} />
          <Route path="/rostering" element={<Rostering />} />
          <Route path="/training" element={<Training />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/application-dashboard/:job_application_code/:email/:unique_link"
            element={<ApplicantDashboard />}
          />
          <Route path="/terms" element={<TermsAndConditionsPage />} />
          <Route
            path="/create-external-request/:tenantId"
            element={<CreatePublicExternalRequestPage />}
          />

          {/* Tenant Routes */}
          <Route path="/tenants" element={<TenantsListPage />} />
          <Route path="/tenants/create" element={<CreateOrEditTenantPage />} />
          <Route
            path="/tenants/view/:tenantId"
            element={<TenantDetailsPage />}
          />
        </Routes>

        <Footer />
      </div>
    </SelectedFeaturesProvider>
  );
};

export default CRMLandingpage;
