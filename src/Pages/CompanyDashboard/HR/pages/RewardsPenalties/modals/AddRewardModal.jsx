import { useState, useEffect, useRef } from "react";
import Modal from "../../../../../../components/Modal";
import InputField from "../../../../../../components/Input/InputField";
import SelectField from "../../../../../../components/Input/SelectField";
import { FiLoader, FiX } from "react-icons/fi";
import { fetchUsersNoPagination } from "../../../../Employees/config/apiService";
import SearchableEmployeeSelect from "../../../../../../components/Input/SearchableEmployeeSelect";
import useCurrencies from "../../../../../../hooks/useCurrencies";

const rewardTypesOptions = [
  { value: "bonus", label: "Bonus" },
  { value: "promotion", label: "Promotion" },
  { value: "recognition", label: "Recognition" },
  { value: "extra_pto", label: "Extra PTO" },
  { value: "gift", label: "Gift" },
  { value: "public_praise", label: "Public Praise" },
  { value: "certificate", label: "Certificate" },
  { value: "training_opportunity", label: "Training Opportunity" },
  { value: "other", label: "Other" },
];

const valueTypesOptions = [
  { value: "monetary", label: "Monetary" },
  { value: "points", label: "Points" },
];

const issuingAuthoritiesOptions = [
  { value: "Line Manager", label: "Line Manager" },
  { value: "HR", label: "HR" },
  { value: "Director", label: "Director" },
];

const AddRewardModal = ({ isOpen, onClose, onSave }) => {
  const currencies = useCurrencies();
  const [formData, setFormData] = useState({
    employee: "",
    type: "",
    authority: "",
    amount: "",
    date: "",
    reason: "",
    value_type: "",
    department: "",
    custom_type: "",
    currency: "",
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
        amount: "",
        date: "",
        reason: "",
        value_type: "",
        department: "",
        custom_type: "",
        currency: "",
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
      formData.value_type,
      formData.amount,
    ];

    // Check department if employee has no department
    if (
      selectedEmployee &&
      !selectedEmployee.department &&
      !formData.department
    ) {
      return false;
    }

    // Check currency and amount for monetary
    if (
      formData.value_type === "monetary" &&
      (!formData.currency || !formData.amount.trim())
    ) {
      return false;
    }

    // For non-monetary, ensure amount is not empty
    if (formData.value_type !== "monetary" && !formData.amount.trim()) {
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
      formData.value_type === "monetary" &&
      (!formData.currency || !formData.amount)
    ) {
      throw new Error("Please select currency and enter amount");
    }

    if (formData.value_type !== "monetary" && !formData.amount.trim()) {
      throw new Error("Please enter amount/value");
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
      value: `${formData.currency}${formData.amount}`,
      value_type: formData.value_type,
      issuing_authority: formData.authority,
    };

    if (formData.value_type === "monetary") {
      payload.currency = formData.currency;
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
        error.message || "Failed to process reward. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Reward"
      message="Recognize and reward exceptional employee contributions"
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
          label="Reward Type"
          name="type"
          value={formData.type}
          options={rewardTypesOptions}
          onChange={handleChange}
        />

        <SelectField
          label="Value Type"
          name="value_type"
          value={formData.value_type}
          options={valueTypesOptions}
          onChange={handleChange}
        />

        {formData.value_type === "monetary" ? (
          <div
            className="salary-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
              width: "100%",
            }}
          >
            <div style={{ width: "20%" }}>
              <SelectField
                label="Currency"
                name="currency"
                value={formData.currency || ""}
                onChange={handleChange}
                options={currencies.map((currency) => ({
                  value: currency.code,
                  label: currency.code,
                }))}
              />
            </div>
            <div style={{ width: "80%" }}>
              <InputField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 500"
              />
            </div>
          </div>
        ) : (
          <InputField
            label="Amount/value"
            name="amount"
            type="text"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g., 500 points or 3 days PTO"
          />
        )}

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

      <div className="modal-footer">
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
            "Save Reward"
          )}
        </button>
      </div>
    </Modal>
  );
};

export default AddRewardModal;
