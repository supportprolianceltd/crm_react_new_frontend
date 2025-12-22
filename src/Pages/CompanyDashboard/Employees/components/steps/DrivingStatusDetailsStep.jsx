import { useState, useEffect } from "react";
import ToggleButton from "../../../../../components/ToggleButton";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import SelectField from "../../../../../components/Input/SelectField";
import InputField from "../../../../../components/Input/InputField";
import FileUploader from "../../../../../components/FileUploader/FileUploader";
import {
  disableFutureDates,
  disablePastDates,
  getFileExtension,
} from "../../../../../utils/helpers";

export const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// System access options - updated to match new payload
export const systemAccessOptions = [
  { label: "Rostering", value: "rostering" },
  { label: "HR", value: "hr" },
  { label: "Recruitment", value: "recruitment" },
  { label: "Training", value: "training" },
  { label: "Finance", value: "finance" },
  { label: "Compliance", value: "compliance" },
  { label: "Asset Management", value: "asset_management" },
];

export const systemAdminAccessOptions = [
  { label: "Co-Admin", value: "co-admin" },
 ];

export const AvailabilityGrid = ({ value = {}, onChange }) => {
  const defaultAvailability = days.reduce((acc, day) => {
    acc[day] = {
      available: false,
      start: "",
      end: "",
    };
    return acc;
  }, {});

  const [availability, setAvailability] = useState({
    ...defaultAvailability,
    ...value,
  });

  // Only sync down from parent when value changes
  useEffect(() => {
    setAvailability({
      ...defaultAvailability,
      ...value,
    });
  }, [value]);

  const handleToggle = (day, val) => {
    const updated = {
      ...availability,
      [day]: { ...availability[day], available: val },
    };
    setAvailability(updated);

    // Push change up immediately when user toggles
    if (onChange) {
      onChange(updated);
    }
  };

  const handleTimeChange = (day, field, time) => {
    const updated = {
      ...availability,
      [day]: { ...availability[day], [field]: time },
    };
    setAvailability(updated);

    // Push change up immediately when user changes time
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="availability-grid">
      {days.map((day) => (
        <div key={day} className="day-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <div className="day-label" style={{ width: '100px', fontWeight: 'bold' }}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </div>
          <ToggleButton
            isOn={availability[day].available}
            onToggle={(val) => handleToggle(day, val)}
          />
          {availability[day].available && (
            <>
              <input
                type="time"
                value={availability[day].start}
                onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                style={{ marginLeft: '10px' }}
              />
              <span style={{ margin: '0 5px' }}>to</span>
              <input
                type="time"
                value={availability[day].end}
                onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const DrivingStatusDetailsStep = ({
  formData,
  handleChange,
  handleDrivingLicenseFrontChange,
  drivingLicenseFrontRef,
  removeDrivingLicenseFront,
  handleDrivingLicenseBackChange,
  drivingLicenseBackRef,
  removeDrivingLicenseBack,
}) => {
  function sanitizeFileName(name) {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace any char that's not letter, number, dot, underscore, hyphen with _
      .replace(/_{2,}/g, '_')           // Replace multiple _ with single
      .replace(/^_+|_+$/g, '');         // Remove leading/trailing _
  }

  const handleSanitizedDrivingLicenseFrontChange = (file) => {
    if (file && typeof handleDrivingLicenseFrontChange === 'function') {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      handleDrivingLicenseFrontChange(sanitizedFile);
    } else if (typeof handleDrivingLicenseFrontChange === 'function') {
      handleDrivingLicenseFrontChange(file);
    }
  };

  const handleSanitizedDrivingLicenseBackChange = (file) => {
    if (file && typeof handleDrivingLicenseBackChange === 'function') {
      const sanitizedName = sanitizeFileName(file.name);
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      handleDrivingLicenseBackChange(sanitizedFile);
    } else if (typeof handleDrivingLicenseBackChange === 'function') {
      handleDrivingLicenseBackChange(file);
    }
  };

  // Initialize system access selections
  const [systemAccessSelections, setSystemAccessSelections] = useState(
    formData.systemAccessSelections || []
  );
  // Initialize system access selections
  const [systemAdminAccessSelections, setSystemAdminAccessSelections] =
    useState(formData.systemAdminAccessSelections || []);

  // Update form data when selections change
  useEffect(() => {
    handleChange({
      target: {
        name: "systemAccessSelections",
        value: systemAccessSelections,
      },
    });
  }, [systemAccessSelections]);

  useEffect(() => {
    handleChange({
      target: {
        name: "systemAdminAccessSelections",
        value: systemAdminAccessSelections,
      },
    });
  }, [systemAdminAccessSelections]);

  // Set role to "co-admin" when System Admin Access is toggled on and Co-Admin is selected
  useEffect(() => {
    if (formData.systemAdminAccess && formData.systemAdminAccessSelections.includes("co-admin")) {
      handleChange({
        target: {
          name: "role",
          value: "co-admin",
        },
      });
    }
  }, [formData.systemAdminAccess, formData.systemAdminAccessSelections, handleChange]);

  const handleSystemAccessChange = (selectedValues) => {
    setSystemAccessSelections(selectedValues);
  };

  const handleSystemAdminAccessChange = (selectedValues) => {
    setSystemAdminAccessSelections(selectedValues);
  };

  const handleToggleChange = (fieldName, value) => {
    handleChange({
      target: {
        name: fieldName,
        value: value,
      },
    });
  };

  const options = [
    { label: "Personal Vehicle", value: "Personal Vehicle" },
    { label: "Company Vehicle", value: "Company Vehicle" },
    { label: "Both", value: "Both" },
  ];

  const handleVehicleTypeChange = (selectedValue) => {
    handleChange({
      target: {
        name: "vehicleType",
        value: selectedValue,
      },
    });
  };

  const isImageUrl = (url) => {
    if (typeof url !== "string" || !url) return false;
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
    const extension = getFileExtension(url)?.toLowerCase();
    return imageExtensions.includes(extension);
  };

  const renderDocumentPreview = (
    url,
    preview,
    onRemove,
    title = "Document Preview"
  ) => {
    if (!url) return null;

    const extension = getFileExtension(url).toLowerCase();
    let iframeSrc = url;

    // For .docx, use MS Viewer
    if (extension === "docx" || extension === "doc") {
      iframeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
    }
    // Add similar checks for .pptx, .xlsx if needed

    return (
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          margin: "10px 0",
          position: "relative",
        }}
      >
        <h4>{title}</h4>
        {isImageUrl(url) ? (
          <img
            src={url}
            alt="Document Preview"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        ) : (
          <iframe
            src={iframeSrc}
            width="100%"
            height="400px"
            style={{ border: "none" }}
          />
        )}
        <button
          type="button"
          onClick={onRemove}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "#ff4444",
            color: "white",
            border: "none",
            padding: "5px",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Remove
        </button>
      </div>
    );
  };

  const drivingLicenseFrontPreviewComponent = renderDocumentPreview(
    formData.drivingLicenseFrontUrl,
    formData.drivingLicenseFrontPreview,
    () => {
      handleChange({ target: { name: "drivingLicenseFrontUrl", value: "" } });
      handleChange({
        target: { name: "drivingLicenseFrontPreview", value: "" },
      });
    },
    "Driving License Front Preview"
  );

  const drivingLicenseBackPreviewComponent = renderDocumentPreview(
    formData.drivingLicenseBackUrl,
    formData.drivingLicenseBackPreview,
    () => {
      handleChange({ target: { name: "drivingLicenseBackUrl", value: "" } });
      handleChange({
        target: { name: "drivingLicenseBackPreview", value: "" },
      });
    },
    "Driving License Back Preview"
  );

  return (
    <>
      {/* DRIVING STATUS SECTION */}
      <div className="form-section">
        <h3>Driving Status</h3>

        <div className="compliance-item">
          <ToggleButton
            isOn={formData.drivingStatus || false}
            onToggle={(value) => handleToggleChange("drivingStatus", value)}
          />
          <div className="compliance-content">
            <h4>Is this employee a driver?</h4>
            <p>Enable if this employee will be driving as part of their role</p>
          </div>
        </div>

        {formData.drivingStatus && (
          <>
            <p
              className="vehicle-type-header"
              style={{ color: "#5B616D", fontSize: 13 }}
            >
              Type of Vehicle Used
            </p>
            <div className="vehicle-type-radio-group">
              <CheckboxGroup
                options={options}
                value={formData.vehicleType}
                onChange={handleVehicleTypeChange}
              />
            </div>

            {drivingLicenseFrontPreviewComponent || (
              <div style={{ marginTop: "12px" }}>
                <FileUploader
                  preview={formData.drivingLicenseFrontPreview || ""}
                  currentFile={formData.drivingLicenseFront}
                  onFileChange={handleSanitizedDrivingLicenseFrontChange}
                  onRemove={removeDrivingLicenseFront}
                  ref={drivingLicenseFrontRef}
                  acceptedFileTypes="all"
                  uploadText="Click to upload Drivers Licence. Front Image"
                />
              </div>
            )}

            {drivingLicenseBackPreviewComponent || (
              <div style={{ marginTop: "12px" }}>
                <FileUploader
                  preview={formData.drivingLicenseBackPreview || ""}
                  currentFile={formData.drivingLicenseBack}
                  onFileChange={handleSanitizedDrivingLicenseBackChange}
                  onRemove={removeDrivingLicenseBack}
                  ref={drivingLicenseBackRef}
                  acceptedFileTypes="all"
                  uploadText="Click to upload Drivers Licence. Back Image"
                />
              </div>
            )}

            <SelectField
              label="Country of Issue"
              name="countryOfDrivingLicenseIssue"
              options={["UK", "USA", "Nigeria", "Other"]}
              value={formData.countryOfDrivingLicenseIssue}
              onChange={handleChange}
            />

            <div className="input-row">
              <InputField
                type="date"
                label="Date Issued"
                name="drivingLicenseIssueDate"
                value={formData.drivingLicenseIssueDate}
                onChange={handleChange}
                max={disableFutureDates()}
              />

              <InputField
                type="date"
                label="Expiry Date"
                name="drivingLicenseExpiryDate"
                value={formData.drivingLicenseExpiryDate}
                onChange={handleChange}
                min={disablePastDates()}
              />
            </div>

            <InputField
              label="Insurance Provider"
              name="driversLicenseInsuranceProvider"
              value={formData.driversLicenseInsuranceProvider}
              onChange={handleChange}
            />

            <InputField
              type="date"
              label="Insurance Expiry Date"
              name="driversLicenseInsuranceExpiryDate"
              value={formData.driversLicenseInsuranceExpiryDate}
              onChange={handleChange}
              min={disablePastDates()}
            />

            <SelectField
              label="Issuing Authority"
              name="driversLicenseIssuingAuthority"
              options={["DVLA", "DVA", "Other"]}
              value={formData.driversLicenseIssuingAuthority}
              onChange={handleChange}
            />

            <InputField
              label="Policy Number"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleChange}
            />
          </>
        )}
      </div>

      {/* AVAILABILITY SECTION */}
      <div className="form-section">
        <h3>Availability</h3>

        <div className="availability-toggle-sync">
          <p>Set when the employee is available to work</p>

          <div>
            <ToggleButton
              isOn={formData.isSyncWithRoster || false}
              onToggle={(value) =>
                handleToggleChange("isSyncWithRoster", value)
              }
              showTick={false}
            />
            <p>Sync with roster</p>
          </div>
        </div>

        {formData.isSyncWithRoster && (
          <AvailabilityGrid
            value={formData.availability}
            onChange={(val) =>
              handleChange({
                target: {
                  name: "availability",
                  value: val,
                },
              })
            }
          />
        )}
      </div>

      {/* PERMISSIONS SECTION */}
      <div className="form-section">
        <h3>Permission</h3>


        <div className="compliance-item">
          <ToggleButton
            isOn={formData.systemAccess || false}
            onToggle={(value) => handleToggleChange("systemAccess", value)}
          />
          <div className="compliance-content">
            <h4>System Access</h4>
          </div>
        </div>

        {formData.systemAccess && (
          <div style={{ marginTop: "16px", marginLeft: "40px" }}>
            <CheckboxGroup
              options={systemAccessOptions}
              value={systemAccessSelections}
              onChange={handleSystemAccessChange}
              multiple={true}
            />
          </div>
        )}

        <div className="compliance-item">
          <ToggleButton
            isOn={formData.systemAdminAccess || false}
            onToggle={(value) => handleToggleChange("systemAdminAccess", value)}
          />
          <div className="compliance-content">
            <h4>System Admin Access</h4>
          </div>
        </div>

        {formData.systemAdminAccess && (
          <div style={{ marginTop: "16px", marginLeft: "40px" }}>
            <CheckboxGroup
              options={systemAdminAccessOptions}
              value={systemAdminAccessSelections}
              onChange={handleSystemAdminAccessChange}
              multiple={true}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default DrivingStatusDetailsStep;
