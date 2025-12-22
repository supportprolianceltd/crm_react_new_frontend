import { useState, useEffect } from "react";
import ToggleButton from "../../../../../components/ToggleButton";
import CheckboxGroup from "../../../../../components/CheckboxGroup";
import SelectField from "../../../../../components/Input/SelectField";
import InputField from "../../../../../components/Input/InputField";
import FileUploader from "../../../../../components/FileUploader/FileUploader";

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const times = ["Am", "PM", "Night"];

// System access options - updated to match new payload
export const systemAccessOptions = [
  { label: "Rostering", value: "rostering" },
  { label: "HR", value: "hr" },
  { label: "Recruitment", value: "recruitment" },
  { label: "Training", value: "training" },
  { label: "Finance", value: "finance" },
  { label: "Compliance", value: "compliance" },
  { label: "Co-Admin", value: "co-admin" },
  { label: "Asset Management", value: "asset_management" },
];

export const AvailabilityGrid = ({ value = {}, onChange }) => {
  const defaultAvailability = times.reduce((acc, time) => {
    acc[time] = days.reduce((dAcc, day) => {
      dAcc[day] = false;
      return dAcc;
    }, {});
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

  const handleToggle = (time, day, val) => {
    const updated = {
      ...availability,
      [time]: { ...availability[time], [day]: val },
    };
    setAvailability(updated);

    // Push change up immediately when user toggles
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="availability-grid">
      <div className="grid-header">
        <div className="empty-cell"></div>
        {days.map((day) => (
          <div key={day} className="day-cell">
            {day}
          </div>
        ))}
      </div>

      {times.map((time) => (
        <div key={time} className="grid-row">
          <div className="time-cell">{time}</div>
          {days.map((day) => (
            <div key={day} className="toggle-cell">
              <ToggleButton
                isOn={availability[time][day]}
                onToggle={(val) => handleToggle(time, day, val)}
              />
            </div>
          ))}
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
  // Initialize system access selections
  const [systemAccessSelections, setSystemAccessSelections] = useState(
    formData.systemAccessSelections || []
  );

  // Update form data when selections change
  useEffect(() => {
    handleChange({
      target: {
        name: "systemAccessSelections",
        value: systemAccessSelections,
      },
    });
  }, [systemAccessSelections]);

  const handleSystemAccessChange = (selectedValues) => {
    setSystemAccessSelections(selectedValues);
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

            <div style={{ marginTop: "12px" }}>
              <FileUploader
                preview={formData.drivingLicenseFrontPreview || ""}
                currentFile={formData.drivingLicenseFront}
                onFileChange={handleDrivingLicenseFrontChange}
                onRemove={removeDrivingLicenseFront}
                ref={drivingLicenseFrontRef}
                acceptedFileTypes="image"
                uploadText="Click to upload Drivers Licence. Front Image"
              />
            </div>

            <div style={{ marginTop: "12px" }}>
              <FileUploader
                preview={formData.drivingLicenseBackPreview || ""}
                currentFile={formData.drivingLicenseBack}
                onFileChange={handleDrivingLicenseBackChange}
                onRemove={removeDrivingLicenseBack}
                ref={drivingLicenseBackRef}
                acceptedFileTypes="image"
                uploadText="Click to upload Drivers Licence. Back Image"
              />
            </div>

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
              />

              <InputField
                type="date"
                label="Expiry Date"
                name="drivingLicenseExpiryDate"
                value={formData.drivingLicenseExpiryDate}
                onChange={handleChange}
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

        <div className="permission-item-access">
          <div>
            <ToggleButton
              isOn={formData.accessDuration || false}
              onToggle={(value) => handleToggleChange("accessDuration", value)}
            />
            <div
              className="compliance-content"
              style={{ marginLeft: "0.75rem" }}
            >
              <h4>Access Duration</h4>
              <p>Allow access until official exit date</p>
            </div>
          </div>

          {formData.accessDuration && (
            <InputField
              className="permission-item-access-date"
              type="date"
              name="accessExpiryDate"
              value={formData.accessExpiryDate}
              onChange={handleChange}
            />
          )}
        </div>

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
      </div>
    </>
  );
};

export default DrivingStatusDetailsStep;
