import React, { useState } from "react";
import "./AuditCompliance.css";
import Logs from "./CareLogs/CareLogs";
import { BarChart2Icon, FileIcon } from "lucide-react";
import ComplianceCheck from "./ComplianceCheck/ComplianceCheck";
import CareLogs from "./CareLogs/CareLogs";

const AuditCompliance = () => {
  const [activeTab, setActiveTab] = useState("logs");

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };
  return (
    <div className="audit-compliance-container">
      <div className="audit-compliance-tabs">
        <p
          className={activeTab === "logs" ? "active" : ""}
          onClick={() => handleTabClick("logs")}
        >
          <div className="tab-items">
            Care Logs
            <FileIcon width={16} height={16} />
          </div>
        </p>
        <p
          className={activeTab === "compliance" ? "active" : ""}
          onClick={() => handleTabClick("compliance")}
        >
          <div className="tab-items">
            Quality Compliance Check
            <BarChart2Icon width={16} height={16} />
          </div>
        </p>
      </div>

      <div className="audit-compliance-content">
        {activeTab === "logs" && (
          <div>
            <CareLogs />
          </div>
        )}

        {activeTab === "compliance" && (
          <div>
            <ComplianceCheck />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditCompliance;
