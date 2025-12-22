import React, { useState } from "react";
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

const ClientInfo = ({ clientData, onUpdate }) => {
  const tabComponents = {
    "Basic Information": <BasicInfo clientData={clientData} />,
    "Contact Information": <ContactInfo clientData={clientData} />,
    "Address Details": <Address clientData={clientData} />,
    "Next of Kin/Emergency Details": <NextOfKin clientData={clientData} />,
    "Culture Value and Identity": <CultureInfo clientData={clientData} />,
    "Life History": <LifeHistory clientData={clientData} />,
    "Medical Information": <MedicalInfo clientData={clientData} />,
  };

  const tabs = Object.keys(tabComponents).concat(["Legal Capacity", "Admin"]);

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
    if (activeTab === "Legal Capacity") {
      const isEmpty = isDataEmpty(legalData);
      if (mode === "edit" || isEmpty) {
        const isInitial = isEmpty;
        return (
          <LegalCapacity
            initialData={legalData}
            onSave={handleLegalSave}
            onError={handleError}
            onCancel={isInitial ? undefined : () => handleModeChange("view")}
          />
        );
      } else {
        return (
          <LegalCapacityDetails
            data={legalData}
            onEdit={() => handleModeChange("edit")}
          />
        );
      }
    } else if (activeTab === "Admin") {
      const isEmpty = isDataEmpty(adminData);
      if (mode === "edit" || isEmpty) {
        const isInitial = isEmpty;
        return (
          <Admin
            initialData={adminData}
            onSave={handleAdminSave}
            onError={handleError}
            onCancel={isInitial ? undefined : () => handleModeChange("view")}
          />
        );
      } else {
        return (
          <AdminDetails
            data={adminData}
            onEdit={() => handleModeChange("edit")}
          />
        );
      }
    }
    return tabComponents[activeTab];
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
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${mode}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.4 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
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
