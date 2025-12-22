// NewLeaveRequest.jsx
import React, { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import FileUploader from "../../../components/FileUploader/FileUploader";
import SuccessOrErrorModal from "../../../components/Modal/SuccessOrErrorModal";
import { createInternalRequest } from "../../CompanyDashboard/Requests/config/apiConfig";
import { apiClient } from "../../../config";
import { usePhoneCountryCode } from "../../../hooks/usePhoneCountryCode";

const NewLeaveRequest = () => {
  const navigate = useNavigate();
  const phoneHook = usePhoneCountryCode("+234");
  const [formData, setFormData] = useState({
    title: "",
    leaveCategory: "",
    numberOfDays: "",
    startDate: "",
    resumptionDate: "",
    regionOfStay: "",
    addressDuringLeave: "",
    phone: "",
    additionalInformation: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      leaveCategory: "",
      numberOfDays: "",
      startDate: "",
      resumptionDate: "",
      regionOfStay: "",
      addressDuringLeave: "",
      phone: "",
      additionalInformation: "",
    });
  };

  const isFormComplete = () => {
    const days = parseInt(formData.numberOfDays);
    const contact = phoneHook.countryCode + formData.phone;
    return (
      formData.title &&
      formData.leaveCategory &&
      days > 0 &&
      formData.startDate &&
      formData.resumptionDate &&
      formData.regionOfStay &&
      formData.addressDuringLeave &&
      formData.phone.trim() !== "" &&
      contact.length > 5
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete()) return;

    const contactPhone = phoneHook.countryCode + formData.phone;
    const payload = {
      request_type: "leave",
      title: formData.title,
      leave_category: formData.leaveCategory.toLowerCase(),
      number_of_days: parseInt(formData.numberOfDays),
      start_date: formData.startDate,
      resumption_date: formData.resumptionDate,
      region_of_stay: formData.regionOfStay.toLowerCase(),
      address_during_leave: formData.addressDuringLeave,
      contact_phone_number: contactPhone,
      additional_information: formData.additionalInformation,
    };

    setLoading(true);

    try {
      await createInternalRequest(payload);

      // Handle success
      setModalType("success");
      setModalTitle("Request Created Successfully");
      setModalMessage("Your leave request has been submitted successfully.");
      setShowModal(true);
    } catch (error) {
      // Error handling is managed in handleApiErrorWithValidation
      setModalType("error");
      setModalTitle("Error Creating Request");
      setModalMessage(
        error.response?.data?.message ||
          "An error occurred while creating the request. Please try again."
      );
      setShowModal(true);
      console.error("Failed to create request:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleModalClose = () => {
    setShowModal(false);
    navigate(-1);
  };

  const handleAddAnother = () => {
    setShowModal(false);
    resetForm();
  };

  const handleViewList = () => {
    setShowModal(false);
    navigate(-1);
  };

  if (phoneHook.loading) {
    return <div>Loading country codes...</div>; // Or a proper loading component
  }

  if (phoneHook.error) {
    return <div>Error loading country codes: {phoneHook.error}</div>;
  }

  return (
    <div className="GenForm-Page">
      <div className="form-header">
        <h2>
          <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            <ArrowLeftIcon className="h-6 w-6 inline" />
          </span>
          Leave Request
        </h2>
        <p>Create a new request</p>
      </div>

      <div className="Davv-Pils">
        <div className="Davv-Pils-Box">
          <div className="form-section">
            <h3>Fill in your leave request details</h3>

            <form onSubmit={handleSubmit}>
              <InputField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Leave for Family Vacation"
              />

              <SelectField
                label="Leave Category"
                name="leaveCategory"
                value={formData.leaveCategory}
                options={["Annual", "Casual", "Sick", "Study", "Others"]}
                onChange={handleChange}
              />

              <InputField
                label="Number of Days"
                type="number"
                name="numberOfDays"
                value={formData.numberOfDays}
                onChange={handleChange}
                min="1"
              />

              <div className="input-row">
                <InputField
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={today}
                />
                <InputField
                  label="Resumption Date"
                  type="date"
                  name="resumptionDate"
                  value={formData.resumptionDate}
                  onChange={handleChange}
                  min={formData.startDate || today}
                />
              </div>

              <SelectField
                label="Region of Stay During Leave"
                name="regionOfStay"
                value={formData.regionOfStay}
                options={["Abroad", "Local"]}
                onChange={handleChange}
              />

              <InputField
                label="Address During Leave"
                name="addressDuringLeave"
                value={formData.addressDuringLeave}
                onChange={handleChange}
              />

              <div className="GHuh-Form-Input">
                <label>Contact Phone Number While on Leave</label>
                <div className="phone-wrapper">
                  <select
                    value={phoneHook.countryCode}
                    onChange={(e) => phoneHook.setCountryCode(e.target.value)}
                  >
                    {phoneHook.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="GHuh-Form-Input">
                <label>Additional Information (Optional)</label>
                <div>
                  <textarea
                    name="additionalInformation"
                    value={formData.additionalInformation}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="GHuh-Form-Input">
                <button
                  type="submit"
                  className="GenFlt-BTn btn-primary-bg"
                  disabled={!isFormComplete() || loading}
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SuccessOrErrorModal
        isOpen={showModal}
        onClose={handleModalClose}
        type={modalType}
        name="Leave Request"
        title={modalTitle}
        message={modalMessage}
        onAddAnother={handleAddAnother}
        onViewList={handleViewList}
        showAddAnother={true}
        isFinalStep={true}
      />
    </div>
  );
};

export default NewLeaveRequest;
