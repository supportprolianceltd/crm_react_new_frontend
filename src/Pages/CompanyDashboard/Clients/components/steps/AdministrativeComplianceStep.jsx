import InputField from "../../../../../components/Input/InputField";
import SelectField from "../../../../../components/Input/SelectField";

const AdministrativeComplianceStep = ({ formData, handleChange }) => {
  // Sample employee data - format as objects with label and value
  const employeeOptions = [
    { value: 82829393, label: "John Doe (ID: 82829393)" },
    { value: 12273733, label: "Jane Smith (ID: 12273733)" },
    { value: 45566778, label: "Mike Johnson (ID: 45566778)" },
    { value: 89900112, label: "Sarah Wilson (ID: 89900112)" },
  ];
  return (
    <>
      <div className="form-section">
        <h3>Administrative & Compliance</h3>

        <SelectField
          label="Funding/Payment TYpe"
          name="fundingPaymentType"
          value={formData.fundingPaymentType}
          options={["Private", "Other"]}
          onChange={handleChange}
          required
        />

        <div className="input-row">
          <InputField
            label="Care Package Start Date"
            type="date"
            name="carePackageStartDate"
            value={formData.carePackageStartDate}
            onChange={handleChange}
          />
          <InputField
            label="Care Package Review Date"
            type="date"
            name="carePackageReviewDate"
            value={formData.carePackageReviewDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Prefered Carers</h3>

        <SelectField
          label="Primary carer (from Employee list)"
          name="preferredCarers"
          value={formData.preferredCarers}
          options={[82829393, 12273733, "Other"]}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default AdministrativeComplianceStep;
