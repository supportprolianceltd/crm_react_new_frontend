import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { XMarkIcon } from "@heroicons/react/24/outline";
import SideNavBar from "../Home/SideNavBar";
import HorizontalLinearAlternativeLabelStepper from "../../../components/Stepper";
import "../../../components/Input/form.css";
import "../Clients/styles/CreateClientPage.css";
import PersonalInfoStep from "./components/steps/PersonalInfoStep";
import AddressStep from "./components/steps/AddressStep";
import FinalPreviewStep from "./components/steps/FinalPreviewStep";
import BulkUploadClients from "./components/steps/BulkUploadClients";
import MissingFieldsModal from "../Employees/modals/MissingFieldsModal";
import ClearFormModal from "../Employees/modals/ClearFormModal";
import SuccessOrErrorModal from "../../../components/Modal/SuccessOrErrorModal";
import {
  createClient,
  updateClient,
  autoAssignClientToCluster,
} from "./config/apiService";
import { generateRandomPassword } from "../../../utils/helpers";

export default function CreateClientForHealthcarePage() {
  const [shrinkNav, setShrinkNav] = useState(false);
  const [showClearFormModal, setShowClearFormModal] = useState(false);
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [loginEmailManuallyModified, setLoginEmailManuallyModified] =
    useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  const navigate = useNavigate();
  const formTopRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    profilePicture: null,
    profilePreview: "",
    title: "",
    firstName: "",
    lastName: "",
    preferredName: "",
    gender: "",
    preferredPronouns: "",
    dob: "",
    maritalStatus: "",
    nhisNumber: "",
    email: "",
    phoneCode: "",
    phone: "",
    altPhoneCode: "",
    altPhone: "",
    loginEmail: "",
    password: generateRandomPassword(),
    sendCredentialsToEmail: false,
    primaryContact: "",
    primaryContactPhoneCode: "",
    primaryContactPhone: "",
    primaryContactEmail: "",
    secondaryContact: "",
    secondaryContactPhoneCode: "",
    secondaryContactPhone: "",
    secondaryContactEmail: "",
    communicationPreferences: [],
    address: "",
    city: "",
    county: "",
    postalCode: "",
    residenceType: "",
    livesAlone: "",
    cohabitants: "",
    keySafeAccessInstructions: "",
    nextOfKin: "",
    relationship: "",
    nokEmail: "",
    nokTown: "",
    nokPhoneCode1: "",
    nokPhone1: "",
    nokPhoneCode2: "",
    nokPhone2: "",
  });

  const [focusedInput, setFocusedInput] = useState(null);

  const fieldLabels = {
    title: "Title",
    firstName: "First Name",
    lastName: "Last Name",
    preferredName: "Preferred Name",
    gender: "Gender Identity",
    preferredPronouns: "Preferred Pronouns",
    dob: "Date of Birth",
    maritalStatus: "Marital Status",
    nhisNumber: "NHIS Number",
    email: "Email",
    phone: "Phone",
    altPhone: "Alternate Phone",
    loginEmail: "Login Email",
    password: "Password",
    sendCredentialsToEmail: "Send Login Credentials to Email",
    primaryContact: "Primary Contact Name",
    primaryContactPhone: "Primary Contact Phone",
    primaryContactEmail: "Primary Contact Email",
    secondaryContact: "Secondary Contact Name",
    secondaryContactPhone: "Secondary Contact Phone",
    secondaryContactEmail: "Secondary Contact Email",
    communicationPreferences: "Communication Preferences",
    address: "Address Line",
    city: "Town/City",
    county: "County",
    postalCode: "Postcode",
    residenceType: "Type of Residence",
    livesAlone: "Lives Alone",
    cohabitants: "Cohabitants",
    keySafeAccessInstructions: "Key Safe/Access Instructions",
    nextOfKin: "Next of Kin Name",
    relationship: "Next of Kin Relationship",
    nokEmail: "Next of Kin Email",
    nokTown: "Next of Kin Town",
    nokPhone1: "Next of Kin Phone 1",
    nokPhone2: "Next of Kin Phone 2",
  };

  const steps = [
    {
      title: "Personal Information",
      subtitle: "Basic Information, Contact Details, Login Credentials",
    },
    {
      title: "Address & Next of Kin",
      subtitle: "Residence Information and Emergency Contact Details",
    },
    {
      title: "Preview & Submit",
      subtitle: "Review all information before submission",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [stepValidity, setStepValidity] = useState({});

  const stepValidations = {
    0: [
      "title",
      "firstName",
      "lastName",
      "gender",
      "dob",
      "email",
      "phone",
      "loginEmail",
      "password",
    ],
    1: [
      "address",
      "city",
      "county",
      "postalCode",
      "residenceType",
      "livesAlone",
    ],
    2: [],
  };

  const LOCAL_STORAGE_KEY = "clientFormData";

  // Convert file to base64 for localStorage persistence
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Convert base64 back to a File object
  const base64ToFile = (base64, filename, mimeType) => {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeType });
  };

  // Update form data and persist to localStorage
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

      Object.keys(dataForStorage).forEach((key) => {
        if (
          key.endsWith("Preview") &&
          dataForStorage[key]?.startsWith?.("blob:")
        ) {
          delete dataForStorage[key];
        }
      });

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataForStorage));
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
      }

      return updated;
    });
  };

  // Load from localStorage when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (!parsedData.password || parsedData.password === "") {
          parsedData.password = generateRandomPassword();
        }
        const fileFields = ["profilePicture"];
        const processedData = { ...parsedData };
        for (const field of fileFields) {
          if (parsedData[`${field}Base64`]) {
            const file = base64ToFile(
              parsedData[`${field}Base64`],
              `${field}.jpg`,
              "image/jpeg"
            );
            processedData[field] = file;
            const previewUrl = URL.createObjectURL(file);
            processedData[`${field}Preview`] = previewUrl;
            delete processedData[`${field}Base64`];
          }
        }
        setFormData(processedData);
      }
    };
    loadSavedData();
  }, []);

  // Update loginEmail when email changes, unless manually modified
  useEffect(() => {
    if (!loginEmailManuallyModified && formData.email) {
      const usernameFromEmail = formData.email.split("@")[0];
      updateFormData({ loginEmail: usernameFromEmail });
    }
  }, [formData.email, loginEmailManuallyModified]);

  // Clear form data only (for after successful creation)
  const clearFormData = () => {
    Object.keys(formData).forEach((key) => {
      if (key.endsWith("Preview") && formData[key]?.startsWith?.("blob:")) {
        URL.revokeObjectURL(formData[key]);
      }
    });

    const emptyForm = {
      profilePicture: null,
      profilePreview: "",
      title: "",
      firstName: "",
      lastName: "",
      preferredName: "",
      gender: "",
      preferredPronouns: "",
      dob: "",
      maritalStatus: "",
      nhisNumber: "",
      email: "",
      phoneCode: "",
      phone: "",
      altPhoneCode: "",
      altPhone: "",
      loginEmail: "",
      password: generateRandomPassword(),
      sendCredentialsToEmail: false,
      primaryContact: "",
      primaryContactPhoneCode: "",
      primaryContactPhone: "",
      primaryContactEmail: "",
      secondaryContact: "",
      secondaryContactPhoneCode: "",
      secondaryContactPhone: "",
      secondaryContactEmail: "",
      communicationPreferences: [],
      address: "",
      city: "",
      county: "",
      postalCode: "",
      residenceType: "",
      livesAlone: "",
      cohabitants: "",
      keySafeAccessInstructions: "",
      nextOfKin: "",
      relationship: "",
      nokEmail: "",
      nokTown: "",
      nokPhoneCode1: "",
      nokPhone1: "",
      nokPhoneCode2: "",
      nokPhone2: "",
    };

    setFormData(emptyForm);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setActiveStep(0);
    setStepValidity({});
    setClientId(null);
    setLoginEmailManuallyModified(false);
  };

  // Clear form functionality
  const clearForm = () => {
    clearFormData();
    setShowClearFormModal(false);
  };

  // Validate steps
  useEffect(() => {
    const newStepValidity = {};
    for (let i = 0; i < steps.length - 1; i++) {
      newStepValidity[i] = isStepValid(i, formData);
    }
    setStepValidity(newStepValidity);
  }, [formData, activeStep]);

  const isStepValid = (step, data) => {
    const required = stepValidations[step] || [];
    if (step === 1 && data.livesAlone === "no") {
      required.push("cohabitants");
    }
    return required.every((field) => {
      const value = data[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== "" && value !== false;
    });
  };

  const getMissingFields = (step, data) => {
    const required = stepValidations[step] || [];
    if (step === 1 && data.livesAlone === "no") {
      required.push("cohabitants");
    }
    return required.filter((field) => {
      const value = data[field];
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return value === null || value === "" || value === false;
    });
  };

  const getMissingFieldLabels = (step, data) =>
    getMissingFields(step, data).map((field) => fieldLabels[field] || field);

  // API submission function
  const submitFormData = async () => {
    if (!isStepValid(activeStep, formData)) {
      const missingLabels = getMissingFieldLabels(activeStep, formData);
      setMissingFields(missingLabels);
      setShowMissingFieldsModal(true);
      return;
    }

    // Only submit in the final step (Preview & Submit)
    if (activeStep === steps.length - 1 && !clientId) {
      setIsSubmitting(true);

      try {
        // Create client with all non-file fields
        const nonFilePayload = {
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          username:
            formData.loginEmail ||
            `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`,
          role: "client",
          profile: {
            title: formData.title,
            contact_number: formData.phoneCode + formData.phone,
            alt_contact_number: formData.altPhoneCode + formData.altPhone,
            gender_identity: formData.gender,
            preferred_pronouns: formData.preferredPronouns,
            preferred_name: formData.preferredName,
            date_of_birth: formData.dob,
            nhis_number: formData.nhisNumber,
            marital_status: formData.maritalStatus,
            primary_contact_name: formData.primaryContact,
            primary_contact_phone:
              formData.primaryContactPhoneCode + formData.primaryContactPhone,
            primary_contact_email: formData.primaryContactEmail,
            secondary_contact_name: formData.secondaryContact,
            secondary_contact_phone:
              formData.secondaryContactPhoneCode +
              formData.secondaryContactPhone,
            secondary_contact_email: formData.secondaryContactEmail,
            communication_preference: formData.communicationPreferences,
            send_credentials_to_email: formData.sendCredentialsToEmail,
            address_line: formData.address,
            town: formData.city,
            county: formData.county,
            postcode: formData.postalCode,
            type_of_residence: formData.residenceType,
            lives_alone: formData.livesAlone === "yes",
            co_residents: formData.cohabitants,
            key_safe_instructions: formData.keySafeAccessInstructions,
            next_of_kin_full_name: formData.nextOfKin,
            next_of_kin_relationship: formData.relationship,
            next_of_kin_contact_number:
              formData.nokPhoneCode1 + formData.nokPhone1,
            next_of_kin_alt_contact_number:
              formData.nokPhoneCode2 + formData.nokPhone2,
            next_of_kin_town: formData.nokTown,
            next_of_kin_email: formData.nokEmail,
          },
        };

        const createdClient = await createClient(nonFilePayload);
        const newClientId = createdClient.id;
        setClientId(newClientId);

        // Auto-assign client to cluster
        const assignPayload = {
          name: `${createdClient.first_name} ${createdClient.last_name}`,
          postcode: createdClient.profile.postcode,
          address: createdClient.profile.address_line,
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

        // Store names before clearing
        const firstName = formData.firstName;
        const lastName = formData.lastName;

        clearFormData();

        setModalType("success");
        setModalTitle("Client Created Successfully");
        setModalMessage(
          `${firstName} ${lastName}'s profile has been fully created and is being assigned to a cluster.`
        );
        setShowStatusModal(true);
      } catch (error) {
        setModalType("error");
        setModalTitle("Creation Failed");
        setModalMessage(
          error.message ||
            "There was an error creating the client. Please try again."
        );
        setShowStatusModal(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Move to next step if not in final step
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
        formTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
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

  const handleBulkUploadSuccess = (title, message) => {
    setModalType("success");
    setModalTitle(title);
    setModalMessage(message);
    setShowStatusModal(true);
  };

  const handleBulkUploadError = (title, message) => {
    setModalType("error");
    setModalTitle(title);
    setModalMessage(message);
    setShowStatusModal(true);
  };

  const handleButtonClick = () => {
    submitFormData();
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.history.back();
    }
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return "Creating...";
    }
    if (activeStep === steps.length - 1) {
      return "Create Client";
    }
    return "Continue";
  };

  const handleStepClick = (stepIndex) => {
    if (
      stepIndex <= activeStep ||
      (stepIndex > activeStep && stepValidity[activeStep])
    ) {
      setActiveStep(stepIndex);
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      alert(
        "Please complete the current step before proceeding to the next one."
      );
    }
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length <= 15) {
      updateFormData({ [name]: digitsOnly });
    }
  };

  const createFileHandler = useCallback(
    (fieldName, previewFieldName = null) => {
      return async (file) => {
        const base64 = await fileToBase64(file);
        const previewUrl = URL.createObjectURL(file);
        const updates = {
          [fieldName]: file,
          [`${fieldName}Base64`]: base64,
        };
        if (previewFieldName) {
          if (formData[previewFieldName]?.startsWith?.("blob:")) {
            URL.revokeObjectURL(formData[previewFieldName]);
          }
          updates[previewFieldName] = previewUrl;
        }
        updateFormData(updates);
      };
    },
    [formData]
  );

  const createFileRemover = useCallback(
    (fieldName, previewFieldName = null, ref = null) => {
      return () => {
        const updates = { [fieldName]: null };
        if (previewFieldName) {
          if (formData[previewFieldName]?.startsWith?.("blob:")) {
            URL.revokeObjectURL(formData[previewFieldName]);
          }
          updates[previewFieldName] = "";
        }
        if (ref?.current) {
          ref.current.value = "";
        }
        updateFormData(updates);
      };
    },
    [formData]
  );

  const handleProfilePictureChange = createFileHandler(
    "profilePicture",
    "profilePreview"
  );
  const removeProfilePicture = createFileRemover(
    "profilePicture",
    "profilePreview",
    fileInputRef
  );

  const handleChange = (eOrValue) => {
    if (eOrValue && eOrValue.target) {
      const { name, value, type, checked } = eOrValue.target;
      if (name === "loginEmail" && !loginEmailManuallyModified) {
        setLoginEmailManuallyModified(true);
      }
      if (type === "checkbox") {
        updateFormData({ [name]: checked });
      } else {
        updateFormData({ [name]: value });
      }
    } else if (
      typeof eOrValue === "object" &&
      eOrValue.name &&
      eOrValue.value !== undefined
    ) {
      updateFormData({ [eOrValue.name]: eOrValue.value });
    } else {
      updateFormData(eOrValue);
    }
  };

  const renderStepForm = () => {
    switch (activeStep) {
      case 0:
        return (
          <PersonalInfoStep
            formData={formData}
            handleChange={handleChange}
            handlePhoneChange={handlePhoneChange}
            profilePicture={formData.profilePicture}
            profilePreview={formData.profilePreview}
            handleFileChange={handleProfilePictureChange}
            removeLogo={removeProfilePicture}
            fileInputRef={fileInputRef}
            setFocusedInput={setFocusedInput}
            focusedInput={focusedInput}
          />
        );
      case 1:
        return (
          <AddressStep
            formData={formData}
            handleChange={handleChange}
            setFocusedInput={setFocusedInput}
            focusedInput={focusedInput}
            handlePhoneChange={handlePhoneChange}
          />
        );
      case 2:
        return <FinalPreviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
        <SideNavBar setShrinkNav={setShrinkNav} />
        <div className="Main-DB-Envt">
          <div className="DB-Envt-Container" ref={formTopRef}>
            <form
              className="create-client"
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                className="create-client-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <IoIosArrowRoundBack onClick={() => navigate(-1)} />
                  <div>
                    <h2>Create New Client</h2>
                    <p>
                      Fill in the client's details to add them to the system.
                    </p>
                  </div>
                </div>

                <div className="BBujas-ENnvs">
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

              <HorizontalLinearAlternativeLabelStepper
                steps={steps}
                activeStep={activeStep}
                stepValidity={stepValidity}
                onStepClick={handleStepClick}
              />

              <div className="client-form-body">
                <div className="client-form-left">
                  {renderStepForm()}
                  <div className="client-form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="continue-btn"
                      onClick={handleButtonClick}
                      disabled={isSubmitting}
                    >
                      {getButtonText()}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <BulkUploadClients
          isOpen={showBulkUploadModal}
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={handleBulkUploadSuccess}
          onError={handleBulkUploadError}
        />

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
          onClose={() => {
            setShowStatusModal(false);
          }}
          name="Client"
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          showAddAnother={false}
          onViewList={handleViewList}
          showProceedCarePlan
          onProceedCarePlan={() =>
            navigate(`/company/client/create-care-plan/${clientId}`)
          }
          isFinalStep={activeStep === steps.length - 1}
          onContinue={() => {
            setShowStatusModal(false);
            if (activeStep < steps.length - 1) {
              setActiveStep(activeStep + 1);
            }
          }}
        />
      </div>
    </>
  );
}
