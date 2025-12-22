import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SideNavBar from "../Home/SideNavBar";
import { IoIosArrowRoundBack } from "react-icons/io";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createClient,
  updateClient,
  autoAssignClientToCluster,
} from "./config/apiService";
import FileUploader from "../../../components/FileUploader/FileUploader";
import InputField from "../../../components/Input/InputField";
import SelectField from "../../../components/Input/SelectField";
import MissingFieldsModal from "../Employees/modals/MissingFieldsModal";
import ClearFormModal from "../Employees/modals/ClearFormModal";
import SuccessOrErrorModal from "../../../components/Modal/SuccessOrErrorModal";
import { EyeIcon } from "@heroicons/react/24/outline";
import { EyeSlashIcon } from "@heroicons/react/24/solid";
import "./styles/CreateClientForOthers.css";
import { getMaxBirthDate } from "../../../utils/helpers";
import useSearchPostcode from "../../../hooks/useSearchPostcode";
import * as XLSX from "xlsx"; // Add this import for Excel handling

// ClusterTable component
const ClusterTable = ({
  data = [],
  currentView = "clients",
  isLoading = false,
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
                <th>Contact Number</th>
                <th>Alternate Contact Number</th>
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
                  <td
                    colSpan={21}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    <div>Creating clients...</div>
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
                    <td>
                      {item.contactNumberPhoneCode}
                      {item.contactNumber}
                    </td>
                    <td>
                      {item.altContactNumberPhoneCode}
                      {item.altContactNumber}
                    </td>
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
                    <td>
                      {item.nokPhoneCode1}
                      {item.nokPhone1}
                    </td>
                    <td>
                      {item.nokPhoneCode2}
                      {item.nokPhone2}
                    </td>
                    <td>{item.username}</td>
                    <td>{item.password}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={21}>
                    No {currentView === "clients" ? "clients" : "carers"}{" "}
                    available
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

const CreateClientForOthersPage = () => {
  const [shrinkNav, setShrinkNav] = useState(false);
  const [showClearFormModal, setShowClearFormModal] = useState(false);
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [clientId, setClientId] = useState(null);
  // New state for bulk upload modal
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  // New state for bulk upload data
  const [bulkData, setBulkData] = useState([]);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const formTopRef = useRef(null);

  // Address autocomplete hook
  const {
    suggestions: addressSuggestions,
    showSuggestions,
    handleAddressInputChange,
    handleSuggestionSelect,
    handleBlur,
  } = useSearchPostcode();

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
    contactNumberPhoneCode: "+1",
    contactNumber: "",
    altContactNumberPhoneCode: "+1",
    altContactNumber: "",
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
    contactNumberPhoneCode: "Work Phone Code",
    contactNumber: "Work Phone",
    altContactNumberPhoneCode: "Personal Phone Code",
    altContactNumber: "Personal Phone",
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
    "altContactNumber",
    "address",
    "town",
    "postalCode",
    "nextOfKin",
    "relationship",
    "nokEmail",
    "nokPhone1",
    "password",
  ];

  const LOCAL_STORAGE_KEY = "clientFormDataForOthers";

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
      contactNumberPhoneCode: "+1",
      contactNumber: "",
      altContactNumberPhoneCode: "+1",
      altContactNumber: "",
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
    setClientId(null);
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

    try {
      // Create client with non-file fields
      const nonFilePayload = {
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
        role: "client",
        is_superuser: false,
        last_password_reset: new Date().toISOString(),
        profile: {
          id: 0,
          user: 0,
          gender: formData.gender,
          dob: formData.dob,
          contact_number:
            formData.contactNumberPhoneCode + formData.contactNumber,
          alt_contact_number:
            formData.altContactNumberPhoneCode + formData.altContactNumber,
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

      const createdClient = await createClient(nonFilePayload);
      const newClientId = createdClient.id;
      setClientId(newClientId);

      // Auto-assign client to cluster
      const assignPayload = {
        name: `${createdClient.first_name} ${createdClient.last_name}`,
        postcode: createdClient.profile.postal_code,
        address: createdClient.profile.address,
        clientId: newClientId,
      };
      await autoAssignClientToCluster(assignPayload);

      // If profilePicture exists, update with the file
      const updatePayload = {
        profile: {
          photo: formData?.profilePicture,
        },
      };
      await updateClient(newClientId, updatePayload);

      setModalType("success");
      setModalTitle("Client Created Successfully");
      setModalMessage(
        `${formData.firstName} ${formData.lastName}'s profile has been fully created and is being assigned to a cluster.`
      );
      setShowStatusModal(true);
      // clearForm();
    } catch (error) {
      setModalType("error");
      setModalTitle("Creation Failed");
      setModalMessage(
        error.response?.data?.message ||
          "Failed to create client. Please try again."
      );
      setShowStatusModal(true);
    } finally {
      setLoading(false);
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

  const handleAddAnother = () => {
    setShowStatusModal(false);
    // clearForm();
    formTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleViewList = () => {
    setShowStatusModal(false);
    navigate("/company/clients");
  };

  // Bulk create function
  const handleBulkCreate = async () => {
    if (bulkData.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        bulkData.map(async (item) => {
          const nonFilePayload = {
            id: 0,
            username:
              item.username ||
              `${item.firstName.toLowerCase()}${item.lastName.toLowerCase()}`,
            email: item.workEmail,
            password: item.password,
            first_name: item.firstName,
            last_name: item.lastName,
            role: "client",
            is_superuser: false,
            last_password_reset: new Date().toISOString(),
            profile: {
              id: 0,
              user: 0,
              gender: item.gender,
              dob: item.dob,
              contact_number: item.contactNumberPhoneCode + item.contactNumber,
              alt_contact_number:
                item.altContactNumberPhoneCode + item.altContactNumber,
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
              nok_phone2: item.nokPhoneCode2 + item.nokPhone2 || "",
            },
          };
          const createdClient = await createClient(nonFilePayload);
          // Auto-assign to cluster
          const assignPayload = {
            name: `${createdClient.first_name} ${createdClient.last_name}`,
            postcode: createdClient.profile.postal_code,
            address: createdClient.profile.address,
            clientId: createdClient.id,
          };
          await autoAssignClientToCluster(assignPayload);
          return createdClient;
        })
      );
      setModalType("success");
      setModalTitle(`${results.length} Clients Created Successfully`);
      setModalMessage(
        "Bulk clients have been created and assigned to clusters."
      );
      setShowStatusModal(true);
      setBulkData([]);
      setShowBulkUploadModal(false);
    } catch (error) {
      setModalType("error");
      setModalTitle("Bulk Creation Failed");
      setModalMessage(
        error.message ||
          "There was an error creating the bulk clients. Please try again."
      );
      setShowStatusModal(true);
    } finally {
      setLoading(false);
    }
  };

  // New function to download sample Excel
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "First Name": "John",
        "Last Name": "Smith",
        Gender: "Male",
        "Date of Birth": "1990-01-01",
        "Work Email": "john@example.com",
        "Personal Email": "john.personal@example.com",
        "Contact Number": "1234567890",
        "Alternate Contact Number": "0987654321",
        Address: "123 Main St",
        Town: "New York",
        "Postal Code": "10001",
        "Marital Status": "Single",
        "Next of Kin": "Jane Smith",
        Relationship: "Sister",
        "NOK Email": "jane@example.com",
        "NOK Address": "456 Oak St",
        "NOK Town": "New York",
        "NOK Postal Code": "10002",
        "NOK Phone 1": "1112223333",
        "NOK Phone 2": "4445556666",
        Username: "johnsmith",
        Password: "GeneratedPass123!",
      },
      {
        "First Name": "Jane",
        "Last Name": "Doe",
        Gender: "Female",
        "Date of Birth": "1985-05-15",
        "Work Email": "jane@example.com",
        "Personal Email": "",
        "Contact Number": "2345678901",
        "Alternate Contact Number": "",
        Address: "456 Oak Ave",
        Town: "Los Angeles",
        "Postal Code": "90001",
        "Marital Status": "Married",
        "Next of Kin": "John Doe",
        Relationship: "Husband",
        "NOK Email": "john@example.com",
        "NOK Address": "789 Pine Rd",
        "NOK Town": "Los Angeles",
        "NOK Postal Code": "90002",
        "NOK Phone 1": "7778889999",
        "NOK Phone 2": "",
        Username: "janedoe",
        Password: "SecurePass456!",
      },
      {
        "First Name": "Alice",
        "Last Name": "Johnson",
        Gender: "Other",
        "Date of Birth": "1995-12-20",
        "Work Email": "alice@example.com",
        "Personal Email": "alice.personal@example.com",
        "Contact Number": "3456789012",
        "Alternate Contact Number": "0123456789",
        Address: "789 Pine Rd",
        Town: "Chicago",
        "Postal Code": "60601",
        "Marital Status": "Divorced",
        "Next of Kin": "Charlie Johnson",
        Relationship: "Brother",
        "NOK Email": "charlie@example.com",
        "NOK Address": "101 Elm St",
        "NOK Town": "Chicago",
        "NOK Postal Code": "60602",
        "NOK Phone 1": "3334445555",
        "NOK Phone 2": "6667778888",
        Username: "alicejohnson",
        Password: "Random789!",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample Clients");
    XLSX.writeFile(wb, "sample_clients.xlsx");
  };

  // New function to handle Excel upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        console.log("Uploaded clients data:", jsonData);
        // Process jsonData for ClusterTable, matching personal info fields
        const processedData = jsonData.map((row, index) => ({
          id: index,
          firstName: row["First Name"] || "",
          lastName: row["Last Name"] || "",
          gender: row["Gender"] || "",
          dob: row["Date of Birth"] || "",
          workEmail: row["Work Email"] || "",
          personalEmail: row["Personal Email"] || "",
          contactNumberPhoneCode: "+1",
          contactNumber: row["Contact Number"]
            ? row["Contact Number"].replace(/\D/g, "")
            : "",
          altContactNumberPhoneCode: "+1",
          altContactNumber: row["Alternate Contact Number"]
            ? row["Alternate Contact Number"].replace(/\D/g, "")
            : "",
          address: row["Address"] || "",
          town: row["Town"] || "",
          postalCode: row["Postal Code"] || "",
          maritalStatus: row["Marital Status"] || "",
          nextOfKin: row["Next of Kin"] || "",
          relationship: row["Relationship"] || "",
          nokEmail: row["NOK Email"] || "",
          nokAddress: row["NOK Address"] || "",
          nokTown: row["NOK Town"] || "",
          nokPostalCode: row["NOK Postal Code"] || "",
          nokPhoneCode1: "+1",
          nokPhone1: row["NOK Phone 1"]
            ? row["NOK Phone 1"].replace(/\D/g, "")
            : "",
          nokPhoneCode2: "+1",
          nokPhone2: row["NOK Phone 2"]
            ? row["NOK Phone 2"].replace(/\D/g, "")
            : "",
          username: row["Username"] || "",
          password: row["Password"] || generateRandomPassword(),
        }));
        setBulkData(processedData);
        // Do not close modal to show the table
        // alert(`Uploaded ${jsonData.length} clients successfully!`); // Removed
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <>
      <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
        <SideNavBar setShrinkNav={setShrinkNav} />
        <div className="Main-DB-Envt">
          <div className="DB-Envt-Container" ref={formTopRef}>
            <div className="create-client-for-others">
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
                    <h2>Create Client</h2>
                    <p>
                      Fill in the client's details to add them to the company
                      roster.
                    </p>
                  </div>
                </div>

                <div className="BBujas-ENnvs">
                  {/* <span
                  className="add-client-button"
                  onClick={() => setShowBulkUploadModal(true)}
                >
                   <p>Bulk upload</p>
                  </span> */}

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
                <h3>Upload Profile Picture</h3>
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
                      max={getMaxBirthDate()}
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

                  <InputField label="Contact Phone Number">
                    <div className="phone-wrapper">
                      <select
                        name="contactNumberPhoneCode"
                        value={formData.contactNumberPhoneCode}
                        onChange={handleChange}
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+234">+234</option>
                      </select>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </InputField>

                  <InputField label="Alternate Contact Phone Number">
                    <div className="phone-wrapper">
                      <select
                        name="altContactNumberPhoneCode"
                        value={formData.altContactNumberPhoneCode}
                        onChange={handleChange}
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+234">+234</option>
                      </select>
                      <input
                        type="tel"
                        name="altContactNumber"
                        value={formData.altContactNumber}
                        onChange={handlePhoneChange}
                      />
                    </div>
                  </InputField>

                  <div className="GHuh-Form-Input">
                    <label>Address</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        name="address"
                        value={formData.address || ""}
                        onChange={(e) =>
                          handleAddressInputChange(e.target.value, (val) =>
                            updateFormData({ address: val })
                          )
                        }
                        onFocus={() => setFocusedInput("address")}
                        onBlur={handleBlur}
                        placeholder="Enter full address"
                        className="form-control"
                      />
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <ul
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: "white",
                            border: "1px solid #ccc",
                            borderTop: "none",
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            zIndex: 1000,
                            maxHeight: "200px",
                            overflowY: "auto",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          {addressSuggestions.map((suggestion) => (
                            <li
                              key={suggestion.place_id}
                              onClick={() =>
                                handleSuggestionSelect(
                                  suggestion,
                                  (val) => updateFormData({ address: val }),
                                  (val) => updateFormData({ postalCode: val }),
                                  () => {},
                                  () => {}
                                )
                              }
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #eee",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#f5f5f5")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "white")
                              }
                            >
                              {suggestion.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
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
                    {loading ? "Creating..." : "Create Client"}
                  </button>
                </div>
              </form>

              {/* New Bulk Upload Modal */}
              {showBulkUploadModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                  }}
                  onClick={() => setShowBulkUploadModal(false)}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      padding: "2rem",
                      borderRadius: "8px",
                      maxWidth: "95vw",
                      width: "98%",
                      textAlign: "center",
                      maxHeight: "90vh",
                      overflowY: "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3>Bulk Upload Clients</h3>
                    <p>
                      Upload an Excel file with client data or download a sample
                      template.
                    </p>
                    <div style={{ margin: "1rem 0" }}>
                      <button
                        onClick={downloadSampleExcel}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#e6e0fe",
                          color: "#7226FF",
                          border: "none",
                          borderRadius: "8px",
                          marginRight: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Download Sample
                      </button>
                      <label
                        htmlFor="excel-upload"
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#7226FF",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "inline-block",
                        }}
                      >
                        Upload Excel File
                      </label>
                      <input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                        style={{ display: "none" }}
                      />
                    </div>

                    {bulkData.length > 0 ? (
                      <>
                        <div
                          className="BBThas-UUKa"
                          style={{ overflowX: "auto" }}
                        >
                          <ClusterTable
                            data={bulkData}
                            currentView="clients"
                            isLoading={loading}
                          />
                        </div>
                        <div
                          style={{
                            marginTop: "1rem",
                            display: "flex",
                            justifyContent: "center",
                            gap: "1rem",
                          }}
                        >
                          <button
                            onClick={handleBulkCreate}
                            disabled={loading || bulkData.length === 0}
                            style={{
                              padding: "0.5rem 1rem",
                              backgroundColor: "#7226FF",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            {loading ? "Creating..." : "Save Clients"}
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
                      <p style={{ marginTop: "1rem", color: "#666" }}>
                        Please upload an Excel file to view and save the client
                        data.
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
              <SuccessOrErrorModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                name="Client"
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                onAddAnother={handleAddAnother}
                onViewList={handleViewList}
                isFinalStep={true}
                onContinue={() => setShowStatusModal(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateClientForOthersPage;
