import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { fetchSingleTenant } from "./config/apiConfig";
import "./styles/TenantDetailsPage.css";
import TenantNavBar from "./TenantNavbar";

const TenantDetailsPage = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        const data = await fetchSingleTenant(tenantId);
        setTenant(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch tenant details");
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenant();
    } else {
      setError("No tenant ID provided");
      setLoading(false);
    }
  }, [tenantId]);

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="error-container"
        >
          <p className="error-message">{error}</p>
        </motion.div>
      );
    }

    if (!tenant) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="no-data"
        >
          <p>No tenant data found</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="tenant-details-container"
      >
        <div className="tenant-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
            Back
          </button>
          <button
            className="edit-button"
            onClick={() => navigate(`/company/tenants/create?edit=${tenantId}`)}
          >
            Edit Tenant
          </button>
        </div>
        <div className="tenant-details-grid">
          <DetailCard title="Tenant Information">
            <DetailItem label="Name" value={tenant.name} />
            <DetailItem label="Title" value={tenant.title} />
            <DetailItem label="Domain" value={tenant.domain} />
            {tenant.logo_file && (
              <DetailItem
                label="Logo"
                value={
                  <img
                    src={tenant.logo_file}
                    alt="Tenant Logo"
                    className="tenant-logo"
                  />
                }
              />
            )}
          </DetailCard>
          <DetailCard title="Email Configuration">
            <DetailItem label="Email Host" value={tenant.email_host} />
            <DetailItem label="Email Port" value={tenant.email_port} />
            <DetailItem
              label="Use SSL"
              value={tenant.email_use_ssl ? "Yes" : "No"}
            />
            <DetailItem
              label="Email Host User"
              value={tenant.email_host_user}
            />
            <DetailItem
              label="Default From Email"
              value={tenant.default_from_email}
            />
          </DetailCard>
          <DetailCard title="About">
            <DetailItem label="About Us" value={tenant.about_us} />
          </DetailCard>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <TenantNavBar />
      {renderContent()}
    </>
  );
};

const DetailCard = React.memo(({ title, children }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="detail-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h3>{title}</h3>
    <div className="detail-items">{children}</div>
  </motion.div>
));

const DetailItem = React.memo(({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}:</span>
    <span className="detail-value">{value || "N/A"}</span>
  </div>
));

const LoadingState = () => (
  <div className="loading-container">
    <div className="loading-header">
      <div className="loading-info">
        <div className="loading-line large"></div>
        <div className="loading-line medium"></div>
      </div>
    </div>
    <div className="loading-grid">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="loading-card">
          <div className="loading-line medium"></div>
          {[...Array(4)].map((_, j) => (
            <div key={j} className="loading-line small"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default TenantDetailsPage;
