import { useState, useEffect, useRef } from "react";
import Modal from "../../../../../../components/Modal";
import InputField from "../../../../../../components/Input/InputField";
import SelectField from "../../../../../../components/Input/SelectField";
import { FiLoader, FiX } from "react-icons/fi";
import { fetchUsersNoPagination } from "../../../../Employees/config/apiService";
import SearchableEmployeeSelect from "../../../../../../components/Input/SearchableEmployeeSelect";

const penaltyTypesOptions = [
  { value: "verbal_warning", label: "Verbal Warning" },
  { value: "written_warning", label: "Written Warning" },
  {
    value: "performance_improvement_plan",
    label: "Performance Improvement Plan",
  },
  { value: "suspension", label: "Suspension" },
  { value: "demotion", label: "Demotion" },
  { value: "termination", label: "Termination" },
  { value: "other", label: "Other" },
];

const severityLevelOptions = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

const issuingAuthoritiesOptions = [
  { value: "Line Manager", label: "Line Manager" },
  { value: "HR", label: "HR" },
  { value: "Disciplinary Committee", label: "Disciplinary Committee" },
];

const AddPenaltyModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    employee: "",
    type: "",
    authority: "",
    date: "",
    reason: "",
    severity_level: "1",
    department: "",
    custom_type: "",
    duration_days: "",
  });
  const [users, setUsers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setIsLoadingUsers(true);
          const usersRes = await fetchUsersNoPagination();
          setUsers(usersRes || []);
        } catch (error) {
          console.error("Failed to fetch employees:", error);
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    } else {
      // Reset on close
      setFormData({
        employee: "",
        type: "",
        authority: "",
        date: "",
        reason: "",
        severity_level: "1",
        department: "",
        custom_type: "",
        duration_days: "",
      });
      setSelectedEmployee(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.employee && users.length > 0) {
      const user = users.find(
        (u) =>
          `${u.first_name || ""} ${u.last_name || ""} (${u.email || "N/A"})` ===
          formData.employee
      );
      setSelectedEmployee(user || null);
      setFormData((prev) => ({
        ...prev,
        department: user?.department || "",
      }));
    } else {
      setSelectedEmployee(null);
      setFormData((prev) => ({
        ...prev,
        department: "",
      }));
    }
  }, [formData.employee, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    const requiredFields = [
      formData.employee,
      formData.type,
      formData.authority,
      formData.date,
      formData.reason,
    ];

    // Check department if employee has no department
    if (
      selectedEmployee &&
      !selectedEmployee.department &&
      !formData.department
    ) {
      return false;
    }

    // Check duration for suspension
    if (
      formData.type === "suspension" &&
      (!formData.duration_days || parseInt(formData.duration_days) < 1)
    ) {
      return false;
    }

    return requiredFields.every((field) => field.trim() !== "");
  };

  const transformToPayload = (formData, users) => {
    const selectedLabel = formData.employee;
    if (!selectedLabel) {
      throw new Error("Please select an employee");
    }
    const selectedUser = users.find(
      (u) =>
        `${u.first_name || ""} ${u.last_name || ""} (${u.email || "N/A"})` ===
        selectedLabel
    );
    if (!selectedUser) {
      throw new Error("Selected employee not found");
    }

    if (
      formData.type === "suspension" &&
      (!formData.duration_days || parseInt(formData.duration_days) < 1)
    ) {
      throw new Error("Please enter a valid duration in days for suspension");
    }

    const payload = {
      employee_details: {
        email: selectedUser.email || "",
        first_name: selectedUser.first_name || "",
        last_name: selectedUser.last_name || "",
        job_role: selectedUser.job_role || "",
        department: formData.department,
      },
      effective_date: formData.date,
      reason: formData.reason,
      description: formData.reason,
      type: formData.type,
      severity_level: parseInt(formData.severity_level) || 1,
      issuing_authority: formData.authority,
    };

    if (formData.type === "suspension") {
      payload.duration_days = parseInt(formData.duration_days) || 1;
    }

    return payload;
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      const payload = transformToPayload(formData, users);
      if (onSave) onSave(payload);
    } catch (error) {
      console.error(
        error.message || "Failed to process penalty. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Penalty"
      message="Apply penalties to maintain standards and accountability"
    >
      <div>
        <SearchableEmployeeSelect
          label="Select Employee"
          value={formData.employee}
          onChange={handleChange}
          users={users}
          isLoading={isLoadingUsers}
          placeholder="Search for employees by name or email..."
          name="employee"
        />

        {selectedEmployee && !selectedEmployee.department && (
          <InputField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Enter the employee's department"
          />
        )}

        <SelectField
          label="Penalty Type"
          name="type"
          value={formData.type}
          options={penaltyTypesOptions}
          onChange={handleChange}
        />

        {formData.type === "suspension" && (
          <InputField
            label="Duration (days)"
            name="duration_days"
            type="number"
            min="1"
            value={formData.duration_days}
            onChange={handleChange}
            placeholder="e.g., 3"
          />
        )}

        <SelectField
          label="Severity Level"
          name="severity_level"
          value={formData.severity_level}
          options={severityLevelOptions}
          onChange={handleChange}
        />

        <SelectField
          label="Issuing Authority"
          name="authority"
          value={formData.authority}
          options={issuingAuthoritiesOptions}
          onChange={handleChange}
        />

        <InputField
          label="Effective Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />

        <InputField label="Reason/Description">
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Enter reason..."
            rows={3}
          />
        </InputField>
      </div>

      <div className="modal-footer" style={{ width: "100%" }}>
        <button
          className="modal-button modal-button-cancel"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className="modal-button modal-button-confirm"
          onClick={handleSubmit}
          disabled={isSaving || !isFormValid()}
        >
          {isSaving ? (
            <>
              <FiLoader
                style={{
                  animation: "spin 1s linear infinite",
                  margin: "0.6rem 0.3rem 0 0",
                }}
              />
              Processing...
            </>
          ) : (
            "Save Penalty"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default AddPenaltyModal;
