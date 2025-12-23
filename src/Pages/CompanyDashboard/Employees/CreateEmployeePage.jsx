import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideNavBar from "../Home/SideNavBar";
import HorizontalLinearAlternativeLabelStepper from "../../../components/Stepper";
import { IoIosArrowRoundBack } from "react-icons/io";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createEmployee,
  updateEmployee,
  autoAssignCarerToCluster,
} from "./config/apiService";
import { updateJobApplicationStatus } from "../Recruitment/ApiService";
import { fetchJobApplicationById } from "../Recruitment/ApiService";
import {
  fetchOnboardingDocuments,
  fetchDocumentDetails,
  updateDocumentPermissions,
} from "../OnboardingDocuments/config/apiConfig";
import "../../../components/Input/form.css";
import "../Employees/styles/CreateEmployeePage.css";
import PersonalInfoStep from "./components/steps/PersonalInfoStep";
import EmploymentDetailsStep from "./components/steps/EmploymentDetailsStep";
import EducationDetailsStep from "./components/steps/EducationDetailsStep";
import DBSVerificationDetailsStep from "./components/steps/DBSVerificationDetailsStep";
import DrivingStatusDetailsStep from "./components/steps/DrivingStatusDetailsStep";
import OnboardingDocumentsStep from "./components/steps/OnboardingDocumentsStep";
import BulkUploadEmployees from "./components/steps/BulkUploadEmployees";
import MissingFieldsModal from "./modals/MissingFieldsModal";
// import ClearFormModal from "./modals/ClearFormModal";
import SuccessOrErrorModal from "../../../components/Modal/SuccessOrErrorModal";
import { generateRandomPassword, normalizeText } from "../../../utils/helpers";

export default function CreateEmployeePage() {
  const { applicantId } = useParams();
  const tenantDomain = localStorage.getItem("tenantDomain");
  const [applicant, setApplicant] = useState(null);
  const [shrinkNav, setShrinkNav] = useState(false);
  // const [showClearFormModal, setShowClearFormModal] = useState(false);
  const [showMissingFieldsModal, setShowMissingFieldsModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [loginEmailManuallyModified, setLoginEmailManuallyModified] =
    useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [onboardingDocuments, setOnboardingDocuments] = useState([]);
  const navigate = useNavigate();
  const isHRApp = window.location.pathname.includes("hr");
  // FORM STATE
  const [formData, setFormData] = useState({
    profilePicture: null,
    profilePreview: "",
    profilePictureUrl: "",
    firstName: "",
    lastName: "",
    role: "",
    gender: "",
    dob: "",
    maritalStatus: "",
    workEmail: "",
    workPhoneCode: "+234",
    workPhone: "",
    personalPhoneCode: "+234",
    personalPhone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    nextOfKin: "",
    relationship: "",
    nokEmail: "",
    nokAddress: "",
    nokPostalCode: "",
    nokPhoneCode1: "+234",
    nokPhone1: "",
    nokPhoneCode2: "+234",
    nokPhone2: "",
    loginEmail: "",
    password: generateRandomPassword(),
    sendCredentialsToEmail: false,
    onboardingDocumentsAccess: [],
    // Employment / Right to Work & Right to Rent
    jobRole: "",
    department: "",
    lineManager: "",
    hierarchy: "",
    employmentType: "",
    employmentStartDate: "",
    employmentEndDate: "",
    probationEndDate: "",
    salary: "",
    salaryCurrency: "",
    workingDays: "",
    maxWorkingHours: "",
    rightToWorkStatus: "",
    passportHolder: "",
    rightToWorkDocumentType: "",
    rightToWorkDocumentNumber: "",
    rightToWorkDocumentExpiryDate: "",
    shareCode: "",
    rightToWorkFile: null,
    rightToWorkFilePreview: "",
    rightToWorkFileUrl: "",
    countryOfIssue: "",
    workRestrictions: "",
    evidenceRightToRent: "",
    legalWorkPhoneCode: "",
    legalWorkPhone: "",
    rightToRentFile: null,
    rightToRentFilePreview: "",
    rightToRentFileUrl: "",
    insuranceType: "",
    insuranceFile: null,
    insuranceFilePreview: "",
    insuranceFileUrl: "",
    insuranceProviderName: "",
    insuranceCoverageStartDate: "",
    insuranceExpiryDate: "",
    insurancePhoneCode: "",
    insurancePhone: "",
    // Banking / Education
    bankName: "",
    accountNumber: "",
    accountName: "",
    accountType: "",
    institution: "",
    highestQualification: "",
    courseOfStudy: "",
    educationStartYear: "",
    educationEndYear: "",
    educationSkills: "",
    educationCertificate: null,
    educationCertificatePreview: "",
    educationCertificateUrl: "",
    professionalQualification: "",
    professionalQualificationFile: null,
    professionalQualificationPreview: "",
    professionalQualificationUrl: "",
    governmentIdType: "",
    idDocument: null,
    idDocumentPreview: "",
    idDocumentUrl: "",
    cvFile: null,
    cvPreview: "",
    cvFileUrl: "",
    governmentIdDocumentNumber: "",
    // DBS / Proof of Address / References
    dbsType: "",
    dbsCertificate: null,
    dbsCertificatePreview: "",
    dbsCertificateUrl: "",
    dbsCertificateNumber: "",
    dbsIssueDate: "",
    dbsUpdateService: null,
    dbsUpdateServicePreview: "",
    dbsUpdateServiceUrl: "",
    dbsUpdateCertificateNumber: "",
    dbsUpdateIssueDate: "",
    realTimeStatusChecks: false,
    addressProofType: "",
    utilityBill: null,
    utilityBillPreview: "",
    utilityBillUrl: "",
    utilityBillDate: "",
    nin: "",
    ninFile: null,
    ninPreview: "",
    ninFileUrl: "",
    referee1Name: "",
    referee1PhoneCode: "",
    referee1Phone: "",
    referee1Email: "",
    referee1Relationship: "",
    referee2Name: "",
    referee2PhoneCode: "",
    referee2Phone: "",
    referee2Email: "",
    referee2Relationship: "",
    // Driving / Availability / Permissions
    drivingStatus: false,
    vehicleType: "",
    drivingLicenseFront: null,
    drivingLicenseFrontPreview: "",
    drivingLicenseFrontUrl: "",
    drivingLicenseBack: null,
    drivingLicenseBackPreview: "",
    drivingLicenseBackUrl: "",
    countryOfDrivingLicenseIssue: "",
    drivingLicenseIssueDate: "",
    drivingLicenseExpiryDate: "",
    policyNumber: "",
    driversLicenseIssuingAuthority: "",
    driversLicenseInsuranceProvider: "",
    driversLicenseInsuranceExpiryDate: "",
    isSyncWithRoster: false,
    availability: {},
    systemAccess: false,
    systemAccessSelections: [],
    systemAdminAccess: false,
    systemAdminAccessSelections: [],
  });
  const [focusedInput, setFocusedInput] = useState(null);
  const formTopRef = useRef(null);
  const fileInputRef = useRef(null);
  const rightToWorkFileRef = useRef(null);
  const rightToRentFileRef = useRef(null);
  const insuranceFileRef = useRef(null);
  const educationCertificateRef = useRef(null);
  const professionalQualificationRef = useRef(null);
  const idDocumentRef = useRef(null);
  const dbsCertificateRef = useRef(null);
  const dbsUpdateServiceRef = useRef(null);
  const utilityBillRef = useRef(null);
  const ninRef = useRef(null);
  const drivingLicenseFrontRef = useRef(null);
  const drivingLicenseBackRef = useRef(null);
  const fieldLabels = {
    profilePicture: "Profile Picture",
    profilePreview: "Profile Picture Preview",
    firstName: "First Name",
    lastName: "Last Name",
    role: "Role",
    gender: "Gender",
    dob: "Date of Birth",
    maritalStatus: "Marital Status",
    workPhoneCode: "Work Phone Code",
    workPhone: "Work Phone",
    workEmail: "Work Email",
    personalPhoneCode: "Personal Phone Code",
    personalPhone: "Personal Phone",
    address: "Address",
    country: "Country",
    state: "State",
    city: "City",
    postalCode: "Postal Code",
    nextOfKin: "Next of Kin Name",
    relationship: "Next of Kin Relationship",
    nokEmail: "Next of Kin Email",
    nokAddress: "Next of Kin Address",
    nokPostalCode: "Next of Kin Postal Code",
    nokPhoneCode1: "Next of Kin Phone Code 1",
    nokPhone1: "Next of Kin Phone 1",
    nokPhoneCode2: "Next of Kin Phone Code 2",
    nokPhone2: "Next of Kin Phone 2",
    loginEmail: "Login Email",
    password: "Password",
    sendCredentialsToEmail: "Send Login Credentials to Employee's Email",
    jobRole: "Job Role",
    department: "Department",
    lineManager: "Line Manager",
    hierarchy: "Hierarchy",
    employmentType: "Employment Type",
    employmentStartDate: "Employment Start Date",
    employmentEndDate: "Employment End Date",
    probationEndDate: "Probation End Date",
    salary: "Salary",
    salaryCurrency: "Salary Currency",
    workingDays: "Working Days",
    maxWorkingHours: "Max Working Hours",
    rightToWorkStatus: "Right to Work Status",
    passportHolder: "Passport Holder",
    rightToWorkDocumentType: "Right to Work Document Type",
    rightToWorkDocumentNumber: "Right to Work Document Number",
    rightToWorkDocumentExpiryDate: "Right to Work Document Expiry Date",
    shareCode: "Share Code",
    rightToWorkFile: "Right to Work File",
    rightToWorkFilePreview: "Right to Work File Preview",
    countryOfIssue: "Country of Issue",
    workRestrictions: "Work Restrictions",
    evidenceRightToRent: "Right to Rent Evidence",
    legalWorkPhoneCode: "Legal Work Phone Code",
    legalWorkPhone: "Legal Work Phone",
    rightToRentFile: "Right to Rent File",
    rightToRentFilePreview: "Right to Rent File Preview",
    insuranceType: "Insurance Type",
    insuranceFile: "Insurance File",
    insuranceFilePreview: "Insurance File Preview",
    insuranceProviderName: "Insurance Provider Name",
    insuranceCoverageStartDate: "Insurance Coverage Start Date",
    insuranceExpiryDate: "Insurance Expiry Date",
    insurancePhoneCode: "Insurance Phone Code",
    insurancePhone: "Insurance Phone",
    bankName: "Bank Name",
    accountNumber: "Account Number",
    accountName: "Account Name",
    accountType: "Account Type",
    institution: "Institution",
    highestQualification: "Highest Qualification",
    courseOfStudy: "Course of Study",
    educationStartYear: "Education Start Year",
    educationEndYear: "Education End Year",
    educationSkills: "Education Skills",
    educationCertificate: "Education Certificate",
    educationCertificatePreview: "Education Certificate Preview",
    professionalQualification: "Professional Qualification",
    professionalQualificationFile: "Professional Qualification File",
    professionalQualificationPreview: "Professional Qualification Preview",
    governmentIdType: "Government ID Type",
    idDocument: "ID Document",
    idDocumentPreview: "ID Document Preview",
    cvFile: "CV File",
    cvPreview: "CV Preview",
    dbsType: "DBS Type",
    dbsCertificate: "DBS Certificate",
    dbsCertificatePreview: "DBS Certificate Preview",
    dbsCertificateNumber: "DBS Certificate Number",
    dbsIssueDate: "DBS Issue Date",
    dbsUpdateService: "DBS Update Service",
    dbsUpdateServicePreview: "DBS Update Service Preview",
    dbsUpdateCertificateNumber: "DBS Update Certificate Number",
    dbsUpdateIssueDate: "DBS Update Issue Date",
    realTimeStatusChecks: "Real Time Status Checks",
    addressProofType: "Address Proof Type",
    utilityBill: "Utility Bill",
    utilityBillPreview: "Utility Bill Preview",
    utilityBillDate: "Utility Bill Date",
    nin: "NIN",
    ninFile: "NIN File",
    ninPreview: "NIN Preview",
    referee1Name: "Referee 1 Name",
    referee1PhoneCode: "Referee 1 Phone Code",
    referee1Phone: "Referee 1 Phone",
    referee1Email: "Referee 1 Email",
    referee1Relationship: "Referee 1 Relationship",
    referee2Name: "Referee 2 Name",
    referee2PhoneCode: "Referee 2 Phone Code",
    referee2Phone: "Referee 2 Phone",
    referee2Email: "Referee 2 Email",
    referee2Relationship: "Referee 2 Relationship",
    drivingStatus: "Driving Status",
    vehicleType: "Vehicle Type",
    drivingLicenseFront: "Driving License Front",
    drivingLicenseFrontPreview: "Driving License Front Preview",
    drivingLicenseBack: "Driving License Back",
    drivingLicenseBackPreview: "Driving License Back Preview",
    countryOfDrivingLicenseIssue: "Country of Driving License Issue",
    drivingLicenseIssueDate: "Driving License Issue Date",
    drivingLicenseExpiryDate: "Driving License Expiry Date",
    policyNumber: "Policy Number",
    driversLicenseIssuingAuthority: "Drivers License Issuing Authority",
    driversLicenseInsuranceProvider: "Drivers License Insurance Provider",
    driversLicenseInsuranceExpiryDate: "Drivers License Insurance Expiry Date",
    isSyncWithRoster: "Sync With Roster",
    availability: "Availability",
    systemAccess: "System Access",
    systemAccessSelections: "System Access Selections",
  };
  const steps = [
    {
      title: "Personal Information",
      subtitle: "",
    },
    {
      title: "Employment details, Right to work & Work Eligibility",
      subtitle: "",
    },
    { title: "Education Qualifications and Bank Details", subtitle: "" },
    { title: "DBS Verification, Proof of Address & References", subtitle: "" },
    { title: "Driving Status, Availability & Permissions", subtitle: "" },
    { title: "Onboarding Documents ", subtitle: "" },
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [stepValidity, setStepValidity] = useState({});
  const stepValidations = {
    0: [
      "firstName",
      "lastName",
      "gender",
      "dob",
      "maritalStatus",
      "address",
      "country",
      "state",
      "city",
      "postalCode",
      "nextOfKin",
      "relationship",
      "workEmail",
      "nokEmail",
      "nokAddress",
      "nokPostalCode",
      "nokPhone1",
      "loginEmail",
      "password",
    ],
    1: [
      "jobRole",
      "department",
      "employmentType",
      "employmentStartDate",
      "workingDays",
      "maxWorkingHours",
      "countryOfIssue",
      "workRestrictions",
      "rightToWorkDocumentType",
      "rightToWorkDocumentNumber",
      "rightToWorkDocumentExpiryDate",
      "evidenceRightToRent",
      "insuranceType",
      ...(formData.insuranceType === "Professional Indemnity"
        ? [
            "insuranceProviderName",
            "insuranceCoverageStartDate",
            "insuranceExpiryDate",
          ]
        : []),
      ...(formData.insuranceType === "Public Liability"
        ? [
            "insuranceExpiryDate",
            "insurancePhone",
            "insuranceCoverageStartDate",
          ]
        : []),
    ],
    2: [
      "institution",
      "highestQualification",
      "courseOfStudy",
      "professionalQualification",
      "educationStartYear",
      "educationEndYear",
      "bankName",
      "accountNumber",
      "accountName",
      "accountType",
    ],
    3: [
      "dbsType",
      "dbsCertificateNumber",
      "dbsIssueDate",
      "nin",
      "referee1Name",
      "referee1Email",
      "referee1PhoneCode",
      "referee1Relationship",
      "referee2Name",
      "referee2Phone",
      "referee2Email",
      "referee2PhoneCode",
      "referee2Relationship",
    ],
    4: [],
    5: [],
  };
  const LOCAL_STORAGE_KEY = "employeeFormData";
  const saveTimeoutRef = useRef(null);
  // Update form data and persist to localStorage with debouncing
  const updateFormData = (newData) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      // Debounce localStorage save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        // Create sanitized storage data - EXCLUDE files and base64 data
        const dataForStorage = {};
        // Copy only non-File and non-base64 properties to storage
        Object.keys(updated).forEach((key) => {
          if (
            !(updated[key] instanceof File) &&
            !key.endsWith("Base64") &&
            !key.endsWith("Preview")
          ) {
            dataForStorage[key] = updated[key];
          }
        });
        try {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(dataForStorage)
          );
        } catch (error) {
          console.error("Failed to save to localStorage:", error);
        }
      }, 500); // Save after 500ms of no changes
      return updated;
    });
  };
  // Fetch applicant data and clear localStorage to ensure form starts empty
  useEffect(() => {
    const loadData = async () => {
      let updatedFormData = { ...formData };
      // Clear any existing saved data to ensure form starts empty
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      // Fetch applicant data if applicantId is provided
      if (applicantId) {
        try {
          const applicantData = await fetchJobApplicationById(applicantId);
          setApplicant(applicantData);
          // Map applicant data to form fields
          if (applicantData) {
            // Personal Info (Step 0)
            if (applicantData.full_name) {
              const [firstName, ...lastNameParts] =
                applicantData.full_name.split(" ");
              updatedFormData.firstName =
                firstName || applicantData.first_name || "";
              updatedFormData.lastName =
                lastNameParts.join(" ") || applicantData.last_name || "";
            }
            if (applicantData.email) {
              updatedFormData.workEmail = applicantData.email;
              if (!loginEmailManuallyModified) {
                updatedFormData.loginEmail = applicantData.email.split("@")[0];
              }
            }
            if (applicantData.phone) {
              const normalizedPhone = normalizeText(applicantData.phone);
              const phoneParts = normalizedPhone.match(/(\+\d{1,3})(\d+)/);
              if (phoneParts) {
                updatedFormData.workPhoneCode = phoneParts[1];
                updatedFormData.workPhone = phoneParts[2];
                updatedFormData.personalPhoneCode = phoneParts[1];
                updatedFormData.personalPhone = phoneParts[2];
              }
            }
            if (applicantData.date_of_birth) {
              updatedFormData.dob = applicantData.date_of_birth;
            }
            if (applicantData.job_requisition_title) {
              updatedFormData.jobRole = applicantData.job_requisition_title;
            }
            // Employment (Step 1)
            if (applicantData.compliance_status) {
              applicantData.compliance_status.forEach((comp) => {
                const metadata = comp.metadata || {};
                if (comp.id === "compliance-right-to-work") {
                  updatedFormData.rightToWorkStatus = comp.status;
                  updatedFormData.passportHolder =
                    metadata.passportHolder || "";
                  updatedFormData.rightToWorkDocumentType =
                    metadata.rightToWorkDocumentType || "";
                  updatedFormData.rightToWorkDocumentNumber =
                    metadata.rightToWorkDocumentNumber || "";
                  updatedFormData.rightToWorkDocumentExpiryDate =
                    metadata.rightToWorkDocumentExpiryDate || "";
                  updatedFormData.shareCode = metadata.shareCode || "";
                  updatedFormData.countryOfIssue =
                    metadata.countryOfIssue || "";
                  if (comp.document && comp.document.length > 0) {
                    const docUrl = comp.document[0].file_url;
                    updatedFormData.rightToWorkFilePreview = docUrl;
                    updatedFormData.rightToWorkFileUrl = docUrl;
                  }
                } else if (comp.id === "compliance-proof-of-address") {
                  updatedFormData.addressProofType =
                    metadata.addressProofType || "utility_bill";
                  updatedFormData.utilityBillDate =
                    metadata.utilityBillDate || "";
                  updatedFormData.nin = metadata.nin || "";
                  if (comp.document && comp.document.length > 0) {
                    const docUrl = comp.document[0].file_url;
                    if (
                      updatedFormData.addressProofType
                        .toLowerCase()
                        .includes("nin")
                    ) {
                      updatedFormData.ninPreview = docUrl;
                      updatedFormData.ninFileUrl = docUrl;
                    } else {
                      updatedFormData.utilityBillPreview = docUrl;
                      updatedFormData.utilityBillUrl = docUrl;
                    }
                  }
                } else if (comp.id === "compliance-driving-license") {
                  updatedFormData.drivingStatus = comp.status === "accepted";
                  updatedFormData.vehicleType = metadata.vehicleType || "";
                  updatedFormData.policyNumber = metadata.policyNumber || "";
                  updatedFormData.countryOfDrivingLicenseIssue =
                    metadata.countryOfDrivingLicenseIssue || "";
                  updatedFormData.drivingLicenseIssueDate =
                    metadata.drivingLicenseIssueDate || "";
                  updatedFormData.drivingLicenseExpiryDate =
                    metadata.drivingLicenseExpiryDate || "";
                  updatedFormData.driversLicenseIssuingAuthority =
                    metadata.driversLicenseIssuingAuthority || "";
                  updatedFormData.driversLicenseInsuranceProvider =
                    metadata.driversLicenseInsuranceProvider || "";
                  updatedFormData.driversLicenseInsuranceExpiryDate =
                    metadata.driversLicenseInsuranceExpiryDate || "";
                  if (comp.document && comp.document.length > 0) {
                    const frontUrl = comp.document[0].file_url;
                    updatedFormData.drivingLicenseFrontPreview = frontUrl;
                    updatedFormData.drivingLicenseFrontUrl = frontUrl;
                  }
                  if (comp.document && comp.document.length > 1) {
                    const backUrl = comp.document[1].file_url;
                    updatedFormData.drivingLicenseBackPreview = backUrl;
                    updatedFormData.drivingLicenseBackUrl = backUrl;
                  }
                } else if (comp.id === "compliance-dbs-certificate") {
                  updatedFormData.dbsType =
                    metadata.dbsType ||
                    (comp.status === "accepted" ? "Standard" : "");
                  updatedFormData.dbsCertificateNumber =
                    metadata.dbsCertificateNumber || "";
                  updatedFormData.dbsIssueDate = metadata.dbsIssueDate || "";
                  updatedFormData.dbsUpdateCertificateNumber =
                    metadata.dbsUpdateCertificateNumber || "";
                  updatedFormData.dbsUpdateIssueDate =
                    metadata.dbsUpdateIssueDate || "";
                  if (comp.document && comp.document.length > 0) {
                    const docUrl = comp.document[0].file_url;
                    updatedFormData.dbsCertificatePreview = docUrl;
                    updatedFormData.dbsCertificateUrl = docUrl;
                  }
                } else if (comp.id === "compliance-passport-id") {
                  updatedFormData.governmentIdType = "Passport";
                  if (comp.document && comp.document.length > 0) {
                    const docUrl = comp.document[0].file_url;
                    updatedFormData.idDocumentPreview = docUrl;
                    updatedFormData.idDocumentUrl = docUrl;
                  }
                } else if (comp.id === "compliance-curriculum-vitae-cv") {
                  if (comp.document && comp.document.length > 0) {
                    const docUrl = comp.document[0].file_url;
                    updatedFormData.cvPreview = docUrl;
                    updatedFormData.cvFileUrl = docUrl;
                  }
                } else if (
                  comp.id === "compliance-professional-qualifications"
                ) {
                  updatedFormData.professionalQualification =
                    metadata.professionalQualification || "";
                  if (comp.document && comp.document.length > 0) {
                    const docUrl = comp.document[0].file_url;
                    updatedFormData.professionalQualificationPreview = docUrl;
                    updatedFormData.professionalQualificationUrl = docUrl;
                  }
                } else if (comp.id === "compliance-references") {
                  updatedFormData.referee1Name = metadata.referee1Name || "";
                  updatedFormData.referee1PhoneCode =
                    metadata.referee1PhoneCode || "+1";
                  updatedFormData.referee1Phone = metadata.referee1Phone
                    ? metadata.referee1Phone.replace(/\D/g, "")
                    : "";
                  updatedFormData.referee1Email = metadata.referee1Email || "";
                  updatedFormData.referee1Relationship =
                    metadata.referee1Relationship || "";
                  updatedFormData.referee2Name = metadata.referee2Name || "";
                  updatedFormData.referee2PhoneCode =
                    metadata.referee2PhoneCode || "+1";
                  updatedFormData.referee2Phone = metadata.referee2Phone
                    ? metadata.referee2Phone.replace(/\D/g, "")
                    : "";
                  updatedFormData.referee2Email = metadata.referee2Email || "";
                  updatedFormData.referee2Relationship =
                    metadata.referee2Relationship || "";
                }
              });
            }
            // Education (Step 2)
            if (applicantData.qualification) {
              const quals = applicantData.qualification
                .split(", ")
                .map((q) => q.trim());
              updatedFormData.highestQualification = quals.includes("M.Sc")
                ? "M.Sc"
                : quals.includes("B.Sc")
                ? "B.Sc"
                : quals[0] || "";
              updatedFormData.professionalQualification = quals.includes(
                "Associate"
              )
                ? "Associate"
                : "";
            }
            if (applicantData.knowledge_skill) {
              updatedFormData.educationSkills = applicantData.knowledge_skill;
            }
            if (applicantData.documents) {
              applicantData.documents.forEach((doc) => {
                const docTypeLower = doc.document_type.toLowerCase();
                if (docTypeLower === "bsc") {
                  const docUrl = doc.file_url;
                  updatedFormData.educationCertificatePreview = docUrl;
                  updatedFormData.educationCertificateUrl = docUrl;
                } else if (
                  ["cv", "curriculum vitae (cv)"].some((type) =>
                    docTypeLower.includes(type)
                  )
                ) {
                  const docUrl = doc.file_url;
                  updatedFormData.cvPreview = docUrl;
                  updatedFormData.cvFileUrl = docUrl;
                } else if (docTypeLower.includes("certification")) {
                  const docUrl = doc.file_url;
                  updatedFormData.professionalQualificationPreview = docUrl;
                  updatedFormData.professionalQualificationUrl = docUrl;
                }
              });
            }
          }
        } catch (error) {
          setModalType("error");
          setModalTitle("Error Fetching Applicant Data");
          setModalMessage(
            "Failed to fetch applicant data. Proceeding with empty form."
          );
          setShowStatusModal(true);
        }
      }
      setFormData(updatedFormData);
    };
    loadData();
  }, [applicantId, loginEmailManuallyModified]);
  // Fetch onboarding documents when employee is created
  useEffect(() => {
    const fetchOnboardingDocs = async () => {
      if (employeeId) {
        try {
          const docs = await fetchOnboardingDocuments();
          setOnboardingDocuments(docs || []);
          updateFormData({ onboardingDocumentsAccess: [] });
        } catch (error) {
          console.error("Failed to fetch onboarding documents:", error);
        }
      }
    };
    fetchOnboardingDocs();
  }, [employeeId]);

  // Clear save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  // Clear form functionality
  // const clearForm = () => {
  // // Clean up all blob URLs
  // Object.keys(formData).forEach((key) => {
  // if (key.endsWith("Preview") && formData[key]?.startsWith?.("blob:")) {
  // URL.revokeObjectURL(formData[key]);
  // }
  // });
  // // Reset form data
  // const emptyForm = {
  // profilePicture: null,
  // profilePreview: "",
  // profilePictureUrl: "",
  // firstName: "",
  // lastName: "",
  // role: "",
  // gender: "",
  // dob: "",
  // maritalStatus: "",
  // workEmail: "",
  // workPhoneCode: "+1",
  // workPhone: "",
  // personalPhoneCode: "+1",
  // personalPhone: "",
  // address: "",
  // country: "",
  // state: "",
  // city: "",
  // postalCode: "",
  // nextOfKin: "",
  // relationship: "",
  // nokEmail: "",
  // nokAddress: "",
  // nokPostalCode: "",
  // nokPhoneCode1: "+1",
  // nokPhone1: "",
  // nokPhoneCode2: "+1",
  // nokPhone2: "",
  // loginEmail: "",
  // password: generateRandomPassword(),
  // sendCredentialsToEmail: false,
  // onboardingDocumentsAccess: [],
  // // Employment / RTW / RTR
  // jobRole: "",
  // department: "",
  // lineManager: "",
  // hierarchy: "",
  // employmentType: "",
  // employmentStartDate: "",
  // employmentEndDate: "",
  // probationEndDate: "",
  // salary: "",
  // salaryCurrency: "",
  // workingDays: "",
  // maxWorkingHours: "",
  // rightToWorkStatus: "",
  // passportHolder: "",
  // documentType: "",
  // documentNumber: "",
  // documentExpiryDate: "",
  // shareCode: "",
  // rightToWorkFile: null,
  // rightToWorkFilePreview: "",
  // rightToWorkFileUrl: "",
  // countryOfIssue: "",
  // workRestrictions: "",
  // evidenceRightToRent: "",
  // legalWorkPhoneCode: "+1",
  // legalWorkPhone: "",
  // rightToRentFile: null,
  // rightToRentFilePreview: "",
  // rightToRentFileUrl: "",
  // insuranceType: "",
  // insuranceFile: null,
  // insuranceFilePreview: "",
  // insuranceFileUrl: "",
  // insuranceProviderName: "",
  // insuranceCoverageStartDate: "",
  // insuranceExpiryDate: "",
  // insurancePhoneCode: "+1",
  // insurancePhone: "",
  // // Banking / Education
  // bankName: "",
  // accountNumber: "",
  // accountName: "",
  // accountType: "",
  // institution: "",
  // highestQualification: "",
  // courseOfStudy: "",
  // educationStartYear: "",
  // educationEndYear: "",
  // educationSkills: "",
  // educationCertificate: null,
  // educationCertificatePreview: "",
  // educationCertificateUrl: "",
  // professionalQualification: "",
  // professionalQualificationFile: null,
  // professionalQualificationPreview: "",
  // professionalQualificationUrl: "",
  // idDocument: null,
  // idDocumentPreview: "",
  // idDocumentUrl: "",
  // cvFile: null,
  // cvPreview: "",
  // cvFileUrl: "",
  // // DBS / Proof of Address / References
  // dbsType: "",
  // dbsCertificate: null,
  // dbsCertificatePreview: "",
  // dbsCertificateUrl: "",
  // dbsCertificateNumber: "",
  // dbsIssueDate: "",
  // dbsUpdateService: null,
  // dbsUpdateServicePreview: "",
  // dbsUpdateServiceUrl: "",
  // dbsUpdateCertificateNumber: "",
  // dbsUpdateIssueDate: "",
  // realTimeStatusChecks: false,
  // addressProofType: "",
  // utilityBill: null,
  // utilityBillPreview: "",
  // utilityBillUrl: "",
  // utilityBillDate: "",
  // nin: "",
  // ninFile: null,
  // ninPreview: "",
  // ninFileUrl: "",
  // referee1Name: "",
  // referee1PhoneCode: "+1",
  // referee1Phone: "",
  // referee1Email: "",
  // referee1Relationship: "",
  // referee2Name: "",
  // referee2PhoneCode: "+1",
  // referee2Phone: "",
  // referee2Relationship: "",
  // // Driving / Availability / Permissions
  // drivingStatus: false,
  // vehicleType: "",
  // drivingLicenseFront: null,
  // drivingLicenseFrontPreview: "",
  // drivingLicenseFrontUrl: "",
  // drivingLicenseBack: null,
  // drivingLicenseBackPreview: "",
  // drivingLicenseBackUrl: "",
  // countryOfDrivingLicenseIssue: "",
  // drivingLicenseIssueDate: "",
  // drivingLicenseExpiryDate: "",
  // policyNumber: "",
  // driversLicenseIssuingAuthority: "",
  // driversLicenseInsuranceProvider: "",
  // driversLicenseInsuranceExpiryDate: "",
  // isSyncWithRoster: false,
  // availability: {
  // Am: {
  // Sun: false,
  // Mon: false,
  // Tue: false,
  // Wed: false,
  // Thu: false,
  // Fri: false,
  // Sat: false,
  // },
  // PM: {
  // Sun: false,
  // Mon: false,
  // Tue: false,
  // Wed: false,
  // Thu: false,
  // Fri: false,
  // Sat: false,
  // },
  // Night: {
  // Sun: false,
  // Mon: false,
  // Tue: false,
  // Wed: false,
  // Thu: false,
  // Fri: false,
  // Sat: false,
  // },
  // },
  // accessDuration: false,
  // accessExpiryDate: "",
  // systemAccess: false,
  // systemAccessSelections: [],
  // };
  // setFormData(emptyForm);
  // localStorage.removeItem(LOCAL_STORAGE_KEY);
  // setActiveStep(0);
  // setStepValidity({});
  // setLoginEmailManuallyModified(false);
  // setEmployeeId(null);
  // setOnboardingDocuments([]);
  // // setShowClearFormModal(false);
  // };
  // Validate steps and update stepValidity state
  useEffect(() => {
    const newStepValidity = {};
    for (let i = 0; i < steps.length; i++) {
      newStepValidity[i] = isStepValid(i, formData);
    }
    setStepValidity(newStepValidity);
  }, [formData, activeStep]);
  // Handle step navigation clicks
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
  // Phone number validation (11 digits max)
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length <= 11) {
      updateFormData({ [name]: digitsOnly });
    }
  };
  // Prepare file upload data for current step
  const getFileUploadData = (step) => {
    const fileData = new FormData();
    let hasFiles = false;
    switch (step) {
      case 0: // Personal Info
        if (formData.profilePicture) {
          fileData.append("profile_image", formData.profilePicture);
          hasFiles = true;
        }
        break;
      case 1: // Employment details
        if (formData.rightToWorkFile) {
          fileData.append("Right_to_Work_file", formData.rightToWorkFile);
          hasFiles = true;
        }
        if (formData.rightToRentFile) {
          fileData.append("right_to_rent_document", formData.rightToRentFile);
          hasFiles = true;
        }
        if (formData.insuranceFile) {
          fileData.append("insurance_document", formData.insuranceFile);
          hasFiles = true;
        }
        break;
      case 2: // Education and banking
        if (formData.educationCertificate) {
          fileData.append(
            "education_certificate",
            formData.educationCertificate
          );
          hasFiles = true;
        }
        if (formData.professionalQualificationFile) {
          fileData.append(
            "professional_qualification_file",
            formData.professionalQualificationFile
          );
          hasFiles = true;
        }
        if (formData.idDocument) {
          fileData.append("government_id_document", formData.idDocument);
          hasFiles = true;
        }
        if (formData.cvFile) {
          fileData.append("cv_file", formData.cvFile);
          hasFiles = true;
        }
        break;
      case 3: // DBS and references
        if (formData.dbsCertificate) {
          fileData.append("dbs_certificate", formData.dbsCertificate);
          hasFiles = true;
        }
        if (formData.dbsUpdateService) {
          fileData.append("dbs_update_service", formData.dbsUpdateService);
          hasFiles = true;
        }
        if (formData.utilityBill) {
          fileData.append("utility_bill", formData.utilityBill);
          hasFiles = true;
        }
        if (formData.ninFile) {
          fileData.append("nin_document", formData.ninFile);
          hasFiles = true;
        }
        break;
      case 4: // Driving status
        if (formData.drivingLicenseFront) {
          fileData.append(
            "driving_license_front",
            formData.drivingLicenseFront
          );
          hasFiles = true;
        }
        if (formData.drivingLicenseBack) {
          fileData.append("driving_license_back", formData.drivingLicenseBack);
          hasFiles = true;
        }
        break;
      default:
        break;
    }
    return { fileData, hasFiles };
  };
  // API submission function
  const submitFormData = async () => {
    setIsSubmitting(true);
    const hasApplicantId = !!applicantId;
    const getDocumentValue = (fileField, urlField) => {
      if (formData[fileField]) {
        return formData[fileField];
      }
      if (hasApplicantId && formData[urlField]) {
        return formData[urlField];
      }
      return null;
    };
    try {
      if (!employeeId && activeStep === 0) {
        // Step 0: Create employee with personal information only (no files)
        const nonFilePayload = {
          username:
            formData.loginEmail ||
            `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`,
          email: formData.workEmail || "user@example.com",
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role || "staff",
          is_superuser: false,
          last_password_reset: new Date().toISOString(),
          profile: {
            work_phone: formData.workPhoneCode + formData.workPhone,
            personal_phone: formData.personalPhoneCode + formData.personalPhone,
            gender: formData.gender,
            dob: formData.dob,
            street: formData.address,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            zip_code: formData.postalCode,
            marital_status: formData.maritalStatus,
            next_of_kin: formData.nextOfKin,
            next_of_kin_address: formData.nokAddress,
            next_of_kin_phone_number:
              formData.nokPhoneCode1 + formData.nokPhone1,
            next_of_kin_alternate_phone:
              formData.nokPhoneCode2 + formData.nokPhone2,
            relationship_to_next_of_kin: formData.relationship,
            next_of_kin_email: formData.nokEmail,
            next_of_kin_zip_code: formData.nokPostalCode,
            send_credentials_to_email: formData.sendCredentialsToEmail,
          },
          modules: [],
          permission_levels: [],
        };
        const createdEmployee = await createEmployee(nonFilePayload);
        const userId = createdEmployee.id;
        setEmployeeId(userId);

        // Auto-assign employee to cluster (non-blocking)
        const assignPayload = {
          carerId: userId,
          postcode: formData.postalCode,
          address: formData.address,
        };
        autoAssignCarerToCluster(assignPayload).catch((error) => {
          console.error("Auto-assign failed:", error);
        });
        // Update job application status if applicantId exists
        if (applicantId) {
          try {
            await updateJobApplicationStatus(applicantId, {
              status: "onboarded",
              job_requisition_id: applicant.job_requisition_id,
              email: applicant.email,
            });
          } catch (error) {
            throw new Error(
              `Failed to update applicant status: ${
                error.message || "Unknown error"
              }`
            );
          }
        }
        // If profilePicture exists, immediately update with the file
        if (formData.profilePicture) {
          const updatePayload = {
            profile: {
              profile_image: formData.profilePicture,
            },
          };
          await updateEmployee(userId, updatePayload);
        }
        setModalType("success");
        setModalTitle("Employee Created Successfully");
        setModalMessage(
          `${formData.firstName} ${formData.lastName}'s profile has been created and is being assigned to a cluster. Proceed to the next step to add more details.`
        );
        setShowStatusModal(true);
      } else if (employeeId) {
        // Update employee for current step, including relevant files
        let updatePayload = {
          username:
            formData.loginEmail ||
            `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`,
          email: formData.workEmail || "user@example.com",
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role || "staff",
          is_superuser: false,
          last_password_reset: new Date().toISOString(),
          profile: {},
          professional_qualifications: [],
          employment_details: [],
          education_details: [],
          reference_checks: [],
          proof_of_address: [],
          insurance_verifications: [],
          driving_risk_assessments: [],
          legal_work_eligibilities: [],
          other_user_documents: [],
          permission_levels: [],
          modules: [],
        };
        // Step-specific updates
        switch (activeStep) {
          case 0: // Personal Information
            updatePayload.profile = {
              work_phone: formData.workPhoneCode + formData.workPhone,
              personal_phone:
                formData.personalPhoneCode + formData.personalPhone,
              gender: formData.gender,
              dob: formData.dob,
              street: formData.address,
              country: formData.country,
              state: formData.state,
              city: formData.city,
              zip_code: formData.postalCode,
              marital_status: formData.maritalStatus,
              next_of_kin: formData.nextOfKin,
              next_of_kin_address: formData.nokAddress,
              next_of_kin_phone_number:
                formData.nokPhoneCode1 + formData.nokPhone1,
              next_of_kin_alternate_phone:
                formData.nokPhoneCode2 + formData.nokPhone2,
              relationship_to_next_of_kin: formData.relationship,
              next_of_kin_email: formData.nokEmail,
              next_of_kin_zip_code: formData.nokPostalCode,
              send_credentials_to_email: formData.sendCredentialsToEmail,
              profile_image: formData.profilePicture,
              profile_image_url: formData.profilePictureUrl || "",
            };
            break;
          case 1: // Employment Details, Right to Work & Work Eligibility
            updatePayload.profile = {
              department: formData.department,
              Right_to_Work_status: formData.rightToWorkStatus,
              Right_to_Work_passport_holder: formData.passportHolder,
              Right_to_Work_document_type: formData.rightToWorkDocumentType,
              Right_to_Work_share_code: formData.shareCode,
              Right_to_Work_document_number: formData.rightToWorkDocumentNumber,
              Right_to_Work_document_expiry_date:
                formData.rightToWorkDocumentExpiryDate,
              Right_to_Work_country_of_issue: formData.countryOfIssue,
              Right_to_Work_restrictions: formData.workRestrictions,
              Right_to_Work_file: formData.rightToWorkFile,
              Right_to_Work_file_url: formData.rightToWorkFileUrl || "",
            };
            updatePayload.employment_details = [
              {
                job_role: formData.jobRole,
                hierarchy: formData.hierarchy,
                department: formData.department,
                work_email: formData.workEmail,
                employment_type: formData.employmentType,
                employment_start_date: formData.employmentStartDate,
                employment_end_date:
                  formData.employmentEndDate === ""
                    ? null
                    : formData.employmentEndDate,
                probation_end_date:
                  formData.probationEndDate === ""
                    ? null
                    : formData.probationEndDate,
                line_manager: formData.lineManager,
                currency: formData.salaryCurrency,
                salary: formData.salary,
                working_days: formData.workingDays,
                maximum_working_hours: parseInt(formData.maxWorkingHours) || 0,
              },
            ];
            updatePayload.insurance_verifications = formData.insuranceType
              ? [
                  {
                    insurance_type: formData.insuranceType
                      .toLowerCase()
                      .replace(" ", "_"),
                    provider_name: formData.insuranceProviderName,
                    coverage_start_date: formData.insuranceCoverageStartDate,
                    expiry_date: formData.insuranceExpiryDate,
                    phone_number:
                      formData.insurancePhoneCode + formData.insurancePhone,
                    document: formData.insuranceFile,
                    uploaded_at: new Date().toISOString(),
                  },
                ]
              : [];
            updatePayload.legal_work_eligibilities = formData.rightToRentFile
              ? [
                  {
                    evidence_of_right_to_rent: formData.evidenceRightToRent
                      ? true
                      : false,
                    expiry_date: formData.rightToWorkDocumentExpiryDate,
                    phone_number:
                      formData.legalWorkPhoneCode + formData.legalWorkPhone,
                    document: formData.rightToRentFile,
                    uploaded_at: new Date().toISOString(),
                  },
                ]
              : [];
            break;
          case 2: // Education Qualifications and Bank Details
            updatePayload.profile = {
              bank_name: formData.bankName,
              account_number: formData.accountNumber,
              account_name: formData.accountName,
              account_type: formData.accountType,
            };
            updatePayload.education_details = [
              {
                institution: formData.institution,
                highest_qualification: formData.highestQualification,
                course_of_study: formData.courseOfStudy,
                start_year_new: formData.educationStartYear || "",
                end_year_new: formData.educationEndYear || "",
                skills: formData.educationSkills,
                certificate: formData.educationCertificate,
                certificateUrl: formData.educationCertificateUrl || "",
                uploaded_at: new Date().toISOString(),
              },
            ];
            updatePayload.professional_qualifications =
              formData.professionalQualification
                ? [
                    {
                      name: formData.professionalQualification,
                      image_file: formData.professionalQualificationFile,
                      image_file_url:
                        formData.professionalQualificationUrl || "",
                    },
                  ]
                : [];
            // updatePayload.other_user_documents = [];
            // const idDocValue = getDocumentValue("idDocument", "idDocumentUrl");
            // if (idDocValue) {
            // updatePayload.other_user_documents.push({
            // title: formData.governmentIdType,
            // file: idDocValue,
            // });
            // }
            // const cvDocValue = getDocumentValue("cvFile", "cvFileUrl");
            // if (cvDocValue) {
            // updatePayload.other_user_documents.push({
            // title: "Curriculum Vitae (CV)",
            // file: cvDocValue,
            // });
            // }
            break;
          case 3: // DBS Verification, Proof of Address & References
            updatePayload.profile = {
              dbs_type: formData.dbsType,
              dbs_certificate_number: formData.dbsCertificateNumber,
              dbs_issue_date: formData.dbsIssueDate,
              dbs_update_certificate_number:
                formData.dbsUpdateCertificateNumber,
              dbs_update_issue_date: formData.dbsUpdateIssueDate,
              dbs_status_check: formData.realTimeStatusChecks,
              dbs_certificate: formData.dbsCertificate,
              dbs_certificate_url: formData.dbsCertificateUrl || "",
              dbs_update_file: formData.dbsUpdateService,
              dbs_update_file_url: formData.dbsUpdateServiceUrl || "",
            };
            const hasProofDoc =
              getDocumentValue("utilityBill", "utilityBillUrl") ||
              getDocumentValue("ninFile", "ninFileUrl");
            updatePayload.proof_of_address = hasProofDoc
              ? [
                  {
                    type: formData.addressProofType,
                    issue_date: formData.utilityBillDate,
                    nin: formData.nin,
                    document: formData.utilityBill,
                    document_url: formData.utilityBillUrl || "",
                    nin_document: formData.ninFile,
                    nin_document_url: formData.ninFileUrl || "",
                    uploaded_at: new Date().toISOString(),
                  },
                ]
              : [];
            updatePayload.reference_checks = [
              {
                name: formData.referee1Name,
                phone_number:
                  formData.referee1PhoneCode + formData.referee1Phone,
                email: formData.referee1Email,
                relationship_to_applicant: formData.referee1Relationship,
              },
              {
                name: formData.referee2Name,
                phone_number:
                  formData.referee2PhoneCode + formData.referee2Phone,
                email: formData.referee2Email,
                relationship_to_applicant: formData.referee2Relationship,
              },
            ];
            break;
          case 4: // Driving Status, Availability & Permissions
            updatePayload.profile = {
              is_driver: formData.drivingStatus,
              type_of_vehicle: formData.vehicleType,
              drivers_licence_country_of_issue:
                formData.countryOfDrivingLicenseIssue,

              drivers_licence_date_issue:
                formData.drivingLicenseIssueDate === ""
                  ? null
                  : formData.drivingLicenseIssueDate,

              drivers_licence_expiry_date:
                formData.drivingLicenseExpiryDate === ""
                  ? null
                  : formData.drivingLicenseExpiryDate,

              drivers_licence_policy_number: formData.policyNumber,
              drivers_licence_issuing_authority:
                formData.driversLicenseIssuingAuthority,
              drivers_licence_insurance_provider:
                formData.driversLicenseInsuranceProvider,

              drivers_licence_insurance_expiry_date:
                formData.driversLicenseInsuranceExpiryDate === ""
                  ? null
                  : driversLicenseInsuranceExpiryDate,

              system_access_rostering:
                formData.systemAccessSelections.includes("rostering"),
              system_access_hr: formData.systemAccessSelections.includes("hr"),
              system_access_recruitment:
                formData.systemAccessSelections.includes("recruitment"),
              system_access_training:
                formData.systemAccessSelections.includes("training"),
              system_access_finance:
                formData.systemAccessSelections.includes("finance"),
              system_access_compliance:
                formData.systemAccessSelections.includes("compliance"),
              system_access_co_superadmin:
                formData.systemAccessSelections.includes("co-admin"),
              system_access_asset_management:
                formData.systemAccessSelections.includes("asset_management"),
              drivers_licence_image1: formData.drivingLicenseFront,
              drivers_licence_image1_url: formData.drivingLicenseFrontUrl || "",
              drivers_licence_image2: formData.drivingLicenseBack,
              drivers_licence_image2_url: formData.drivingLicenseBackUrl || "",
            };
            updatePayload.driving_risk_assessments = formData.drivingStatus
              ? [
                  {
                    assessment_date: new Date().toISOString().split("T")[0],
                    fuel_card_usage_compliance: true,
                    road_traffic_compliance: true,
                    tracker_usage_compliance: true,
                    maintenance_schedule_compliance: true,
                    additional_notes: "",
                    uploaded_at: new Date().toISOString(),
                  },
                ]
              : [];
            break;
          case 5: // Onboarding Documents
            // Grant access to selected onboarding documents
            const selectedDocs = formData.onboardingDocumentsAccess || [];
            for (const docId of selectedDocs) {
              try {
                const docDetails = await fetchDocumentDetails(docId);
                const currentPerms = docDetails.permissions || [];
                const existingPermForUser = currentPerms.find(
                  (p) => parseInt(p.user_id) === employeeId
                );
                if (!existingPermForUser) {
                  const payload = {
                    permissions_write: [
                      {
                        user_id: employeeId.toString(),
                        permission_level: "view_download",
                      },
                    ],
                    permission_action: "replace",
                  };
                  await updateDocumentPermissions(docId, payload);
                }
              } catch (err) {
                console.error(`Failed to grant access to doc ${docId}:`, err);
              }
            }
            break;
          default:
            break;
        }
        // Only call update if there are changes (files or non-file fields)
        const hasUpdates =
          Object.values(updatePayload.profile).some(
            (value) =>
              (value instanceof File || typeof value === "string") &&
              value !== null &&
              value !== "" &&
              value !== undefined
          ) ||
          Object.values(updatePayload).some(
            (value) =>
              Array.isArray(value) &&
              value.some((item) =>
                Object.values(item).some(
                  (v) =>
                    (v instanceof File || typeof v === "string") &&
                    v !== null &&
                    v !== "" &&
                    v !== undefined
                )
              )
          );
        if (hasUpdates) {
          await updateEmployee(employeeId, updatePayload);
        }
        setModalType("success");
        setModalTitle(
          activeStep === steps.length - 1
            ? "Employee Profile Completed"
            : "Employee Updated Successfully"
        );
        setModalMessage(
          activeStep === steps.length - 1
            ? `${formData.firstName} ${formData.lastName}'s profile has been fully updated.`
            : `${formData.firstName} ${formData.lastName}'s information has been updated. Proceed to the next step.`
        );
        setShowStatusModal(true);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        "There was an error submitting the form. Please try again.";
      setModalType("error");
      setModalTitle(employeeId ? "Update Failed" : "Creation Failed");
      setModalMessage(errorMessage);
      setShowStatusModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddAnother = () => {
    setShowStatusModal(false);
    setActiveStep(0);
    formTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const handleViewList = () => {
    setShowStatusModal(false);
    navigate(isHRApp ? "/company/hr/employees" : "/company/employees");
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
  const isStepValid = (step, data) => {
    const required = stepValidations[step] || [];
    return required.every((field) => {
      const value = data[field];
      return value !== null && value !== "" && value !== false;
    });
  };
  const getMissingFields = (step, data) => {
    const required = stepValidations[step] || [];
    return required.filter((field) => {
      const value = data[field];
      return value === null || value === "" || value === false;
    });
  };
  const getMissingFieldLabels = (step, data) =>
    getMissingFields(step, data).map((field) => fieldLabels[field] || field);
  const handleButtonClick = () => {
    if (!isStepValid(activeStep, formData)) {
      const missingLabels = getMissingFieldLabels(activeStep, formData);
      setMissingFields(missingLabels);
      setShowMissingFieldsModal(true);
      return;
    }
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
      return employeeId ? "Updating..." : "Creating...";
    }
    if (activeStep === 0) {
      return employeeId ? "Update Personal Info" : "Create Employee";
    } else if (activeStep === steps.length - 1) {
      return "Complete Employee Profile";
    } else {
      return employeeId ? "Update and Continue" : "Continue";
    }
  };
  // File handlers
  const createFileHandler = useCallback(
    (fieldName, previewFieldName = null) => {
      return async (file) => {
        const updates = { [fieldName]: file };
        if (previewFieldName) {
          if (formData[previewFieldName]?.startsWith?.("blob:")) {
            URL.revokeObjectURL(formData[previewFieldName]);
          }
          const previewUrl = URL.createObjectURL(file);
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
  const handleRightToWorkChange = createFileHandler(
    "rightToWorkFile",
    "rightToWorkFilePreview"
  );
  const removeRightToWork = createFileRemover(
    "rightToWorkFile",
    "rightToWorkFilePreview",
    rightToWorkFileRef
  );
  const handleRightToRentFileChange = createFileHandler(
    "rightToRentFile",
    "rightToRentFilePreview"
  );
  const removeRightToRentFile = createFileRemover(
    "rightToRentFile",
    "rightToRentFilePreview",
    rightToRentFileRef
  );
  const handleInsuranceFileChange = createFileHandler(
    "insuranceFile",
    "insuranceFilePreview"
  );
  const removeInsuranceFile = createFileRemover(
    "insuranceFile",
    "insuranceFilePreview",
    insuranceFileRef
  );
  const handleEducationCertificateChange = createFileHandler(
    "educationCertificate",
    "educationCertificatePreview"
  );
  const removeEducationCertificate = createFileRemover(
    "educationCertificate",
    "educationCertificatePreview",
    educationCertificateRef
  );
  const handleProfessionalQualificationChange = createFileHandler(
    "professionalQualificationFile",
    "professionalQualificationPreview"
  );
  const removeProfessionalQualification = createFileRemover(
    "professionalQualificationFile",
    "professionalQualificationPreview",
    professionalQualificationRef
  );
  const handleIdDocumentChange = createFileHandler(
    "idDocument",
    "idDocumentPreview"
  );
  const removeIdDocument = createFileRemover(
    "idDocument",
    "idDocumentPreview",
    idDocumentRef
  );
  const handleDbsCertificateChange = createFileHandler(
    "dbsCertificate",
    "dbsCertificatePreview"
  );
  const removeDbsCertificate = createFileRemover(
    "dbsCertificate",
    "dbsCertificatePreview",
    dbsCertificateRef
  );
  const handleDbsUpdateServiceChange = createFileHandler(
    "dbsUpdateService",
    "dbsUpdateServicePreview"
  );
  const removeDbsUpdateService = createFileRemover(
    "dbsUpdateService",
    "dbsUpdateServicePreview",
    dbsUpdateServiceRef
  );
  const handleUtilityBillUpload = createFileHandler(
    "utilityBill",
    "utilityBillPreview"
  );
  const removeUtilityBill = createFileRemover(
    "utilityBill",
    "utilityBillPreview",
    utilityBillRef
  );
  const handleNinUpload = createFileHandler("ninFile", "ninPreview");
  const removeNin = createFileRemover("ninFile", "ninPreview", ninRef);
  const handleDrivingLicenseFrontChange = createFileHandler(
    "drivingLicenseFront",
    "drivingLicenseFrontPreview"
  );
  const removeDrivingLicenseFront = createFileRemover(
    "drivingLicenseFront",
    "drivingLicenseFrontPreview",
    drivingLicenseFrontRef
  );
  const handleDrivingLicenseBackChange = createFileHandler(
    "drivingLicenseBack",
    "drivingLicenseBackPreview"
  );
  const removeDrivingLicenseBack = createFileRemover(
    "drivingLicenseBack",
    "drivingLicenseBackPreview",
    drivingLicenseBackRef
  );
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "loginEmail" && !loginEmailManuallyModified) {
      setLoginEmailManuallyModified(true);
    }
    if (type === "checkbox") {
      updateFormData({ [name]: checked });
    } else {
      updateFormData({ [name]: value });
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
          <EmploymentDetailsStep
            formData={formData}
            handleChange={handleChange}
            handleRightToWorkFileChange={handleRightToWorkChange}
            removeRightToWorkFile={removeRightToWork}
            rightToWorkFileRef={rightToWorkFileRef}
            handleRightToRentFileChange={handleRightToRentFileChange}
            removeRightToRentFile={removeRightToRentFile}
            rightToRentFileRef={rightToRentFileRef}
            handleInsuranceFileChange={handleInsuranceFileChange}
            removeInsuranceFile={removeInsuranceFile}
            insuranceFileRef={insuranceFileRef}
            handlePhoneChange={handlePhoneChange}
          />
        );
      case 2:
        return (
          <EducationDetailsStep
            formData={formData}
            handleChange={handleChange}
            handleEducationCertificateChange={handleEducationCertificateChange}
            removeEducationCertificate={removeEducationCertificate}
            educationCertificateRef={educationCertificateRef}
            handleProfessionalQualificationChange={
              handleProfessionalQualificationChange
            }
            removeProfessionalQualification={removeProfessionalQualification}
            professionalQualificationRef={professionalQualificationRef}
            handleIdDocumentChange={handleIdDocumentChange}
            removeIdDocument={removeIdDocument}
            idDocumentRef={idDocumentRef}
          />
        );
      case 3:
        return (
          <DBSVerificationDetailsStep
            formData={formData}
            handleChange={handleChange}
            handleDbsCertificateChange={handleDbsCertificateChange}
            removeDbsCertificate={removeDbsCertificate}
            dbsCertificateRef={dbsCertificateRef}
            handleDbsUpdateServiceChange={handleDbsUpdateServiceChange}
            removeDbsUpdateService={removeDbsUpdateService}
            dbsUpdateServiceRef={dbsUpdateServiceRef}
            handleUtilityBillUpload={handleUtilityBillUpload}
            removeUtilityBill={removeUtilityBill}
            utilityBillRef={utilityBillRef}
            handleNinUpload={handleNinUpload}
            removeNin={removeNin}
            ninRef={ninRef}
          />
        );
      case 4:
        return (
          <DrivingStatusDetailsStep
            formData={formData}
            handleChange={handleChange}
            handleDrivingLicenseFrontChange={handleDrivingLicenseFrontChange}
            drivingLicenseFrontRef={drivingLicenseFrontRef}
            removeDrivingLicenseFront={removeDrivingLicenseFront}
            handleDrivingLicenseBackChange={handleDrivingLicenseBackChange}
            drivingLicenseBackRef={drivingLicenseBackRef}
            removeDrivingLicenseBack={removeDrivingLicenseBack}
          />
        );
      case 5:
        return (
          <OnboardingDocumentsStep
            formData={formData}
            handleChange={handleChange}
            onboardingDocuments={onboardingDocuments}
            setOnboardingAccess={(ids) =>
              updateFormData({ onboardingDocumentsAccess: ids })
            }
          />
        );
      default:
        return null;
    }
  };
  useEffect(() => {
    if (!loginEmailManuallyModified && formData.workEmail) {
      const usernameFromEmail = formData.workEmail.split("@")[0];
      updateFormData({ loginEmail: usernameFromEmail });
    }
  }, [formData.workEmail, loginEmailManuallyModified]);
  const formContent = (
    <form className="create-employee" onSubmit={(e) => e.preventDefault()}>
      <div
        className="form-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <IoIosArrowRoundBack onClick={() => navigate(-1)} />
          <div>
            <h2>
              {applicantId && employeeId
                ? "Continue Employee Update"
                : applicantId
                ? "Convert Applicant to Employee"
                : employeeId
                ? "Update Employee"
                : "Create New Employee"}
            </h2>
            <p>
              {applicantId && employeeId
                ? "Continue updating the employee's details in the system."
                : applicantId
                ? "Convert the applicant's profile to an employee in the system."
                : employeeId
                ? "Update the employee's details in the system."
                : "Fill in the employee's details to add them to the company roster."}
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
          {/* <button
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
        </button> */}
        </div>
      </div>
      <HorizontalLinearAlternativeLabelStepper
        steps={steps}
        activeStep={activeStep}
        stepValidity={stepValidity}
        onStepClick={handleStepClick}
      />
      <div className="form-body">
        <div className="form-left">
          {renderStepForm()}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleBack}>
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
  );
  return !isHRApp ? (
    <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container" ref={formTopRef}>
          {formContent}
        </div>
      </div>
      <BulkUploadEmployees
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSuccess={handleBulkUploadSuccess}
        onError={handleBulkUploadError}
      />
      {/* Missing Fields Modal */}
      <MissingFieldsModal
        isOpen={showMissingFieldsModal}
        onClose={() => setShowMissingFieldsModal(false)}
        missingFields={missingFields}
      />
      {/* Clear Form Modal */}
      {/* <ClearFormModal
        isOpen={showClearFormModal}
        onClose={() => setShowClearFormModal(false)}
        onConfirm={clearForm}
      /> */}
      {/* Success or Error Modal */}
      <SuccessOrErrorModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          if (modalType === "success" && activeStep === steps.length - 1) {
            // Clear form only after final success
            // clearForm();
          }
        }}
        name={`Employee`}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onAddAnother={handleAddAnother}
        onViewList={handleViewList}
        isFinalStep={activeStep === steps.length - 1}
        onContinue={() => {
          setShowStatusModal(false);
          if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
          }
        }}
      />
    </div>
  ) : (
    <>
      <div className="DB-Envt-Container" ref={formTopRef}>
        {formContent}
      </div>
      <BulkUploadEmployees
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSuccess={handleBulkUploadSuccess}
        onError={handleBulkUploadError}
      />
      {/* Missing Fields Modal */}
      <MissingFieldsModal
        isOpen={showMissingFieldsModal}
        onClose={() => setShowMissingFieldsModal(false)}
        missingFields={missingFields}
      />
      {/* Clear Form Modal */}
      {/* <ClearFormModal
        isOpen={showClearFormModal}
        onClose={() => setShowClearFormModal(false)}
        onConfirm={clearForm}
      /> */}
      {/* Success or Error Modal */}
      <SuccessOrErrorModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          if (modalType === "success" && activeStep === steps.length - 1) {
            // Clear form only after final success
            // clearForm();
          }
        }}
        name={`Employee`}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onAddAnother={handleAddAnother}
        onViewList={handleViewList}
        isFinalStep={activeStep === steps.length - 1}
        onContinue={() => {
          setShowStatusModal(false);
          if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1);
          }
        }}
      />
    </>
  );
}
