import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FileUploader from "../../components/FileUploader/FileUploader";
import InputField from "../../components/Input/InputField";
import { IoIosArrowRoundBack } from "react-icons/io";
import {
  createTenant,
  updateTenant,
  fetchSingleTenant,
} from "./config/apiConfig";
import "./styles/CreateTenantPage.css";
import TenantNavBar from "./TenantNavbar";

const CreateOrEditTenantPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = new URLSearchParams(location.search).get("edit");
  console.log(isEditMode);
  const tenantId = isEditMode ? location.search.split("=")[1] : null;

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    domain: "",
    logo_file: null,
    logoPreview: "",
    email_host: "",
    email_port: "",
    email_use_ssl: false,
    email_host_user: "",
    email_host_password: "",
    default_from_email: "",
    about_us: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode && tenantId) {
      const fetchTenant = async () => {
        try {
          const tenant = await fetchSingleTenant(tenantId);
          setFormData({
            name: tenant.name || "",
            title: tenant.title || "",
            domain: tenant.domain || "",
            logo_file: null,
            logoPreview: tenant.logo_file || "",
            email_host: tenant.email_host || "",
            email_port: tenant.email_port || "",
            email_use_ssl: tenant.email_use_ssl || false,
            email_host_user: tenant.email_host_user || "",
            email_host_password: "", // Password typically not returned for security
            default_from_email: tenant.default_from_email || "",
            about_us: tenant.about_us || "",
          });
        } catch (err) {
          setError(err.message || "Failed to fetch tenant details");
        }
      };
      fetchTenant();
    }
  }, [isEditMode, tenantId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (file) => {
    if (formData.logoPreview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(formData.logoPreview);
    }
    const previewUrl = file ? URL.createObjectURL(file) : "";
    setFormData((prev) => ({
      ...prev,
      logo_file: file,
      logoPreview: previewUrl,
    }));
  };

  const removeLogo = () => {
    if (formData.logoPreview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(formData.logoPreview);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormData((prev) => ({
      ...prev,
      logo_file: null,
      logoPreview: "",
    }));
  };

  const validateForm = () => {
    const requiredFields = ["name", "domain"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].trim() === ""
    );
    return missingFields.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Please fill in all required fields (Name and Domain).");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (
          key !== "logoPreview" &&
          formData[key] !== null &&
          formData[key] !== ""
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (isEditMode) {
        await updateTenant(tenantId, formDataToSend);
        setSuccess("Tenant updated successfully!");
      } else {
        await createTenant(formDataToSend);
        setSuccess("Tenant created successfully!");
        setFormData({
          name: "",
          title: "",
          domain: "",
          logo_file: null,
          logoPreview: "",
          email_host: "",
          email_port: "",
          email_use_ssl: false,
          email_host_user: "",
          email_host_password: "",
          default_from_email: "",
          about_us: "",
        });
      }
      navigate("/tenants");
    } catch (err) {
      setError(
        err.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } tenant. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TenantNavBar />
      <form className="create-tenant" onSubmit={handleSubmit}>
        <div>
          <IoIosArrowRoundBack onClick={() => navigate(-1)} />
          <div>
            <h2>{isEditMode ? "Edit Tenant" : "Create New Tenant"}</h2>
            <p>
              {isEditMode
                ? "Update the tenant's details."
                : "Fill in the details to create a new tenant in the system."}
            </p>
          </div>
        </div>

        <div className="form-section">
          <h3>Tenant Information</h3>
          <FileUploader
            preview={formData.logoPreview}
            currentFile={formData.logo_file}
            onFileChange={handleFileChange}
            onRemove={removeLogo}
            ref={fileInputRef}
            acceptedFileTypes="image"
            uploadText="Click to upload tenant logo"
          />
          <InputField
            label="Tenant Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <InputField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          <InputField
            label="Domain *"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <h3>Email Configuration (Optional)</h3>
          <InputField
            label="Email Host"
            name="email_host"
            value={formData.email_host}
            onChange={handleChange}
          />
          <InputField
            label="Email Port"
            type="number"
            name="email_port"
            value={formData.email_port}
            onChange={handleChange}
          />
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              name="email_use_ssl"
              checked={formData.email_use_ssl}
              onChange={handleChange}
            />
            <label>Use SSL</label>
          </div>
          <InputField
            label="Email Host User"
            name="email_host_user"
            value={formData.email_host_user}
            onChange={handleChange}
          />
          <InputField
            label="Email Host Password"
            type="password"
            name="email_host_password"
            value={formData.email_host_password}
            onChange={handleChange}
          />
          <InputField
            label="Default From Email"
            type="email"
            name="default_from_email"
            value={formData.default_from_email}
            onChange={handleChange}
          />
        </div>

        <div className="form-section">
          <h3>About Tenant (Optional)</h3>
          <InputField
            label="About Us"
            name="about_us"
            value={formData.about_us}
            onChange={handleChange}
            type="textarea"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className="create-btn" disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Tenant"
              : "Create Tenant"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateOrEditTenantPage;
