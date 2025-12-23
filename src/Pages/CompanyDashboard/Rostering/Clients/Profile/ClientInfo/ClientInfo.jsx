import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import BasicInfo from "./BasicInfo";
import ContactInfo from "./ContactInfo";
import CultureInfo from "./CultureInfo";
import LifeHistory from "./LifeHistory";
import NextOfKin from "./NextOfKin";
import Address from "./Address";
import MedicalInfo from "./MedicalInfo";
import LegalCapacity from "./LegalCapacity";
import LegalCapacityDetails from "./LegalCapacityDetails";
import Admin from "./Admin";
import AdminDetails from "./AdminDetails";
import { fetchCarePlanByClient } from "../../../config/apiConfig";

const ClientInfo = ({ clientData }) => {
  const [carePlan, setCarePlan] = useState(null);
  const [loadingCarePlan, setLoadingCarePlan] = useState(false);

  const clientId = clientData?.id;

  // console.log("[ClientInfo] clientData:", clientData);

  useEffect(() => {
    // console.log("ClientInfo useEffect triggered, clientId:", clientId, "clientData:", clientData);
    // console.log("fetchCarePlanByClient:", fetchCarePlanByClient);
    if (clientId) {
      // console.log("Making API call for clientId:", clientId);
      setLoadingCarePlan(true);
      fetchCarePlanByClient(clientId)
        .then((data) => {
          // console.log("API response:", data);
          // API returns an array, take the first care plan
          setCarePlan(Array.isArray(data) ? data[0] : data);
        })
        .catch((error) => {
          console.error("Error fetching care plan:", error);
        })
        .finally(() => {
          setLoadingCarePlan(false);
        });
    } else {
      console.log("No clientId, skipping API call");
    }
  }, [clientId]);

  const tabs = ["Basic Information", "Contact Information", "Address Details", "Next of Kin/Emergency Details", "Culture Value and Identity", "Life History", "Medical Information", "Legal Capacity", "Admin"];

  const [searchParams, setSearchParams] = useSearchParams();
  const [legalData, setLegalData] = useState({});
  const [adminData, setAdminData] = useState({});
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    updated: false,
    title: "",
  });
  const [errorAlert, setErrorAlert] = useState({ show: false, message: "" });

  const activeTab = searchParams.get("tab") || "Basic Information";
  const mode =
    activeTab === "Legal Capacity" || activeTab === "Admin"
      ? searchParams.get("mode") || "edit"
      : "view";

  const handleTabClick = (tab) => {
    const params = { tab };
    if (tab === "Legal Capacity" || tab === "Admin") {
      params.mode = "edit";
    } else {
      params.mode = "view";
    }
    setSearchParams(params);
  };

  const handleModeChange = (newMode) => {
    setSearchParams({ tab: activeTab, mode: newMode });
  };

  const isDataEmpty = (data) => {
    return Object.values(data).every((value) => {
      if (Array.isArray(value)) return value.length === 0;
      return !value || value.trim() === "";
    });
  };

  const hasPreviousData = (data) => {
    return Object.values(data).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value.trim() !== "";
    });
  };

  const handleError = (message) => {
    setErrorAlert({ show: true, message });
    setTimeout(() => setErrorAlert((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleLegalSave = (data) => {
    const previousData = legalData;
    setLegalData(data);
    const updated = hasPreviousData(previousData);
    setSuccessAlert({
      show: true,
      updated,
      title: "Legal Capacity",
    });
    setTimeout(
      () => setSuccessAlert((prev) => ({ ...prev, show: false })),
      3000
    );
    handleModeChange("view");
  };

  const handleAdminSave = (data) => {
    const previousData = adminData;
    setAdminData(data);
    const updated = hasPreviousData(previousData);
    setSuccessAlert({
      show: true,
      updated,
      title: "Admin",
    });
    setTimeout(
      () => setSuccessAlert((prev) => ({ ...prev, show: false })),
      3000
    );
    handleModeChange("view");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Basic Information":
        return <BasicInfo key="basic" clientData={clientData} />;
      case "Contact Information":
        return <ContactInfo key="contact" clientData={clientData} />;
      case "Address Details":
        return <Address key="address" clientData={clientData} />;
      case "Next of Kin/Emergency Details":
        return <NextOfKin key="nextkin" clientData={clientData} />;
      case "Culture Value and Identity":
        return <CultureInfo key="culture" clientData={clientData} carePlan={carePlan} loading={loadingCarePlan} />;
      case "Life History":
        return <LifeHistory key="life" clientData={clientData} carePlan={carePlan} loading={loadingCarePlan} />;
      case "Medical Information":
        return <MedicalInfo key="medical" clientData={clientData} carePlan={carePlan} loading={loadingCarePlan} />;
      case "Legal Capacity":
        const isEmpty = isDataEmpty(legalData);
        if (mode === "edit" || isEmpty) {
          const isInitial = isEmpty;
          return (
            <LegalCapacity
              key="legal-form"
              initialData={legalData}
              carePlan={carePlan}
              onSave={handleLegalSave}
              onError={handleError}
              onCancel={isInitial ? undefined : () => handleModeChange("view")}
            />
          );
        } else {
          return (
            <LegalCapacityDetails
              key="legal-details"
              carePlan={carePlan}
              onEdit={() => handleModeChange("edit")}
            />
          );
        }
      case "Admin":
        const isEmptyAdmin = isDataEmpty(adminData);
        if (mode === "edit" || isEmptyAdmin) {
          const isInitialAdmin = isEmptyAdmin;
          return (
            <Admin
              key="admin-form"
              initialData={adminData}
              onSave={handleAdminSave}
              onError={handleError}
              onCancel={isInitialAdmin ? undefined : () => handleModeChange("view")}
            />
          );
        } else {
          return (
            <AdminDetails
              key="admin-details"
              data={adminData}
              onEdit={() => handleModeChange("edit")}
            />
          );
        }
      default:
        return <BasicInfo key="basic" clientData={clientData} />;
    }
  };

  return (
    <div className="ClientInfo-Seec">
      <div className="Left-ClientInfo">
        <ul>
          {tabs.map((tab) => (
            <li
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      <div className="Right-ClientInfo">
        {renderContent()}
      </div>

      {/* global success alert */}
      <AnimatePresence>
        {successAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-success-alert"
          >
            <div>
              {successAlert.updated
                ? "Successfully updated:"
                : "Successfully added:"}{" "}
              <strong>{successAlert.title}</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* global error alert */}
      <AnimatePresence>
        {errorAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-error-alert"
          >
            <div>{errorAlert.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientInfo;

