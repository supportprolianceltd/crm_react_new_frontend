import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "./UpdateCompanyProfile.css";
import { fetchTenantConfig, updateTenantInfo } from "./ApiService";
import FileUploader from "../../../components/FileUploader/FileUploader";
import ToastNotification from "../../../components/ToastNotification";

const MAX_WORDS = 200;

const CompanyProfile = () => {
  const [isFetchingCompanyInfo, setIsFetchingCompanyInfo] = useState(false);
  const [isUpdatingCompanyInfo, setIsUpdatingCompanyInfo] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    title: "",
    about_us: "",
    logo: null, // This will store the File object
    logoPreview: "", // This will store the preview URL
  });

  const { title, about_us, logo, logoPreview } = companyInfo;
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setCompanyInfo((prev) => ({
      ...prev,
      logo: file,
      logoPreview: URL.createObjectURL(file),
    }));
  };

  const removeLogo = () => {
    // Clean up blob URL if it exists
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setCompanyInfo((prev) => ({
      ...prev,
      logo: null,
      logoPreview: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAboutChange = (e) => {
    const text = e.target.value;
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    if (wordCount <= MAX_WORDS || text.length < about_us.length) {
      setCompanyInfo((prev) => ({ ...prev, about_us: text }));
    }
  };

  const getWordCount = () => {
    return about_us.trim() === "" ? 0 : about_us.trim().split(/\s+/).length;
  };

  const fetchCompanyProfile = async () => {
    setIsFetchingCompanyInfo(true);

    try {
      const response = await fetchTenantConfig();
      setCompanyInfo({
        title: response.title || "",
        about_us: response.about_us || "",
        logo: null, // We don't store the File object from API
        logoPreview: response.logo || "", // Store the URL from API
      });
    } catch (error) {
      setErrorMessage("Failed to fetch company profile." || error?.message);
    } finally {
      setIsFetchingCompanyInfo(false);
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  const handleUpdateCompanyProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingCompanyInfo(true);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("title", title);
    formData.append("about_us", about_us);
    if (logo) {
      formData.append("logo", logo);
    }

    try {
      const response = await updateTenantInfo(formData);
      setSuccessMessage("Company profile updated successfully!");
      setTimeout(() => {
        fetchCompanyProfile();
      }, 2000);
    } catch (error) {
      setErrorMessage("Failed to update company profile." || error?.message);
    } finally {
      setIsUpdatingCompanyInfo(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const isDisabled = getWordCount() > MAX_WORDS || !title || !about_us;

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />

      <div className="company-profile-container">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="page-title"
        >
          Update Company Profile
        </motion.h1>

        {isFetchingCompanyInfo ? (
          <div className="loading-spinner-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "4px solid #7226FF",
                borderTopColor: "transparent",
              }}
            />
            <p>Loading company information...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="profile-form-container"
          >
            <form
              onSubmit={handleUpdateCompanyProfile}
              className="profile-form"
            >
              {/* Logo Upload Section */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="upload-section"
              >
                <h2 className="section-title">Company Logo</h2>
                <FileUploader
                  preview={logoPreview}
                  currentFile={logo}
                  onFileChange={handleFileChange}
                  onRemove={removeLogo}
                  fileInputRef={fileInputRef}
                  acceptedFileTypes="image"
                  uploadText="Upload company logo"
                />
              </motion.div>

              {/* Company Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="info-section"
              >
                <h2 className="section-title">Company Information</h2>

                <div className="form-group">
                  <label htmlFor="company-name">Company Name</label>
                  <input
                    type="text"
                    id="company-name"
                    value={title}
                    onChange={(e) =>
                      setCompanyInfo((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter your company name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <div className="word-counter-container">
                    <label htmlFor="about-company">About Company</label>
                    <span
                      className={`word-counter ${
                        getWordCount() > MAX_WORDS ? "limit-exceeded" : ""
                      }`}
                    >
                      {getWordCount()}/{MAX_WORDS} words
                    </span>
                  </div>
                  <textarea
                    id="about-company"
                    value={about_us}
                    onChange={handleAboutChange}
                    placeholder="Tell us about your company (200 words maximum)"
                    rows="5"
                    className={`form-textarea ${
                      getWordCount() > MAX_WORDS ? "textarea-error" : ""
                    }`}
                  />
                  {getWordCount() > MAX_WORDS && (
                    <p className="error-message">
                      You've exceeded the maximum word count. Please shorten
                      your description.
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="submit-btn"
                disabled={isDisabled}
              >
                {isUpdatingCompanyInfo && (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      border: "3px solid #fff",
                      borderTopColor: "transparent",
                      marginRight: "5px",
                      display: "inline-block",
                    }}
                  />
                )}
                {isUpdatingCompanyInfo ? "Saving Changes..." : "Save Changes"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default CompanyProfile;
