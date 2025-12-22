import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SideNavBar from "../Home/SideNavBar";
import { IoIosArrowRoundBack } from "react-icons/io";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createEmployee } from "./config/apiService";
import FileUploader from "../../../components/FileUploader/FileUploader";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import ToastNotification from "../../../components/ToastNotification";
import MissingFieldsModal from "./modals/MissingFieldsModal"; // Import from healthcare
import ClearFormModal from "./modals/ClearFormModal"; // Import from healthcare
import { EyeIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import "./styles/CreateEmployeeForOthers.css";
import * as XLSX from 'xlsx'; // Add this import for Excel handling

// ClusterTable component
import React, { useMemo } from 'react';
const ClusterTable = ({
  data = [],
  currentView = "employees",
  isLoading = false
}) => {
  const displayedData = useMemo(() => data, [data]);
  return (
    <div className="GThaks-POla-Table">
      <div className="CLusssd-Table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Work Email</th>
                <th>Work Phone</th>
                <th>Personal Phone</th>
                <th>Address</th>
                <th>Town</th>
                <th>Postal Code</th>
                <th>Marital Status</th>
                <th>Next of Kin</th>
                <th>Relationship</th>
                <th>NOK Email</th>
                <th>NOK Address</th>
                <th>NOK Town</th>
                <th>NOK Postal Code</th>
                <th>NOK Phone 1</th>
                <th>NOK Phone 2</th>
                <th>Username</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={21} style={{ textAlign: 'center', padding: '20px' }}>
                    <div>Creating employees...</div>
                  </td>
                </tr>
              ) : displayedData.length > 0 ? (
                displayedData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.gender}</td>
                    <td>{item.dob}</td>
                    <td>{item.workEmail}</td>
                    <td>{item.workPhoneCode}{item.workPhone}</td>
                    <td>{item.personalPhoneCode}{item.personalPhone}</td>
                    <td>{item.address}</td>
                    <td>{item.town}</td>
                    <td>{item.postalCode}</td>
                    <td>{item.maritalStatus}</td>
                    <td>{item.nextOfKin}</td>
                    <td>{item.relationship}</td>
                    <td>{item.nokEmail}</td>
                    <td>{item.nokAddress}</td>
                    <td>{item.nokTown}</td>
                    <td>{item.nokPostalCode}</td>
                    <td>{item.nokPhoneCode1}{item.nokPhone1}</td>
                    <td>{item.nokPhoneCode2}{item.nokPhone2}</td>
                    <td>{item.username}</td>
                    <td>{item.password}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={21}>
                    No {currentView === "employees" ? "employees" : "carers"} available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CreateEmployeeForOthersPage = () => {
  const [shrinkNav, setShrinkNav] = useState(false);
  const [showClearFormModal, setShowClearFormModal] = useState(false);
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  // New state for bulk upload modal
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  // New state for bulk upload data
  const [bulkData, setBulkData] = useState([]);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const formTopRef = useRef(null);

  // Generate random password
  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Form state
  const [formData, setFormData] = useState({
    profilePicture: null,
    profilePreview: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    workEmail: "",
    personalEmail: "",
    workPhoneCode: "+1",
    workPhone: "",
    personalPhoneCode: "+1",
    personalPhone: "",
    address: "",
    town: "",
    postalCode: "",
    maritalStatus: "",
    nextOfKin: "",
    relationship: "",
    nokEmail: "",
    nokAddress: "",
    nokTown: "",
    nokPostalCode: "",
    nokPhoneCode1: "+1",
    nokPhone1: "",
    nokPhoneCode2: "+1",
    nokPhone2: "",
    username: "",
    password: generateRandomPassword(),
  });

  // Field labels for missing fields modal
  const fieldLabels = {
    profilePicture: "Profile Picture",
    firstName: "First Name",
    lastName: "Last Name",
    gender: "Gender",
    dob: "Date of Birth",
    workEmail: "Work Email",
    personalEmail: "Personal Email",
    workPhoneCode: "Work Phone Code",
    workPhone: "Work Phone",
    personalPhoneCode: "Personal Phone Code",
    personalPhone: "Personal Phone",
    address: "Address",
    town: "Town",
    postalCode: "Postal Code",
    maritalStatus: "Marital Status",
    nextOfKin: "Next of Kin Name",
    relationship: "Next of Kin Relationship",
    nokEmail: "Next of Kin Email",
    nokAddress: "Next of Kin Address",
    nokTown: "Next of Kin Town",
    nokPostalCode: "Next of Kin Postal Code",
    nokPhoneCode1: "Next of Kin Phone Code 1",
    nokPhone1: "Next of Kin Phone 1",
    nokPhoneCode2: "Next of Kin Phone Code 2",
    nokPhone2: "Next of Kin Phone 2",
    username: "Username",
    password: "Password",
  };

  // Required fields for validation
  const requiredFields = [
    "firstName",
    "lastName",
    "gender",
    "dob",
    "workEmail",
    "personalPhone",
    "address",
    "town",
    "postalCode",
    "nextOfKin",
    "relationship",
    "nokEmail",
    "nokPhone1",
    // "username",
    "password",
  ];

  const LOCAL_STORAGE_KEY = "employeeFormDataForOthers";

  // File to base64 conversion
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Base64 to File conversion
  const base64ToFile = (base64, filename, mimeType) => {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeType });
  };

  // Update form data with localStorage persistence
  const updateFormData = async (newData) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      const dataForStorage = { ...updated };

      Object.keys(newData).forEach(async (key) => {
        if (newData[key] instanceof File) {
          const base64 = await fileToBase64(newData[key]);
          dataForStorage[`${key}Base64`] = base64;
          delete dataForStorage[key];
        }
      });

      if (dataForStorage.profilePreview?.startsWith?.("blob:")) {
        delete dataForStorage.profilePreview;
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataForStorage));
      return updated;
    });
  };

  // Load form data from localStorage
  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const processedData = { ...parsedData };

        if (parsedData.profilePictureBase64) {
          const file = base64ToFile(
            parsedData.profilePictureBase64,
            "profilePicture.jpg",
            "image/jpeg"
          );
          processedData.profilePicture = file;
          processedData.profilePreview = URL.createObjectURL(file);
          delete processedData.profilePictureBase64;
        }

        if (!processedData.password || processedData.password === "") {
          processedData.password = generateRandomPassword();
        }

        setFormData(processedData);
      }
    };

    loadSavedData();
  }, []);

  // Clear form
  const clearForm = () => {
    if (formData.profilePreview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(formData.profilePreview);
    }

    const emptyForm = {
      profilePicture: null,
      profilePreview: "",
      firstName: "",
      lastName: "",
      gender: "",
      dob: "",
      workEmail: "",
      personalEmail: "",
      workPhoneCode: "+1",
      workPhone: "",
      personalPhoneCode: "+1",
      personalPhone: "",
      address: "",
      town: "",
      postalCode: "",
      maritalStatus: "",
      nextOfKin: "",
      relationship: "",
      nokEmail: "",
      nokAddress: "",
      nokTown: "",
      nokPostalCode: "",
      nokPhoneCode1: "+1",
      nokPhone1: "",
      nokPhoneCode2: "+1",
      nokPhone2: "",
      username: "",
      password: generateRandomPassword(),
    };

    setFormData(emptyForm);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setShowClearFormModal(false);
  };

  // Validation functions
  const isFormValid = () => {
    return requiredFields.every((field) => {
      const value = formData[field];
      return value !== null && value !== "" && value !== false;
    });
  };

  const getMissingFields = () => {
    return requiredFields.filter((field) => {
      const value = formData[field];
      return value === null || value === "" || value === false;
    });
  };

  const getMissingFieldLabels = () =>
    getMissingFields().map((field) => fieldLabels[field] || field);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      const missingLabels = getMissingFieldLabels();
      setMissingFields(missingLabels);
      setShowMissingFieldsModal(true);
      return;
    }

    setLoading(true);

    const payload = {
      id: 0,
      username:
        formData.username ||
        `${formData.firstName?.toLowerCase() || ""}${
          formData.lastName?.toLowerCase() || ""
        }`,
      email: formData.workEmail || "user@example.com",
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: "employee",
      is_superuser: false,
      last_password_reset: new Date().toISOString(),
      profile: {
        id: 0,
        user: 0,
        image_file: formData.profilePicture, // Send file instead of preview
        gender: formData.gender,
        dob: formData.dob,
        work_phone: formData.workPhoneCode + formData.workPhone,
        personal_phone: formData.personalPhoneCode + formData.personalPhone,
        work_email: formData.workEmail,
        personal_email: formData.personalEmail,
        address: formData.address,
        town: formData.town,
        postal_code: formData.postalCode,
        marital_status: formData.maritalStatus,
        next_of_kin: formData.nextOfKin,
        relationship: formData.relationship,
        nok_email: formData.nokEmail,
        nok_address: formData.nokAddress,
        nok_town: formData.nokTown,
        nok_postal_code: formData.nokPostalCode,
        nok_phone1: formData.nokPhoneCode1 + formData.nokPhone1,
        nok_phone2: formData.nokPhoneCode2 + formData.nokPhone2,
      },
    };

    try {
      await createEmployee(payload);
      setSuccessMessage("Employee created successfully 🎉");

      clearForm();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to create employee ❌"
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 2000);
    }
  };

  // File handling
  const createFileHandler = useCallback(
    (fieldName, previewFieldName) => {
      return async (file) => {
        if (!file) return;
        const base64 = await fileToBase64(file);
        const previewUrl = URL.createObjectURL(file);

        const updates = {
          [fieldName]: file,
          [`${fieldName}Base64`]: base64,
          [previewFieldName]: previewUrl,
        };

        if (formData[previewFieldName]?.startsWith?.("blob:")) {
          URL.revokeObjectURL(formData[previewFieldName]);
        }

        updateFormData(updates);
      };
    },
    [formData]
  );

  const createFileRemover = useCallback(
    (fieldName, previewFieldName, ref) => {
      return () => {
        const updates = { [fieldName]: null, [previewFieldName]: "" };

        if (formData[previewFieldName]?.startsWith?.("blob:")) {
          URL.revokeObjectURL(formData[previewFieldName]);
        }

        if (ref?.current) {
          ref.current.value = "";
        }

        updateFormData(updates);
      };
    },
    [formData]
  );

  const handleFileChange = createFileHandler(
    "profilePicture",
    "profilePreview"
  );
  const removeLogo = createFileRemover(
    "profilePicture",
    "profilePreview",
    fileInputRef
  );

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  // Phone input handler (max 11 digits)
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length <= 11) {
      updateFormData({ [name]: digitsOnly });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Bulk create function
  const handleBulkCreate = async () => {
    if (bulkData.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        bulkData.map(async (item) => {
          const payload = {
            id: 0,
            username: item.username || `${item.firstName?.toLowerCase() || ""}${item.lastName?.toLowerCase() || ""}`,
            email: item.workEmail || "user@example.com",
            password: item.password,
            first_name: item.firstName,
            last_name: item.lastName,
            role: "employee",
            is_superuser: false,
            last_password_reset: new Date().toISOString(),
            profile: {
              id: 0,
              user: 0,
              gender: item.gender,
              dob: item.dob,
              work_phone: item.workPhoneCode + item.workPhone,
              personal_phone: item.personalPhoneCode + item.personalPhone,
              work_email: item.workEmail,
              personal_email: item.personalEmail || "",
              address: item.address,
              town: item.town,
              postal_code: item.postalCode,
              marital_status: item.maritalStatus || "",
              next_of_kin: item.nextOfKin,
              relationship: item.relationship,
              nok_email: item.nokEmail,
              nok_address: item.nokAddress || "",
              nok_town: item.nokTown || "",
              nok_postal_code: item.nokPostalCode || "",
              nok_phone1: item.nokPhoneCode1 + item.nokPhone1,
              nok_phone2: (item.nokPhoneCode2 + item.nokPhone2) || "",
            },
          };
          const createdEmployee = await createEmployee(payload);
          return createdEmployee;
        })
      );
      setSuccessMessage(`${results.length} Employees created successfully 🎉`);
      setBulkData([]);
      setShowBulkUploadModal(false);
    } catch (error) {
      setErrorMessage(error.message || "Failed to create bulk employees ❌");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 2000);
    }
  };

  // New function to download sample Excel
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'First Name': 'John',
        'Last Name': 'Smith',
        'Gender': 'Male',
        'Date of Birth': '1990-01-01',
        'Work Email': 'john@example.com',
        'Personal Email': 'john.personal@example.com',
        'Work Phone': '+44 123 456 7890',
        'Personal Phone': '+44 098 765 4321',
        'Address': '123 Main St',
        'Town': 'London',
        'Postal Code': 'SW1A 1AA',
        'Marital Status': 'Single',
        'Next of Kin': 'Jane Smith',
        'Relationship': 'Sister',
        'NOK Email': 'jane@example.com',
        'NOK Address': '456 Oak St',
        'NOK Town': 'London',
        'NOK Postal Code': 'SW1A 1AB',
        'NOK Phone 1': '+44 111 222 3333',
        'NOK Phone 2': '+44 444 555 6666',
        'Username': 'johnsmith',
        'Password': 'GeneratedPass123!'
      },
      {
        'First Name': 'Jane',
        'Last Name': 'Doe',
        'Gender': 'Female',
        'Date of Birth': '1985-05-15',
        'Work Email': 'jane@example.com',
        'Personal Email': '',
        'Work Phone': '+44 234 567 8901',
        'Personal Phone': '',
        'Address': '456 Oak Ave',
        'Town': 'Manchester',
        'Postal Code': 'M1 1AA',
        'Marital Status': 'Married',
        'Next of Kin': 'John Doe',
        'Relationship': 'Husband',
        'NOK Email': 'john@example.com',
        'NOK Address': '789 Pine Rd',
        'NOK Town': 'Manchester',
        'NOK Postal Code': 'M1 1AB',
        'NOK Phone 1': '+44 777 888 9999',
        'NOK Phone 2': '',
        'Username': 'janedoe',
        'Password': 'SecurePass456!'
      },
      {
        'First Name': 'Alice',
        'Last Name': 'Johnson',
        'Gender': 'Other',
        'Date of Birth': '1995-12-20',
        'Work Email': 'alice@example.com',
        'Personal Email': 'alice.personal@example.com',
        'Work Phone': '+44 345 678 9012',
        'Personal Phone': '+44 012 345 6789',
        'Address': '789 Pine Rd',
        'Town': 'Birmingham',
        'Postal Code': 'B1 1AA',
        'Marital Status': 'Divorced',
        'Next of Kin': 'Charlie Johnson',
        'Relationship': 'Brother',
        'NOK Email': 'charlie@example.com',
        'NOK Address': '101 Elm St',
        'NOK Town': 'Birmingham',
        'NOK Postal Code': 'B1 1AB',
        'NOK Phone 1': '+44 333 444 5555',
        'NOK Phone 2': '+44 666 777 8888',
        'Username': 'alicejohnson',
        'Password': 'Random789!'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Employees');
    XLSX.writeFile(wb, 'sample_employees.xlsx');
  };

  // New function to handle Excel upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        console.log('Uploaded employees data:', jsonData);
        // Process jsonData for ClusterTable, matching personal info fields
        const processedData = jsonData.map((row, index) => {
          const workPhoneMatch = row['Work Phone'] ? row['Work Phone'].match(/^(\+\d{1,3})(\s*(\d[\s-]*)*\d)$/) : null;
          const personalPhoneMatch = row['Personal Phone'] ? row['Personal Phone'].match(/^(\+\d{1,3})(\s*(\d[\s-]*)*\d)$/) : null;
          const nokPhone1Match = row['NOK Phone 1'] ? row['NOK Phone 1'].match(/^(\+\d{1,3})(\s*(\d[\s-]*)*\d)$/) : null;
          const nokPhone2Match = row['NOK Phone 2'] ? row['NOK Phone 2'].match(/^(\+\d{1,3})(\s*(\d[\s-]*)*\d)$/) : null;
          return {
            id: index,
            firstName: row['First Name'] || '',
            lastName: row['Last Name'] || '',
            gender: row['Gender'] || '',
            dob: row['Date of Birth'] || '',
            workEmail: row['Work Email'] || '',
            personalEmail: row['Personal Email'] || '',
            workPhoneCode: workPhoneMatch ? workPhoneMatch[1] : '+1',
            workPhone: workPhoneMatch ? workPhoneMatch[2].replace(/\D/g, '') : '',
            personalPhoneCode: personalPhoneMatch ? personalPhoneMatch[1] : '+1',
            personalPhone: personalPhoneMatch ? personalPhoneMatch[2].replace(/\D/g, '') : '',
            address: row['Address'] || '',
            town: row['Town'] || '',
            postalCode: row['Postal Code'] || '',
            maritalStatus: row['Marital Status'] || '',
            nextOfKin: row['Next of Kin'] || '',
            relationship: row['Relationship'] || '',
            nokEmail: row['NOK Email'] || '',
            nokAddress: row['NOK Address'] || '',
            nokTown: row['NOK Town'] || '',
            nokPostalCode: row['NOK Postal Code'] || '',
            nokPhoneCode1: nokPhone1Match ? nokPhone1Match[1] : '+1',
            nokPhone1: nokPhone1Match ? nokPhone1Match[2].replace(/\D/g, '') : '',
            nokPhoneCode2: nokPhone2Match ? nokPhone2Match[1] : '+1',
            nokPhone2: nokPhone2Match ? nokPhone2Match[2].replace(/\D/g, '') : '',
            username: row['Username'] || '',
            password: row['Password'] || generateRandomPassword(),
          };
        });
        setBulkData(processedData);
        // Do not close modal to show the table
        // alert(`Uploaded ${jsonData.length} employees successfully!`); // Removed
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />

      <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
        <SideNavBar setShrinkNav={setShrinkNav} />
        <div className="Main-DB-Envt">
          <div className="DB-Envt-Container" ref={formTopRef}>
            <div className="create-employee-for-others">
              <div
                className="form-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IoIosArrowRoundBack
                    onClick={() => navigate(-1)}
                    style={{ cursor: "pointer", marginRight: "10px" }}
                  />
                  <div>
                    <h2>Create Employee (For Others)</h2>
                    <p>
                      Fill in the employee's details to add them to the company
                      roster.
                    </p>
                  </div>
                </div>

               <div className="BBujas-ENnvs">
                <span
                  className="add-client-button"
                  onClick={() => setShowBulkUploadModal(true)}
                >
                   <p>Bulk upload</p>
                  </span>

                <button
                  type="button"
                  className="clear-form-btn"
                  onClick={() => setShowClearFormModal(true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Clear Form
                </button>
                </div> 
              </div>

              <form onSubmit={handleSubmit}>
                {/* Upload Profile */}
                <h3>Upload Profile Picture </h3>
                <FileUploader
                  preview={formData.profilePreview}
                  currentFile={formData.profilePicture}
                  onFileChange={handleFileChange}
                  onRemove={removeLogo}
                  ref={fileInputRef}
                  acceptedFileTypes="image"
                  uploadText="Click to upload a photo"
                />

                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="input-row">
                    <InputField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("firstName")}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <InputField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("lastName")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>

                  <div className="input-row">
                    <SelectField
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      options={["Male", "Female", "Other"]}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Date of Birth"
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("dob")}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>

                  <InputField
                    label="Work Email"
                    type="email"
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleChange}
                  />

                  <SelectField
                    label="Marital Status"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    options={[
                      "Single",
                      "Married",
                      "Divorced",
                      "Widowed",
                      "Other",
                    ]}
                    onChange={handleChange}
                  />

                  <InputField label="Work Phone Number (optional)">
                    <div className="phone-wrapper">
                      <select
                        name="workPhoneCode"
                        value={formData.workPhoneCode}
                        onChange={handleChange}
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+234">+234</option>
                      </select>
                      <input
                        type="tel"
                        name="workPhone"
                        value={formData.workPhone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </InputField>

                  <InputField label="Personal Phone Number">
                    <div className="phone-wrapper">
                      <select
                        name="personalPhoneCode"
                        value={formData.personalPhoneCode}
                        onChange={handleChange}
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+234">+234</option>
                      </select>
                      <input
                        type="tel"
                        name="personalPhone"
                        value={formData.personalPhone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </InputField>

                  <InputField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Town/City"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Post Code/Zip Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>

                {/* Additional Details */}
                <div className="form-section">
                  <h3>Additional Details</h3>
                  <div className="input-row">
                    <InputField
                      label="Next of Kin"
                      name="nextOfKin"
                      value={formData.nextOfKin}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Relationship to Next of Kin"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                    />
                  </div>

                  <InputField
                    label="Next of Kin Email"
                    type="email"
                    name="nokEmail"
                    value={formData.nokEmail}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Next of Kin Address"
                    name="nokAddress"
                    value={formData.nokAddress}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Next of Kin Town/City"
                    name="nokTown"
                    value={formData.nokTown}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Next of Kin Post Code/Zip Code"
                    name="nokPostalCode"
                    value={formData.nokPostalCode}
                    onChange={handleChange}
                  />

                  <InputField label="Next of Kin Phone Number">
                    <div className="phone-wrapper">
                      <select
                        name="nokPhoneCode1"
                        value={formData.nokPhoneCode1}
                        onChange={handleChange}
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+234">+234</option>
                      </select>
                      <input
                        type="tel"
                        name="nokPhone1"
                        value={formData.nokPhone1}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </InputField>

                  <InputField label="Next of Kin (Alt. Phone Number)">
                    <div className="phone-wrapper">
                      <select
                        name="nokPhoneCode2"
                        value={formData.nokPhoneCode2}
                        onChange={handleChange}
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+234">+234</option>
                      </select>
                      <input
                        type="tel"
                        name="nokPhone2"
                        value={formData.nokPhone2}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </InputField>
                </div>

                {/* Login Credentials */}
                <div className="form-section">
                  <h3>Default Login Credentials</h3>
                  <div className="input-row">
                    <InputField
                      label="Username"
                      name="username"
                      value={formData.username || formData.workEmail}
                      onChange={handleChange}
                      placeholder="Enter username"
                    />

                    <div className="GHuh-Form-Input">
                      <label>Password</label>
                      <div className="ool-IINpa">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Auto-generated password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="icon" />
                          ) : (
                            <EyeIcon className="icon" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="password-strength-indicator">
                      <h4>Password Strength</h4>
                      <div className="strength-meter">
                        <div
                          className={`strength-bar ${
                            formData.password.length >= 12 &&
                            /[A-Z]/.test(formData.password) &&
                            /[0-9]/.test(formData.password) &&
                            /[!@#$%^&*]/.test(formData.password)
                              ? "strong"
                              : formData.password.length >= 8
                              ? "medium"
                              : "weak"
                          }`}
                          style={{
                            width: `${
                              formData.password.length >= 12 &&
                              /[A-Z]/.test(formData.password) &&
                              /[0-9]/.test(formData.password) &&
                              /[!@#$%^&*]/.test(formData.password)
                                ? 100
                                : formData.password.length >= 8
                                ? 66
                                : 33
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="strength-labels">
                        <span
                          className={formData.password.length >= 8 ? "met" : ""}
                        >
                          8+ characters
                        </span>
                        <span
                          className={
                            /[A-Z]/.test(formData.password) ? "met" : ""
                          }
                        >
                          Uppercase
                        </span>
                        <span
                          className={
                            /[0-9]/.test(formData.password) ? "met" : ""
                          }
                        >
                          Number
                        </span>
                        <span
                          className={
                            /[!@#$%^&*]/.test(formData.password) ? "met" : ""
                          }
                        >
                          Special char
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    disabled={loading}
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="continue-btn"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Employee"}
                  </button>
                </div>
              </form>

              {/* New Bulk Upload Modal */}
              {showBulkUploadModal && (
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                  }}
                  onClick={() => setShowBulkUploadModal(false)}
                >
                  <div 
                    style={{
                      backgroundColor: 'white',
                      padding: '2rem',
                      borderRadius: '8px',
                      maxWidth: '95vw',
                      width: '98%',
                      textAlign: 'center',
                      maxHeight: '90vh',
                      overflowY: 'auto'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3>Bulk Upload Employees</h3>
                    <p>Upload an Excel file with employee data or download a sample template.</p>
                    <div style={{ margin: '1rem 0' }}>
                      <button
                        onClick={downloadSampleExcel}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#e6e0fe',
                          color: '#7226FF',
                          border: 'none',
                          borderRadius: '8px',
                          marginRight: '1rem',
                          cursor: 'pointer',
                        }}
                      >
                        Download Sample
                      </button>
                      <label
                        htmlFor="excel-upload"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#7226FF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'inline-block',
                        }}
                      >
                        Upload Excel File  
                      </label>
                      <input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {bulkData.length > 0 ? (
                      <>
                        <div className="BBThas-UUKa" style={{ overflowX: 'auto' }}>
                          <ClusterTable 
                            data={bulkData} 
                            currentView="employees" 
                            isLoading={loading} 
                          />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                          <button
                            onClick={handleBulkCreate}
                            disabled={loading || bulkData.length === 0}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#7226FF',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            {loading ? 'Creating...' : 'Save Employees'}
                          </button>
                          <button
                            onClick={() => setShowBulkUploadModal(false)}
                            className="Ujas-OMINAs"
                          >
                            <XMarkIcon />
                          </button>
                        </div>
                      </>
                    ) : (
                      <p style={{ marginTop: '1rem', color: '#666' }}>
                        Please upload an Excel file to view and save the employee data.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Modals */}
              <MissingFieldsModal
                isOpen={showMissingFieldsModal}
                onClose={() => setShowMissingFieldsModal(false)}
                missingFields={missingFields}
              />
              <ClearFormModal
                isOpen={showClearFormModal}
                onClose={() => setShowClearFormModal(false)}
                onConfirm={clearForm}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEmployeeForOthersPage;