import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EmployeeDetailsPage.css";
import {
  fetchSingleEmployee,
  updateEmployee,
  createEmploymentDetails,
  updateEmploymentDetails,
  createProfessionalQualification,
  updateProfessionalQualification,
  createEducationDetails,
  updateEducationDetails,
  createReferenceChecks,
  updateReferenceChecks,
  createProofOfAddress,
  updateProofOfAddress,
  createInsuranceVerifications,
  updateInsuranceVerifications,
  createDrivingRiskAssessments,
  updateDrivingRiskAssessments,
  createLegalWorkEligibilities,
  updateLegalWorkEligibilities,
  createOtherUserDocuments,
  updateOtherUserDocuments,
  createSkillDetail,
  updateSkillDetail,
} from "../config/apiService";
import { apiClient } from "../../../../config";
import SideNavBar from "../../Home/SideNavBar";
import { FiArrowLeft, FiCamera, FiX } from "react-icons/fi";
import StatusBadge from "../../../../components/StatusBadge";
import ToastNotification from "../../../../components/ToastNotification";
import { PencilIcon } from "../../../../assets/icons/PencilIcon";
import { DangerWarningIcon } from "../../../../assets/icons/DangerWarningIcon";
import { IoMdClose } from "react-icons/io";
import BasicInformationStep from "./steps/BasicInformationStep";
import EmploymentDetailsStep from "./steps/EmploymentDetailsStep";
import EducationDetailsStep from "./steps/EducationDetailsStep";
import LegalWorkEligibilityStep from "./steps/LegalWorkEligibilityStep";
import InsuranceVerificationStep from "./steps/InsuranceVerificationStep";
import ProfessionalQualificationsStep from "./steps/ProfessionalQualificationsStep";
import SkillsStep from "./steps/SkillsStep";
import IDAndDocumentsStep from "./steps/IDAndDocumentsStep";
import BankDetailsStep from "./steps/BankDetailsStep";
import ProofOfAddressStep from "./steps/ProofOfAddressStep";
import DrivingLicenseAndDBSStep from "./steps/DrivingLicenseAndDBSStep";
import PermissionsStep from "./steps/PermissionsStep";
import ReferenceChecksStep from "./steps/ReferenceChecksStep";
import LoadingState from "../../../../components/LoadingState";
import AvailabilityStep from "./steps/AvailabilityStep";

// Reusable ProfilePhotoEditor Component
const ProfilePhotoEditor = ({
  imageUrl,
  previewUrl,
  isRemoved,
  initials,
  isEditing,
  onUpload,
  onRemove,
}) => {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onUpload(file, preview);
    }
    e.target.value = "";
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    onRemove();
  };

  const effectiveImageUrl =
    previewUrl || (imageUrl && !isRemoved) ? previewUrl || imageUrl : null;

  return (
    <div className="profile-photo-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      {!isEditing ? (
        effectiveImageUrl ? (
          <img
            src={effectiveImageUrl}
            alt="Profile Photo"
            className="profile-photo"
          />
        ) : (
          <div className="profile-avatar">{initials}</div>
        )
      ) : (
        <div className="editable-photo" onClick={handleUploadClick}>
          {effectiveImageUrl ? (
            <>
              <img
                src={effectiveImageUrl}
                alt="Profile Photo"
                className="profile-photo"
              />
              <button className="remove-btn" onClick={handleRemoveClick}>
                <FiX size={16} />
              </button>
            </>
          ) : (
            <div className="upload-photo-area">
              <FiCamera size={24} className="camera-icon" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EmployeeDetailsPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [shrinkNav, setShrinkNav] = useState(false);
  const [selectedSection, setSelectedSection] = useState("Basic Information");
  const [isEditing, setIsEditing] = useState({
    profile: false,
    personal: false,
    nextOfKin: false,
    loginCredentials: false,
    employment: false,
    legal: false,
    insurance: false,
    education: false,
    professionalQualifications: false,
    idAndDocuments: false,
    bank: false,
    proofOfAddress: false,
    drivingLicenseAndDBS: false,
    permissions: false,
    referenceChecks: false,
    skills: false,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [modifiedFields, setModifiedFields] = useState({
    employmentDetails: {}, // { index: Set(fieldNames) }
    educationDetails: {},
    referenceChecks: {},
    professionalQualifications: {},
    insuranceVerifications: {},
    legalVerifications: {},
    idAndDocuments: {},
    proofOfAddress: {},
    skills: {},
  });

  // Profile photo states
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profilePhotoRemoved, setProfilePhotoRemoved] = useState(false);

  const insuranceFileRef = useRef([]);
  const educationCertificateRef = useRef([]);
  const professionalQualificationCertificateRef = useRef([]);
  const idAndDocumentsFileRef = useRef(null);
  const utilityBillRef = useRef(null);
  const ninRef = useRef(null);
  const drivingLicenseFrontRef = useRef(null);
  const drivingLicenseBackRef = useRef(null);
  const dbsCertificateRef = useRef(null);
  const dbsUpdateServiceRef = useRef(null);
  const rightToWorkFileRef = useRef(null);
  const rightToRentFileRef = useRef([]);

  const isHRApp = window.location.pathname.includes("hr");
  const isProfileView = window.location.pathname.includes("profile");
  const isCompanyView = window.location.pathname.includes("company");
  const title = isProfileView ? "My Profile" : "Employee Details";

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin =
    currentUser.role === "admin" ||
    currentUser.role === "co-admin" ||
    currentUser.role === "root-admin";

  const idToUse = isProfileView
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : employeeId;

  const isOwnProfile = idToUse === currentUser.id;

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await fetchSingleEmployee(idToUse);
        setEmployee(data);
        setProfileCompletion(data.profile_completion_percentage || 0);
        setProfilePhotoPreview(data.profile?.profile_image_url || null);
        setProfilePhotoRemoved(false);
        setProfilePhotoFile(null);
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          role: data.role || "",
          email: data.email || "",
          workPhone: data.profile?.work_phone || "",
          personalPhone: data.profile?.personal_phone || "",
          maritalStatus: data.profile?.marital_status || "",
          address: data.profile?.street || "",
          country: data?.profile?.country || "",
          city: data.profile?.city || "",
          state: data.profile?.state || "",
          postCode: data.profile?.zip_code || "",
          nextOfKin: {
            name: data.profile?.next_of_kin || "",
            email: data.profile?.next_of_kin_email || "",
            phone: data.profile?.next_of_kin_phone_number || "",
            altPhone: data.profile?.next_of_kin_alternate_phone || "",
            address: data.profile?.next_of_kin_address || "",
            town: data.profile?.next_of_kin_town || "",
            postCode: data.profile?.next_of_kin_zip_code || "",
            relationship: data.profile?.relationship_to_next_of_kin || "",
          },
          loginCredentials: {
            username: data.username || "",
            password: data.password || "",
          },
          jobRole: data.job_role || "",
          lastUpdatedBy: data.profile?.last_updated_by || null,
          employmentDetails:
            data.profile?.employment_details?.map((emp) => ({
              id: emp.id,
              jobRole: emp.job_role || "",
              hierarchy: emp.hierarchy || "",
              department: emp.department || "",
              workEmail: emp.work_email || "",
              employmentType: emp.employment_type || "",
              employmentStartDate: emp.employment_start_date || "",
              employmentEndDate: emp.employment_end_date || "",
              probationEndDate: emp.probation_end_date || "",
              lineManager: emp.line_manager || "",
              currency: emp.currency || "",
              salary: emp.salary || "",
              salaryRate: emp.salary_rate || "",
              workingDays: emp.working_days || "",
              maxWorkingHours: emp.maximum_working_hours || "",
              lastUpdatedBy: emp.last_updated_by || null,
            })) || [],
          legalVerifications: [
            {
              id: null,
              type: "right_to_work",
              rightToWorkStatus: data.profile?.Right_to_Work_status || "",
              passportHolder: data.profile?.Right_to_Work_passport_holder || "",
              rightToWorkDocumentType:
                data.profile?.Right_to_Work_document_type || "",
              rightToWorkDocumentNumber:
                data.profile?.Right_to_Work_document_number || "",
              rightToWorkDocumentExpiryDate:
                data.profile?.Right_to_Work_document_expiry_date || "",
              shareCode: data.profile?.Right_to_Work_share_code || "",
              rightToWorkFile: data.profile?.Right_to_Work_file || null,
              rightToWorkFileUrl: data.profile?.Right_to_Work_file_url || "",
              rightToWorkFilePreview:
                data.profile?.Right_to_Work_file_url || null,
              countryOfIssue:
                data.profile?.Right_to_Work_country_of_issue || "",
              workRestrictions: data.profile?.Right_to_Work_restrictions || "",
            },
            ...(data.profile?.legal_work_eligibilities?.map((legal) => ({
              id: legal.id,
              type: "right_to_rent",
              evidenceRightToRent: legal.evidence_of_right_to_rent || false,
              rightToRentFile: legal.document || null,
              rightToRentFileUrl: legal.document || "",
              rightToRentFilePreview: legal.document || null,
              legalWorkPhone: legal.phone_number?.slice(3) || "",
            })) || []),
          ],
          insuranceVerifications:
            data.profile?.insurance_verifications?.map((ins) => ({
              id: ins.id,
              insuranceType: ins.insurance_type || "",
              insuranceProviderName: ins.provider_name || "",
              insuranceExpiryDate: ins.expiry_date || "",
              insuranceCoverageStartDate: ins.coverage_start_date || "",
              insuranceFile: ins.document || null,
              insuranceFileUrl: ins.document || "",
              insuranceFilePreview: ins.document || null,
              insurancePhone: ins.phone_number?.slice(3) || "",
            })) || [],
          educationDetails:
            data.profile?.education_details?.map((edu) => ({
              id: edu.id,
              institution: edu.institution || "",
              highestQualification: edu.highest_qualification || "",
              courseOfStudy: edu.course_of_study || "",
              startYear: edu.start_year_new || "",
              endYear: edu.end_year_new || "",
              skills: edu.skills || "",
              certificate: edu.certificate || null,
              certificateUrl: edu.certificate || "",
              certificatePreview: edu.certificate || null,
            })) || [],
          referenceChecks: data.profile?.reference_checks?.map((ref) => ({
            id: ref.id,
            name: ref.name || "",
            phoneNumber: ref.phone_number || "",
            email: ref.email || "",
            relationship: ref.relationship_to_applicant || "",
          })) || [
            {
              id: null,
              name: "",
              phoneNumber: "",
              email: "",
              relationship: "",
            },
            {
              id: null,
              name: "",
              phoneNumber: "",
              email: "",
              relationship: "",
            },
          ],
          professionalQualifications:
            data.profile?.professional_qualifications?.map((qual) => ({
              id: qual.id,
              name: qual.name || "",
              organization: qual.organization || "",
              issueYear: qual.issue_year || "",
              certificate: qual.image_file || null,
              certificateUrl: qual.image_file || "",
              certificatePreview: qual.image_file || null,
            })) || [],
          idAndDocuments:
            data.profile?.other_user_documents?.map((doc) => ({
              id: doc.id,
              governmentIdType: doc.title || "Drivers Licence",
              documentNumber: doc.document_number || "",
              documentExpiryDate: doc.expiry_date || "",
              idAndDocumentsFile: doc.file || null,
              idAndDocumentsFileUrl: doc.file || "",
              idAndDocumentsFilePreview: doc.file || null,
            })) || [],
          proofOfAddress:
            data.profile?.proof_of_address?.map((proof) => ({
              id: proof.id,
              addressProofType: proof.type || "",
              utilityBill: proof.document || null,
              utilityBillPreview: proof.document || null,
              utilityBillDate: proof.issue_date || "",
              nin: proof.nin || "",
              ninFile: proof.nin_document || null,
              ninPreview: proof.nin_document || null,
            })) || [],
          bankName: data.profile?.bank_name || "",
          accountNumber: data.profile?.account_number || "",
          accountName: data.profile?.account_name || "",
          accountType: data.profile?.account_type || "",
          drivingStatus: data.profile?.is_driver || false,
          vehicleType: data.profile?.type_of_vehicle || "",
          drivingLicenseFront: data.profile?.drivers_licence_image1 || null,
          drivingLicenseFrontPreview:
            data.profile?.drivers_licence_image1_url || null,
          drivingLicenseBack: data.profile?.drivers_licence_image2 || null,
          drivingLicenseBackPreview:
            data.profile?.drivers_licence_image2_url || null,
          countryOfDrivingLicenseIssue:
            data.profile?.drivers_licence_country_of_issue || "",
          drivingLicenseIssueDate:
            data.profile?.drivers_licence_date_issue || "",
          drivingLicenseExpiryDate:
            data.profile?.drivers_licence_expiry_date || "",
          policyNumber: data.profile?.drivers_licence_policy_number || "",
          dbsType: data.profile?.dbs_type || "",
          dbsCertificate: data.profile?.dbs_certificate || null,
          dbsCertificatePreview: data.profile?.dbs_certificate_url || null,
          dbsCertificateNumber: data.profile?.dbs_certificate_number || "",
          dbsIssueDate: data.profile?.dbs_issue_date || "",
          dbsUpdateService: data.profile?.dbs_update_file || null,
          dbsUpdateServicePreview: data.profile?.dbs_update_file_url || null,
          dbsUpdateCertificateNumber:
            data.profile?.dbs_update_certificate_number || "",
          dbsUpdateIssueDate: data.profile?.dbs_update_issue_date || "",
          realTimeStatusChecks: data.profile?.dbs_status_check || false,
          accessDuration: data.profile?.access_duration ? true : false,
          accessExpiryDate: data.profile?.access_duration || "",
          systemAccess: [
            data.profile?.system_access_rostering,
            data.profile?.system_access_hr,
            data.profile?.system_access_recruitment,
            data.profile?.system_access_training,
            data.profile?.system_access_finance,
            data.profile?.system_access_compliance,
            // data.profile?.system_access_co_superadmin,
            data.profile?.system_access_asset_management,
          ].some(Boolean),
          systemAccessSelections: (() => {
            const selections = [];
            if (data.profile?.system_access_rostering)
              selections.push("rostering");
            if (data.profile?.system_access_hr) selections.push("hr");
            if (data.profile?.system_access_recruitment)
              selections.push("recruitment");
            if (data.profile?.system_access_training)
              selections.push("training");
            if (data.profile?.system_access_finance) selections.push("finance");
            if (data.profile?.system_access_compliance)
              selections.push("compliance");
            // if (data.profile?.system_access_co_superadmin)
            //   selections.push("co-superadmin");
            if (data.profile?.system_access_asset_management)
              selections.push("asset_management");
            return selections;
          })(),
          isSyncWithRoster: data.profile?.is_sync_with_roster || false,
          availability: data.profile?.availability || {
            Am: {},
            PM: {},
            Night: {},
          },
          skills: data.profile?.skills || [],
        });
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch employee details");
      } finally {
        setLoading(false);
      }
    };

    if (idToUse) {
      fetchEmployee();
    } else {
      setError("No employee ID provided");
      setLoading(false);
    }
  }, [idToUse]);

  const capitalizeText = (text) => {
    if (!text) return "";
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleEditToggle = (section) => {
    setIsEditing((prev) => {
      const newState = { ...prev, [section]: !prev[section] };
      return newState;
    });
  };

  // Profile photo handlers
  const handleProfilePhotoUpload = useCallback(
    (file, preview) => {
      if (profilePhotoPreview && profilePhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
      setProfilePhotoPreview(preview);
      setProfilePhotoFile(file);
      setProfilePhotoRemoved(false);
      setHasChanges(true);
    },
    [profilePhotoPreview]
  );

  const handleProfilePhotoRemove = useCallback(() => {
    if (profilePhotoPreview && profilePhotoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(profilePhotoPreview);
    }
    setProfilePhotoPreview(null);
    setProfilePhotoFile(null);
    setProfilePhotoRemoved(true);
    setHasChanges(true);
  }, [profilePhotoPreview]);

  const handleInputChange = (section, field, value, index = null) => {
    setFormData((prev) => {
      if (!prev) return prev;

      if (section === "personal") {
        return {
          ...prev,
          [field]: value,
        };
      }

      if (section === "nextOfKin") {
        return {
          ...prev,
          nextOfKin: {
            ...prev.nextOfKin,
            [field]: value,
          },
        };
      }

      if (section === "profile") {
        return {
          ...prev,
          profile: {
            ...prev.profile,
            [field]: value,
          },
        };
      }

      if (index !== null) {
        const arraySections = [
          "employmentDetails",
          "educationDetails",
          "referenceChecks",
          "professionalQualifications",
          "insuranceVerifications",
          "legalVerifications",
          "idAndDocuments",
          "proofOfAddress",
          "skills",
        ];

        if (arraySections.includes(section)) {
          const arrayField = section;
          const updatedArray = [...prev[arrayField]];

          if (updatedArray[index]) {
            updatedArray[index] = {
              ...updatedArray[index],
              [field]: value,
            };

            setModifiedFields((prev) => ({
              ...prev,
              [arrayField]: {
                ...prev[arrayField],
                [index]: new Set(prev[arrayField][index] || []).add(field),
              },
            }));

            return {
              ...prev,
              [arrayField]: updatedArray,
            };
          }
        }
      }

      return {
        ...prev,
        [field]: value,
      };
    });

    setHasChanges(true);
  };

  const handleEventInputChange = (section, e) => {
    const { name, value } = e.target;

    if (section === "nextOfKin") {
      setFormData((prev) => ({
        ...prev,
        nextOfKin: {
          ...prev.nextOfKin,
          [name]: value,
        },
      }));
    } else if (section === "personal") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setHasChanges(true);
  };

  const handleRightToWorkFileChange = (file, preview) => {
    setFormData((prev) => ({
      ...prev,
      rightToWorkFile: file,
      rightToWorkFilePreview: preview,
    }));
    setHasChanges(true);
  };

  const removeRightToWorkFile = () => {
    setFormData((prev) => ({
      ...prev,
      rightToWorkFile: null,
      rightToWorkFilePreview: null,
    }));
    setHasChanges(true);
  };

  const handleRightToRentFileChange = (index, file, preview) => {
    setFormData((prev) => {
      const updatedLegalVerifications = [...prev.legalVerifications];
      updatedLegalVerifications[index] = {
        ...updatedLegalVerifications[index],
        rightToRentFile: file,
        rightToRentFilePreview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        legalVerifications: {
          ...prev.legalVerifications,
          [index]: new Set(prev.legalVerifications[index] || []).add(
            "rightToRentFile"
          ),
        },
      }));
      return {
        ...prev,
        legalVerifications: updatedLegalVerifications,
      };
    });
    setHasChanges(true);
  };

  const removeRightToRentFile = (index) => {
    setFormData((prev) => {
      const updatedLegalVerifications = [...prev.legalVerifications];
      updatedLegalVerifications[index] = {
        ...updatedLegalVerifications[index],
        rightToRentFile: null,
        rightToRentFilePreview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        legalVerifications: {
          ...prev.legalVerifications,
          [index]: new Set(prev.legalVerifications[index] || []).add(
            "rightToRentFile"
          ),
        },
      }));
      return {
        ...prev,
        legalVerifications: updatedLegalVerifications,
      };
    });
    setHasChanges(true);
  };

  const handleInsuranceFileChange = (index, file, preview) => {
    setFormData((prev) => {
      const updatedInsuranceVerifications = [...prev.insuranceVerifications];
      updatedInsuranceVerifications[index] = {
        ...updatedInsuranceVerifications[index],
        insuranceFile: file,
        insuranceFilePreview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        insuranceVerifications: {
          ...prev.insuranceVerifications,
          [index]: new Set(prev.insuranceVerifications[index] || []).add(
            "insuranceFile"
          ),
        },
      }));
      return {
        ...prev,
        insuranceVerifications: updatedInsuranceVerifications,
      };
    });
    setHasChanges(true);
  };

  const removeInsuranceFile = (index) => {
    setFormData((prev) => {
      const updatedInsuranceVerifications = [...prev.insuranceVerifications];
      updatedInsuranceVerifications[index] = {
        ...updatedInsuranceVerifications[index],
        insuranceFile: null,
        insuranceFilePreview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        insuranceVerifications: {
          ...prev.insuranceVerifications,
          [index]: new Set(prev.insuranceVerifications[index] || []).add(
            "insuranceFile"
          ),
        },
      }));
      return {
        ...prev,
        insuranceVerifications: updatedInsuranceVerifications,
      };
    });
    setHasChanges(true);
  };

  const addInsuranceRecord = () => {
    setFormData((prev) => {
      const newIndex = prev.insuranceVerifications.length;
      setModifiedFields((prev) => ({
        ...prev,
        insuranceVerifications: {
          ...prev.insuranceVerifications,
          [newIndex]: new Set([
            "insuranceType",
            "insuranceProviderName",
            "insuranceExpiryDate",
            "insuranceCoverageStartDate",
            "insuranceFile",
            "insurancePhone",
          ]),
        },
      }));
      return {
        ...prev,
        insuranceVerifications: [
          ...prev.insuranceVerifications,
          {
            id: null,
            insuranceType: "",
            insuranceProviderName: "",
            insuranceExpiryDate: "",
            insuranceCoverageStartDate: "",
            insuranceFile: null,
            insuranceFileUrl: "",
            insuranceFilePreview: null,
            insurancePhone: "",
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const removeInsuranceRecord = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.insuranceVerifications };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, insuranceVerifications: updatedModified };
      });
      return {
        ...prev,
        insuranceVerifications: prev.insuranceVerifications.filter(
          (_, i) => i !== index
        ),
      };
    });
    setHasChanges(true);
  };

  const handleIDAndDocumentsFileChange = (index, file, preview) => {
    setFormData((prev) => {
      const updatedIdAndDocuments = [...prev.idAndDocuments];
      updatedIdAndDocuments[index] = {
        ...updatedIdAndDocuments[index],
        idAndDocumentsFile: file,
        idAndDocumentsFilePreview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        idAndDocuments: {
          ...prev.idAndDocuments,
          [index]: new Set(prev.idAndDocuments[index] || []).add(
            "idAndDocumentsFile"
          ),
        },
      }));
      return {
        ...prev,
        idAndDocuments: updatedIdAndDocuments,
      };
    });
    setHasChanges(true);
  };

  const removeIDAndDocumentsFile = (index) => {
    setFormData((prev) => {
      const updatedIdAndDocuments = [...prev.idAndDocuments];
      updatedIdAndDocuments[index] = {
        ...updatedIdAndDocuments[index],
        idAndDocumentsFile: null,
        idAndDocumentsFilePreview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        idAndDocuments: {
          ...prev.idAndDocuments,
          [index]: new Set(prev.idAndDocuments[index] || []).add(
            "idAndDocumentsFile"
          ),
        },
      }));
      return {
        ...prev,
        idAndDocuments: updatedIdAndDocuments,
      };
    });
    setHasChanges(true);
  };

  const handleUtilityBillUpload = (index, file, preview) => {
    setFormData((prev) => {
      const updatedProofOfAddress = [...prev.proofOfAddress];
      updatedProofOfAddress[index] = {
        ...updatedProofOfAddress[index],
        utilityBill: file,
        utilityBillPreview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        proofOfAddress: {
          ...prev.proofOfAddress,
          [index]: new Set(prev.proofOfAddress[index] || []).add("utilityBill"),
        },
      }));
      return {
        ...prev,
        proofOfAddress: updatedProofOfAddress,
      };
    });
    setHasChanges(true);
  };

  const removeUtilityBill = (index) => {
    setFormData((prev) => {
      const updatedProofOfAddress = [...prev.proofOfAddress];
      updatedProofOfAddress[index] = {
        ...updatedProofOfAddress[index],
        utilityBill: null,
        utilityBillPreview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        proofOfAddress: {
          ...prev.proofOfAddress,
          [index]: new Set(prev.proofOfAddress[index] || []).add("utilityBill"),
        },
      }));
      return {
        ...prev,
        proofOfAddress: updatedProofOfAddress,
      };
    });
    setHasChanges(true);
  };

  const handleNinUpload = (index, file, preview) => {
    setFormData((prev) => {
      const updatedProofOfAddress = [...prev.proofOfAddress];
      updatedProofOfAddress[index] = {
        ...updatedProofOfAddress[index],
        ninFile: file,
        ninPreview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        proofOfAddress: {
          ...prev.proofOfAddress,
          [index]: new Set(prev.proofOfAddress[index] || []).add("ninFile"),
        },
      }));
      return {
        ...prev,
        proofOfAddress: updatedProofOfAddress,
      };
    });
    setHasChanges(true);
  };

  const removeNin = (index) => {
    setFormData((prev) => {
      const updatedProofOfAddress = [...prev.proofOfAddress];
      updatedProofOfAddress[index] = {
        ...updatedProofOfAddress[index],
        ninFile: null,
        ninPreview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        proofOfAddress: {
          ...prev.proofOfAddress,
          [index]: new Set(prev.proofOfAddress[index] || []).add("ninFile"),
        },
      }));
      return {
        ...prev,
        proofOfAddress: updatedProofOfAddress,
      };
    });
    setHasChanges(true);
  };

  const handleDrivingLicenseFrontChange = (file, preview) => {
    setFormData((prev) => ({
      ...prev,
      drivingLicenseFront: file,
      drivingLicenseFrontPreview: preview,
    }));
    setHasChanges(true);
  };

  const removeDrivingLicenseFront = () => {
    setFormData((prev) => ({
      ...prev,
      drivingLicenseFront: null,
      drivingLicenseFrontPreview: null,
    }));
    setHasChanges(true);
  };

  const handleDrivingLicenseBackChange = (file, preview) => {
    setFormData((prev) => ({
      ...prev,
      drivingLicenseBack: file,
      drivingLicenseBackPreview: preview,
    }));
    setHasChanges(true);
  };

  const removeDrivingLicenseBack = () => {
    setFormData((prev) => ({
      ...prev,
      drivingLicenseBack: null,
      drivingLicenseBackPreview: null,
    }));
    setHasChanges(true);
  };

  const handleDbsCertificateChange = (file, preview) => {
    setFormData((prev) => ({
      ...prev,
      dbsCertificate: file,
      dbsCertificatePreview: preview,
    }));
    setHasChanges(true);
  };

  const removeDbsCertificate = () => {
    setFormData((prev) => ({
      ...prev,
      dbsCertificate: null,
      dbsCertificatePreview: null,
    }));
    setHasChanges(true);
  };

  const handleDbsUpdateServiceChange = (file, preview) => {
    setFormData((prev) => ({
      ...prev,
      dbsUpdateService: file,
      dbsUpdateServicePreview: preview,
    }));
    setHasChanges(true);
  };

  const removeDbsUpdateService = () => {
    setFormData((prev) => ({
      ...prev,
      dbsUpdateService: null,
      dbsUpdateServicePreview: null,
    }));
    setHasChanges(true);
  };

  const addEmploymentRecord = () => {
    setFormData((prev) => {
      const newIndex = prev.employmentDetails.length;
      setModifiedFields((prev) => ({
        ...prev,
        employmentDetails: {
          ...prev.employmentDetails,
          [newIndex]: new Set([
            "jobRole",
            "hierarchy",
            "department",
            "workEmail",
            "employmentType",
            "employmentStartDate",
            "employmentEndDate",
            "probationEndDate",
            "lineManager",
            "currency",
            "salary",
            "salaryRate",
            "workingDays",
            "maxWorkingHours",
          ]),
        },
      }));
      return {
        ...prev,
        employmentDetails: [
          ...prev.employmentDetails,
          {
            id: null,
            jobRole: "",
            hierarchy: "",
            department: "",
            workEmail: prev.email || "",
            employmentType: "",
            employmentStartDate: "",
            employmentEndDate: "",
            probationEndDate: "",
            lineManager: "",
            currency: "",
            salary: "",
            salaryRate: "",
            workingDays: "",
            maxWorkingHours: "",
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const removeEmploymentRecord = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.employmentDetails };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, employmentDetails: updatedModified };
      });
      return {
        ...prev,
        employmentDetails: prev.employmentDetails.filter((_, i) => i !== index),
      };
    });
    setHasChanges(true);
  };

  const addEducationRecord = () => {
    setFormData((prev) => {
      const newIndex = prev.educationDetails.length;
      setModifiedFields((prev) => ({
        ...prev,
        educationDetails: {
          ...prev.educationDetails,
          [newIndex]: new Set([
            "institution",
            "highestQualification",
            "courseOfStudy",
            "startYear",
            "endYear",
            "skills",
            "certificate",
          ]),
        },
      }));
      return {
        ...prev,
        educationDetails: [
          ...prev.educationDetails,
          {
            id: null,
            institution: "",
            highestQualification: "",
            courseOfStudy: "",
            startYear: "",
            endYear: "",
            skills: "",
            certificate: null,
            certificateUrl: "",
            certificatePreview: null,
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const removeEducationRecord = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.educationDetails };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, educationDetails: updatedModified };
      });
      return {
        ...prev,
        educationDetails: prev.educationDetails.filter((_, i) => i !== index),
      };
    });
    setHasChanges(true);
  };

  const handleEducationCertificateChange = (index, file, preview) => {
    setFormData((prev) => {
      const updatedEducationDetails = [...prev.educationDetails];
      updatedEducationDetails[index] = {
        ...updatedEducationDetails[index],
        certificate: file,
        certificatePreview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        educationDetails: {
          ...prev.educationDetails,
          [index]: new Set(prev.educationDetails[index] || []).add(
            "certificate"
          ),
        },
      }));
      return {
        ...prev,
        educationDetails: updatedEducationDetails,
      };
    });
    setHasChanges(true);
  };

  const removeEducationCertificate = (index) => {
    setFormData((prev) => {
      const updatedEducationDetails = [...prev.educationDetails];
      updatedEducationDetails[index] = {
        ...updatedEducationDetails[index],
        certificate: null,
        certificatePreview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        educationDetails: {
          ...prev.educationDetails,
          [index]: new Set(prev.educationDetails[index] || []).add(
            "certificate"
          ),
        },
      }));
      return {
        ...prev,
        educationDetails: updatedEducationDetails,
      };
    });
    setHasChanges(true);
  };

  const addProfessionalQualification = () => {
    setFormData((prev) => {
      const newIndex = prev.professionalQualifications.length;
      setModifiedFields((prev) => ({
        ...prev,
        professionalQualifications: {
          ...prev.professionalQualifications,
          [newIndex]: new Set([
            "name",
            "organization",
            "issueYear",
            "certificate",
          ]),
        },
      }));
      return {
        ...prev,
        professionalQualifications: [
          ...prev.professionalQualifications,
          {
            id: null,
            name: "",
            organization: "",
            issueYear: "",
            certificate: null,
            certificateUrl: "",
            certificatePreview: null,
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const removeProfessionalQualification = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.professionalQualifications };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, professionalQualifications: updatedModified };
      });
      return {
        ...prev,
        professionalQualifications: prev.professionalQualifications.filter(
          (_, i) => i !== index
        ),
      };
    });
    setHasChanges(true);
  };

  const handleProfessionalQualificationCertificateChange = (
    index,
    file,
    preview
  ) => {
    setFormData((prev) => {
      const updatedProfessionalQualifications = [
        ...prev.professionalQualifications,
      ];
      updatedProfessionalQualifications[index] = {
        ...updatedProfessionalQualifications[index],
        certificate: file,
        certificatePreview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        professionalQualifications: {
          ...prev.professionalQualifications,
          [index]: new Set(prev.professionalQualifications[index] || []).add(
            "certificate"
          ),
        },
      }));
      return {
        ...prev,
        professionalQualifications: updatedProfessionalQualifications,
      };
    });
    setHasChanges(true);
  };

  const removeProfessionalQualificationCertificate = (index) => {
    setFormData((prev) => {
      const updatedProfessionalQualifications = [
        ...prev.professionalQualifications,
      ];
      updatedProfessionalQualifications[index] = {
        ...updatedProfessionalQualifications[index],
        certificate: null,
        certificatePreview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        professionalQualifications: {
          ...prev.professionalQualifications,
          [index]: new Set(prev.professionalQualifications[index] || []).add(
            "certificate"
          ),
        },
      }));
      return {
        ...prev,
        professionalQualifications: updatedProfessionalQualifications,
      };
    });
    setHasChanges(true);
  };

  const addReferenceCheck = () => {
    setFormData((prev) => {
      const newIndex = prev.referenceChecks.length;
      setModifiedFields((prev) => ({
        ...prev,
        referenceChecks: {
          ...prev.referenceChecks,
          [newIndex]: new Set(["name", "phoneNumber", "email", "relationship"]),
        },
      }));
      return {
        ...prev,
        referenceChecks: [
          ...prev.referenceChecks,
          {
            id: null,
            name: "",
            phoneNumber: "",
            email: "",
            relationship: "",
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const removeReferenceCheck = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.referenceChecks };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, referenceChecks: updatedModified };
      });
      return {
        ...prev,
        referenceChecks: prev.referenceChecks.filter((_, i) => i !== index),
      };
    });
    setHasChanges(true);
  };

  const addLegalRecord = () => {
    setFormData((prev) => {
      const newIndex = prev.legalVerifications.length;
      if (newIndex === 0) {
        // Add right to work
        setModifiedFields((prev) => ({
          ...prev,
          legalVerifications: {
            ...prev.legalVerifications,
            [newIndex]: new Set([
              "rightToWorkStatus",
              "passportHolder",
              "rightToWorkDocumentType",
              "rightToWorkDocumentNumber",
              "rightToWorkDocumentExpiryDate",
              "shareCode",
              "rightToWorkFile",
              "countryOfIssue",
              "workRestrictions",
            ]),
          },
        }));
        return {
          ...prev,
          legalVerifications: [
            ...prev.legalVerifications,
            {
              id: null,
              type: "right_to_work",
              rightToWorkStatus: "",
              passportHolder: "",
              rightToWorkDocumentType: "",
              rightToWorkDocumentNumber: "",
              rightToWorkDocumentExpiryDate: "",
              shareCode: "",
              rightToWorkFile: null,
              rightToWorkFileUrl: "",
              rightToWorkFilePreview: null,
              countryOfIssue: "",
              workRestrictions: "",
            },
          ],
        };
      } else {
        // Add right to rent
        setModifiedFields((prev) => ({
          ...prev,
          legalVerifications: {
            ...prev.legalVerifications,
            [newIndex]: new Set([
              "evidenceRightToRent",
              "rightToRentFile",
              "legalWorkPhone",
            ]),
          },
        }));
        return {
          ...prev,
          legalVerifications: [
            ...prev.legalVerifications,
            {
              id: null,
              type: "right_to_rent",
              evidenceRightToRent: false,
              rightToRentFile: null,
              rightToRentFileUrl: "",
              rightToRentFilePreview: null,
              legalWorkPhone: "",
            },
          ],
        };
      }
    });
    setHasChanges(true);
  };

  const removeLegalRecord = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.legalVerifications };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, legalVerifications: updatedModified };
      });
      return {
        ...prev,
        legalVerifications: prev.legalVerifications.filter(
          (_, i) => i !== index
        ),
      };
    });
    setHasChanges(true);
  };

  const addIdAndDocumentsRecord = () => {
    setFormData((prev) => {
      const newIndex = prev.idAndDocuments.length;
      setModifiedFields((prev) => ({
        ...prev,
        idAndDocuments: {
          ...prev.idAndDocuments,
          [newIndex]: new Set([
            "governmentIdType",
            "documentNumber",
            "documentExpiryDate",
            "idAndDocumentsFile",
          ]),
        },
      }));

      return {
        ...prev,
        idAndDocuments: [
          ...prev.idAndDocuments,
          {
            id: null,
            governmentIdType: "Drivers Licence",
            documentNumber: "",
            documentExpiryDate: "",
            idAndDocumentsFile: null,
            idAndDocumentsFileUrl: "",
            idAndDocumentsFilePreview: null,
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const removeIdAndDocumentsRecord = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.idAndDocuments };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, idAndDocuments: updatedModified };
      });
      return {
        ...prev,
        idAndDocuments: prev.idAndDocuments.filter((_, i) => i !== index),
      };
    });
    setHasChanges(true);
  };

  const addProofOfAddressRecord = () => {
    setFormData((prev) => {
      const newIndex = prev.proofOfAddress.length;
      setModifiedFields((prev) => ({
        ...prev,
        proofOfAddress: {
          ...prev.proofOfAddress,
          [newIndex]: new Set([
            "addressProofType",
            "utilityBill",
            "utilityBillDate",
            "nin",
            "ninFile",
          ]),
        },
      }));
      return {
        ...prev,
        proofOfAddress: [
          ...prev.proofOfAddress,
          {
            id: null,
            addressProofType: "",
            utilityBill: null,
            utilityBillPreview: null,
            utilityBillDate: "",
            nin: "",
            ninFile: null,
            ninPreview: null,
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const removeProofOfAddressRecord = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.proofOfAddress };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (i > index) {
            updatedModified[i - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, proofOfAddress: updatedModified };
      });
      return {
        ...prev,
        proofOfAddress: prev.proofOfAddress.filter((_, i) => i !== index),
      };
    });
    setHasChanges(true);
  };

  const handleAddSkill = (skillName) => {
    setFormData((prev) => {
      const newIndex = prev.skills.length;
      setModifiedFields((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [newIndex]: new Set(["skill_name", "certificate"]),
        },
      }));
      return {
        ...prev,
        skills: [
          ...prev.skills,
          {
            id: null,
            skill_name: skillName,
            description: "",
            acquired_date: "",
            years_of_experience: "",
            proficiency_level: "",
            certificate: null,
            certificate_url: "",
            certificate_preview: null,
          },
        ],
      };
    });
    setHasChanges(true);
  };

  const handleRemoveSkill = (index) => {
    setFormData((prev) => {
      setModifiedFields((prev) => {
        const newModified = { ...prev.skills };
        delete newModified[index];
        const updatedModified = {};
        for (const i in newModified) {
          if (parseInt(i) > index) {
            updatedModified[parseInt(i) - 1] = newModified[i];
          } else {
            updatedModified[i] = newModified[i];
          }
        }
        return { ...prev, skills: updatedModified };
      });
      return {
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index),
      };
    });
    setHasChanges(true);
  };

  const handleSkillFileChange = (index, file, preview) => {
    setFormData((prev) => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        certificate: file,
        certificate_preview: preview,
      };
      setModifiedFields((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [index]: new Set(prev.skills[index] || []).add("certificate"),
        },
      }));
      return {
        ...prev,
        skills: updatedSkills,
      };
    });
    setHasChanges(true);
  };

  const handleSkillFileRemove = (index) => {
    setFormData((prev) => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        certificate: null,
        certificate_preview: null,
      };
      setModifiedFields((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [index]: new Set(prev.skills[index] || []).add("certificate"),
        },
      }));
      return {
        ...prev,
        skills: updatedSkills,
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    let hasUpdates = false;
    try {
      switch (selectedSection) {
        case "Basic Information":
          const topLevelPayload = {};
          const profilePayload = {};
          // Only include fields that are actually being edited
          if (isEditing.profile) {
            if (formData.firstName !== employee.first_name)
              topLevelPayload.first_name = formData.firstName;
            if (formData.lastName !== employee.last_name)
              topLevelPayload.last_name = formData.lastName;
            if (formData.email !== employee.email)
              topLevelPayload.email = formData.email;
            if (formData.role !== employee.role)
              topLevelPayload.role = formData.role;
            if (formData.jobRole !== employee.job_role)
              topLevelPayload.job_role = formData.jobRole;

            // Profile photo handling
            if (profilePhotoFile) {
              profilePayload.profile_image = profilePhotoFile;
            } else if (
              profilePhotoRemoved &&
              employee.profile?.profile_image_url
            ) {
              profilePayload.profile_image = null;
            }
          }
          if (isEditing.personal) {
            if (formData.workPhone !== employee.profile?.work_phone)
              profilePayload.work_phone = formData.workPhone;
            if (formData.personalPhone !== employee.profile?.personal_phone)
              profilePayload.personal_phone = formData.personalPhone;
            if (formData.maritalStatus !== employee.profile?.marital_status)
              profilePayload.marital_status = formData.maritalStatus;
            if (formData.address !== employee.profile?.street)
              profilePayload.street = formData.address;
            if (formData.country !== employee.profile?.country)
              profilePayload.country = formData.country;
            if (formData.city !== employee.profile?.city)
              profilePayload.city = formData.city;
            if (formData.state !== employee.profile?.state)
              profilePayload.state = formData.state;
            if (formData.postCode !== employee.profile?.zip_code)
              profilePayload.zip_code = formData.postCode;
          }
          if (isEditing.nextOfKin) {
            if (formData.nextOfKin.name !== employee.profile?.next_of_kin)
              profilePayload.next_of_kin = formData.nextOfKin.name;
            if (
              formData.nextOfKin.email !== employee.profile?.next_of_kin_email
            )
              profilePayload.next_of_kin_email = formData.nextOfKin.email;
            if (
              formData.nextOfKin.phone !==
              employee.profile?.next_of_kin_phone_number
            )
              profilePayload.next_of_kin_phone_number =
                formData.nextOfKin.phone;
            if (
              formData.nextOfKin.altPhone !==
              employee.profile?.next_of_kin_alternate_phone
            )
              profilePayload.next_of_kin_alternate_phone =
                formData.nextOfKin.altPhone;
            if (
              formData.nextOfKin.address !==
              employee.profile?.next_of_kin_address
            )
              profilePayload.next_of_kin_address = formData.nextOfKin.address;
            if (formData.nextOfKin.town !== employee.profile?.next_of_kin_town)
              profilePayload.next_of_kin_town = formData.nextOfKin.town;
            if (
              formData.nextOfKin.postCode !==
              employee.profile?.next_of_kin_zip_code
            )
              profilePayload.next_of_kin_zip_code = formData.nextOfKin.postCode;
            if (
              formData.nextOfKin.relationship !==
              employee.profile?.relationship_to_next_of_kin
            )
              profilePayload.relationship_to_next_of_kin =
                formData.nextOfKin.relationship;
          }
          if (isEditing.loginCredentials) {
            if (formData.loginCredentials.username !== employee.username)
              topLevelPayload.username = formData.loginCredentials.username;
            if (formData.loginCredentials.password)
              // Only send password if changed
              topLevelPayload.password = formData.loginCredentials.password;
          }

          if (
            Object.keys(topLevelPayload).length > 0 ||
            Object.keys(profilePayload).length > 0
          ) {
            hasUpdates = true;
            if (Object.keys(topLevelPayload).length > 0) {
              await updateEmployee(idToUse, topLevelPayload);
            }
            if (Object.keys(profilePayload).length > 0) {
              await updateEmployee(idToUse, { profile: profilePayload });
            }
          }
          break;

        case "Bank Details":
          const bankPayload = {};
          if (isEditing.bank) {
            if (formData.bankName !== employee.profile?.bank_name)
              bankPayload.bank_name = formData.bankName;
            if (formData.accountNumber !== employee.profile?.account_number)
              bankPayload.account_number = formData.accountNumber;
            if (formData.accountName !== employee.profile?.account_name)
              bankPayload.account_name = formData.accountName;
            if (formData.accountType !== employee.profile?.account_type)
              bankPayload.account_type = formData.accountType;
          }

          if (Object.keys(bankPayload).length > 0) {
            hasUpdates = true;
            await updateEmployee(idToUse, { profile: bankPayload });
          }
          break;

        // case "Permissions":
        //   const permissionsTopLevelPayload = {};
        //   const permissionsPayload = {};
        //   if (isEditing.permissions) {
        //     // Include role in payload only if it has a value
        //     if (formData.role) {
        //       permissionsTopLevelPayload.role = formData.role;
        //     }

        //     // Check if access duration changed
        //     const currentAccessDuration = employee.profile?.access_duration;
        //     const newAccessDuration = formData.accessDuration
        //       ? formData.accessExpiryDate
        //       : null;
        //     if (newAccessDuration !== currentAccessDuration)
        //       permissionsPayload.access_duration = newAccessDuration;

        //     // Check system access changes
        //     const systemAccessFields = {
        //       system_access_rostering: "rostering",
        //       system_access_hr: "hr",
        //       system_access_recruitment: "recruitment",
        //       system_access_training: "training",
        //       system_access_finance: "finance",
        //       system_access_compliance: "compliance",
        //       system_access_asset_management: "asset_management",
        //     };

        //     Object.entries(systemAccessFields).forEach(([field, selection]) => {
        //       const currentValue = employee.profile?.[field];
        //       const newValue =
        //         formData.systemAccessSelections.includes(selection);
        //       if (currentValue !== newValue) {
        //         permissionsPayload[field] = newValue;
        //       }
        //     });

        //     // Handle co_superadmin separately
        //      const coAdminCurrent = employee.profile?.system_access_co_superadmin;
        //      const coAdminNew = formData.systemAdminAccessSelections.includes("co-superadmin");
        //      if (coAdminCurrent !== coAdminNew) {
        //        permissionsPayload.system_access_co_superadmin = coAdminNew;
        //      }

        //     // Check sync with roster
        //     if (
        //       formData.isSyncWithRoster !==
        //       employee.profile?.is_sync_with_roster
        //     )
        //       permissionsPayload.is_sync_with_roster =
        //         formData.isSyncWithRoster;

        //     // Set role to co-admin if System Admin Access and Co-Admin are both ticked
        //     if (formData.systemAdminAccess && formData.systemAdminAccessSelections.includes("co-superadmin")) {
        //       permissionsTopLevelPayload.role = "co-admin";
        //     }
        //   }

        //   const payload = {};
        //   if (Object.keys(permissionsTopLevelPayload).length > 0) {
        //     Object.assign(payload, permissionsTopLevelPayload);
        //   }
        //   if (Object.keys(permissionsPayload).length > 0) {
        //     payload.profile = permissionsPayload;
        //   }
        //   if (Object.keys(payload).length > 0) {
        //     hasUpdates = true;
        //     await updateEmployee(idToUse, payload);
        //   }
        //   break;

        case "Permissions":
          const permissionsTopLevelPayload = {};
          const permissionsPayload = {};
          // Check if access duration changed
          const currentAccessDuration = employee.profile?.access_duration;
          const newAccessDuration = formData.accessDuration
            ? formData.accessExpiryDate
            : null;
          if (newAccessDuration !== currentAccessDuration)
            permissionsPayload.access_duration = newAccessDuration;

          // Check system access changes
          const systemAccessFields = {
            system_access_rostering: "rostering",
            system_access_hr: "hr",
            system_access_recruitment: "recruitment",
            system_access_training: "training",
            system_access_finance: "finance",
            system_access_compliance: "compliance",
            system_access_asset_management: "asset_management",
          };

          Object.entries(systemAccessFields).forEach(([field, selection]) => {
            const currentValue = employee.profile?.[field];
            const newValue =
              formData.systemAccessSelections.includes(selection);
            if (currentValue !== newValue) {
              permissionsPayload[field] = newValue;
            }
          });

          // // Handle co_superadmin separately
          // const coAdminCurrent = employee.profile?.system_access_co_superadmin;
          // const coAdminNew =
          //   formData.systemAdminAccessSelections?.includes("co-superadmin");
          // if (coAdminCurrent !== coAdminNew) {
          //   permissionsPayload.system_access_co_superadmin = coAdminNew;
          // }

          // Always set role to co-admin at top level if co-superadmin is selected
          if (coAdminNew) {
            permissionsTopLevelPayload.role = "co-admin";
          }

          // Check sync with roster
          if (
            formData.isSyncWithRoster !== employee.profile?.is_sync_with_roster
          )
            permissionsPayload.is_sync_with_roster = formData.isSyncWithRoster;

          // Always send role=co-admin at top level if coAdminNew is true
          let payload = {};
          if (coAdminNew) {
            payload.role = "co-admin";
          }
          if (Object.keys(permissionsTopLevelPayload).length > 0) {
            Object.assign(payload, permissionsTopLevelPayload);
          }
          if (Object.keys(permissionsPayload).length > 0) {
            payload.profile = permissionsPayload;
          }
          if (Object.keys(payload).length > 0) {
            hasUpdates = true;
            await updateEmployee(idToUse, payload);
          }
          break;

        case "Driving License & DBS Verification":
          const drivingDbsPayload = {};
          const dbsPermissionsTopLevelPayload = {};
          const dbsPermissionsPayload = {};
          if (isEditing.drivingLicenseAndDBS) {
            // Driving license fields
            if (formData.drivingStatus !== employee.profile?.is_driver)
              drivingDbsPayload.is_driver = formData.drivingStatus;
            if (formData.vehicleType !== employee.profile?.type_of_vehicle)
              drivingDbsPayload.type_of_vehicle = formData.vehicleType;
            if (
              formData.drivingLicenseFront !==
              employee.profile?.drivers_licence_image1
            )
              drivingDbsPayload.drivers_licence_image1 =
                formData.drivingLicenseFront;
            if (
              formData.drivingLicenseBack !==
              employee.profile?.drivers_licence_image2
            )
              drivingDbsPayload.drivers_licence_image2 =
                formData.drivingLicenseBack;
            if (
              formData.countryOfDrivingLicenseIssue !==
              employee.profile?.drivers_licence_country_of_issue
            )
              drivingDbsPayload.drivers_licence_country_of_issue =
                formData.countryOfDrivingLicenseIssue;
            if (
              formData.drivingLicenseIssueDate !==
              employee.profile?.drivers_licence_date_issue
            )
              drivingDbsPayload.drivers_licence_date_issue =
                formData.drivingLicenseIssueDate;
            if (
              formData.drivingLicenseExpiryDate !==
              employee.profile?.drivers_licence_expiry_date
            )
              drivingDbsPayload.drivers_licence_expiry_date =
                formData.drivingLicenseExpiryDate;
            if (
              formData.policyNumber !==
              employee.profile?.drivers_licence_policy_number
            )
              drivingDbsPayload.drivers_licence_policy_number =
                formData.policyNumber;

            // DBS fields
            if (formData.dbsType !== employee.profile?.dbs_type)
              drivingDbsPayload.dbs_type = formData.dbsType;
            if (formData.dbsCertificate !== employee.profile?.dbs_certificate)
              drivingDbsPayload.dbs_certificate = formData.dbsCertificate;
            if (
              formData.dbsCertificateNumber !==
              employee.profile?.dbs_certificate_number
            )
              drivingDbsPayload.dbs_certificate_number =
                formData.dbsCertificateNumber;
            if (formData.dbsIssueDate !== employee.profile?.dbs_issue_date)
              drivingDbsPayload.dbs_issue_date = formData.dbsIssueDate;
            if (formData.dbsUpdateService !== employee.profile?.dbs_update_file)
              drivingDbsPayload.dbs_update_file = formData.dbsUpdateService;
            if (
              formData.dbsUpdateCertificateNumber !==
              employee.profile?.dbs_update_certificate_number
            )
              drivingDbsPayload.dbs_update_certificate_number =
                formData.dbsUpdateCertificateNumber;
            if (
              formData.dbsUpdateIssueDate !==
              employee.profile?.dbs_update_issue_date
            )
              drivingDbsPayload.dbs_update_issue_date =
                formData.dbsUpdateIssueDate;
            if (
              formData.realTimeStatusChecks !==
              employee.profile?.dbs_status_check
            )
              drivingDbsPayload.dbs_status_check =
                formData.realTimeStatusChecks;

            // Permissions fields
            // Handle co_superadmin separately
            // const coAdminCurrent =
            //   employee.profile?.system_access_co_superadmin;
            // const coAdminNew =
            //   formData.systemAdminAccessSelections.includes("co-superadmin");
            // if (coAdminCurrent !== coAdminNew) {
            //   dbsPermissionsPayload.system_access_co_superadmin = coAdminNew;
            // }

            // Set role to co-admin if System Admin Access and Co-Admin are both ticked
            // if (
            //   formData.systemAdminAccess &&
            //   formData.systemAdminAccessSelections.includes("co-superadmin")
            // ) {
            //   dbsPermissionsTopLevelPayload.role = "co-admin";
            // }
          }

          const updatePayload = {};
          if (Object.keys(dbsPermissionsTopLevelPayload).length > 0) {
            Object.assign(updatePayload, dbsPermissionsTopLevelPayload);
          }
          if (formData.role !== employee.role) {
            updatePayload.role = formData.role;
          }
          if (
            Object.keys(drivingDbsPayload).length > 0 ||
            Object.keys(dbsPermissionsPayload).length > 0
          ) {
            updatePayload.profile = {
              ...drivingDbsPayload,
              ...dbsPermissionsPayload,
            };
          }
          if (Object.keys(updatePayload).length > 0) {
            hasUpdates = true;
            await updateEmployee(idToUse, updatePayload);
          }
          break;

        case "Employment Details":
          let employmentUpdated = false;
          for (const index in modifiedFields.employmentDetails) {
            const emp = formData.employmentDetails[index];
            if (!emp) continue;
            employmentUpdated = true;
            const modified = modifiedFields.employmentDetails[index];
            const employmentPayload = { user_id: idToUse };
            if (modified.has("jobRole"))
              employmentPayload.job_role = emp.jobRole;
            if (modified.has("hierarchy"))
              employmentPayload.hierarchy = emp.hierarchy;
            if (modified.has("department"))
              employmentPayload.department = emp.department;
            if (modified.has("workEmail"))
              employmentPayload.work_email = emp.workEmail;
            if (modified.has("employmentType"))
              employmentPayload.employment_type = emp.employmentType;
            if (modified.has("employmentStartDate"))
              employmentPayload.employment_start_date = emp.employmentStartDate;
            if (modified.has("employmentEndDate"))
              employmentPayload.employment_end_date =
                emp.employmentEndDate || null;
            if (modified.has("probationEndDate"))
              employmentPayload.probation_end_date =
                emp.probationEndDate || null;
            if (modified.has("lineManager"))
              employmentPayload.line_manager = emp.lineManager || null;
            if (modified.has("currency"))
              employmentPayload.currency = emp.currency;
            if (modified.has("salary"))
              employmentPayload.salary = parseFloat(emp.salary) || null;
            if (modified.has("salaryRate"))
              employmentPayload.salary_rate = emp.salaryRate;
            if (modified.has("workingDays"))
              employmentPayload.working_days = emp.workingDays;
            if (modified.has("maxWorkingHours"))
              employmentPayload.maximum_working_hours =
                parseInt(emp.maxWorkingHours) || null;
            if (emp.id) {
              await updateEmploymentDetails(emp.id, employmentPayload);
            } else {
              // For new records, include all fields as they are marked in modifiedFields
              await createEmploymentDetails({
                user_id: idToUse,
                job_role: emp.jobRole,
                hierarchy: emp.hierarchy,
                department: emp.department,
                work_email: emp.workEmail,
                employment_type: emp.employmentType,
                employment_start_date: emp.employmentStartDate,
                employment_end_date: emp.employmentEndDate || null,
                probation_end_date: emp.probationEndDate || null,
                line_manager: emp.lineManager || null,
                currency: emp.currency,
                salary: parseFloat(emp.salary) || null,
                salary_rate: emp.salaryRate,
                working_days: emp.workingDays,
                maximum_working_hours: parseInt(emp.maxWorkingHours) || null,
              });
              window.location.reload();
            }
          }
          if (employmentUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({ ...prev, employmentDetails: {} }));
          break;

        case "Education Details":
          let educationUpdated = false;
          for (const index in modifiedFields.educationDetails) {
            const edu = formData.educationDetails[index];
            if (!edu) continue;
            educationUpdated = true;
            const modified = modifiedFields.educationDetails[index];
            const educationPayload = { user_id: idToUse };
            if (modified.has("institution"))
              educationPayload.institution = edu.institution;
            if (modified.has("highestQualification"))
              educationPayload.highest_qualification = edu.highestQualification;
            if (modified.has("courseOfStudy"))
              educationPayload.course_of_study = edu.courseOfStudy;
            if (modified.has("startYear"))
              educationPayload.start_year_new = edu.startYear;
            if (modified.has("endYear"))
              educationPayload.end_year_new = edu.endYear;
            if (modified.has("skills")) educationPayload.skills = edu.skills;
            if (modified.has("certificate"))
              educationPayload.certificate = edu.certificate;
            if (edu.id) {
              await updateEducationDetails(edu.id, educationPayload);
            } else {
              await createEducationDetails({
                user_id: idToUse,
                institution: edu.institution,
                highest_qualification: edu.highestQualification,
                course_of_study: edu.courseOfStudy,
                start_year_new: edu.startYear,
                end_year_new: edu.endYear,
                skills: edu.skills,
                certificate: edu.certificate,
              });
              window.location.reload();
            }
          }
          if (educationUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({ ...prev, educationDetails: {} }));
          break;

        case "Reference Checks":
          let referenceUpdated = false;
          for (const index in modifiedFields.referenceChecks) {
            const ref = formData.referenceChecks[index];
            if (!ref) continue;
            referenceUpdated = true;
            const modified = modifiedFields.referenceChecks[index];
            const referencePayload = { user_id: idToUse };
            if (modified.has("name")) referencePayload.name = ref.name;
            if (modified.has("phoneNumber"))
              referencePayload.phone_number = ref.phoneNumber;
            if (modified.has("email")) referencePayload.email = ref.email;
            if (modified.has("relationship"))
              referencePayload.relationship_to_applicant = ref.relationship;
            if (ref.id) {
              await updateReferenceChecks(ref.id, referencePayload);
            } else {
              await createReferenceChecks({
                user_id: idToUse,
                name: ref.name,
                phone_number: ref.phoneNumber,
                email: ref.email,
                relationship_to_applicant: ref.relationship,
              });
              window.location.reload();
            }
          }
          if (referenceUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({ ...prev, referenceChecks: {} }));
          break;

        case "Professional Qualifications":
          let qualUpdated = false;
          for (const index in modifiedFields.professionalQualifications) {
            const qual = formData.professionalQualifications[index];
            if (!qual) continue;
            qualUpdated = true;
            const modified = modifiedFields.professionalQualifications[index];
            const qualificationPayload = { user_id: idToUse };
            if (modified.has("name")) qualificationPayload.name = qual.name;
            if (modified.has("organization"))
              qualificationPayload.organization = qual.organization;
            if (modified.has("issueYear"))
              qualificationPayload.issue_year = qual.issueYear;
            if (modified.has("certificate"))
              qualificationPayload.image_file = qual.certificate;
            if (qual.id) {
              await updateProfessionalQualification(
                qual.id,
                qualificationPayload
              );
            } else {
              await createProfessionalQualification({
                user_id: idToUse,
                name: qual.name,
                image_file: qual.certificate,
              });
              window.location.reload();
            }
          }
          if (qualUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({
            ...prev,
            professionalQualifications: {},
          }));
          break;

        case "Skills":
          let skillsUpdated = false;
          for (const index in modifiedFields.skills) {
            const skill = formData.skills[index];
            if (!skill) continue;
            skillsUpdated = true;
            // Always include all fields if present
            const allFields = [
              "skill_name",
              "proficiency_level",
              "description",
              "acquired_date",
              "years_of_experience",
              "certificate",
            ];
            if (skill.id) {
              const skillPayload = { user_id: idToUse };
              allFields.forEach((field) => {
                if (skill[field]) skillPayload[field] = skill[field];
              });
              await updateSkillDetail(skill.id, skillPayload);
            } else {
              // Create new skill, send all fields except certificate first
              const skillPayload = { user_id: idToUse };
              allFields.forEach((field) => {
                if (field !== "certificate" && skill[field])
                  skillPayload[field] = skill[field];
              });
              const createdSkill = await createSkillDetail(skillPayload);
              // Then update with certificate if present
              if (skill.certificate) {
                const updatePayload = {
                  user_id: idToUse,
                  certificate: skill.certificate,
                };
                await updateSkillDetail(createdSkill.id, updatePayload);
              }
              window.location.reload();
            }
          }
          if (skillsUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({ ...prev, skills: {} }));
          break;

        case "Proof of Address":
          let proofUpdated = false;
          for (const index in modifiedFields.proofOfAddress) {
            const proof = formData.proofOfAddress[index];
            if (!proof) continue;
            proofUpdated = true;
            const modified = modifiedFields.proofOfAddress[index];
            const proofPayload = { user_id: idToUse };
            if (modified.has("addressProofType"))
              proofPayload.type = proof.addressProofType;
            if (modified.has("utilityBillDate"))
              proofPayload.issue_date = proof.utilityBillDate;
            if (modified.has("nin")) proofPayload.nin = proof.nin;
            if (modified.has("utilityBill"))
              proofPayload.document = proof.utilityBill;
            if (modified.has("ninFile"))
              proofPayload.nin_document = proof.ninFile;
            if (proof.id) {
              await updateProofOfAddress(proof.id, proofPayload);
            } else {
              await createProofOfAddress({
                user_id: idToUse,
                type: proof.addressProofType,
                issue_date: proof.utilityBillDate,
                nin: proof.nin,
                document: proof.utilityBill,
                nin_document: proof.ninFile,
              });
              window.location.reload();
            }
          }
          if (proofUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({ ...prev, proofOfAddress: {} }));
          break;

        case "Insurance Verification":
          let insuranceUpdated = false;
          for (const index in modifiedFields.insuranceVerifications) {
            const ins = formData.insuranceVerifications[index];
            if (!ins) continue;
            insuranceUpdated = true;
            const modified = modifiedFields.insuranceVerifications[index];
            const insurancePayload = { user_id: idToUse };
            if (modified.has("insuranceType"))
              insurancePayload.insurance_type = ins.insuranceType;
            if (modified.has("insuranceProviderName"))
              insurancePayload.provider_name = ins.insuranceProviderName;
            if (modified.has("insuranceExpiryDate"))
              insurancePayload.expiry_date = ins.insuranceExpiryDate;
            if (modified.has("insuranceCoverageStartDate"))
              insurancePayload.coverage_start_date =
                ins.insuranceCoverageStartDate;
            if (modified.has("insuranceFile"))
              insurancePayload.document = ins.insuranceFile;
            if (modified.has("insurancePhone"))
              insurancePayload.phone_number = ins.insurancePhone || "";
            if (ins.id) {
              await updateInsuranceVerifications(ins.id, insurancePayload);
            } else {
              await createInsuranceVerifications({
                user_id: idToUse,
                insurance_type: ins.insuranceType,
                provider_name: ins.insuranceProviderName,
                expiry_date: ins.insuranceExpiryDate,
                coverage_start_date: ins.insuranceCoverageStartDate,
                document: ins.insuranceFile,
                phone_number: ins.insurancePhone || "",
              });
              window.location.reload();
            }
          }
          if (insuranceUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({
            ...prev,
            insuranceVerifications: {},
          }));
          break;

        case "Legal & Work Eligibility":
          // Save legal verifications array
          let legalUpdated = false;
          for (const index in modifiedFields.legalVerifications) {
            const legal = formData.legalVerifications[index];
            if (!legal) continue;
            legalUpdated = true;
            const modified = modifiedFields.legalVerifications[index];
            const legalPayload = { user_id: idToUse };
            if (modified.has("evidenceRightToRent"))
              legalPayload.evidence_of_right_to_rent =
                legal.evidenceRightToRent;
            if (modified.has("rightToRentFile"))
              legalPayload.document = legal.rightToRentFile;
            if (modified.has("legalWorkPhone"))
              legalPayload.phone_number = legal.legalWorkPhone || "";
            if (legal.type) legalPayload.type = legal.type;
            if (legal.type === "right_to_work") {
              if (modified.has("rightToWorkStatus"))
                legalPayload.right_to_work_status = legal.rightToWorkStatus;
              if (modified.has("passportHolder"))
                legalPayload.passport_holder = legal.passportHolder;
              if (modified.has("rightToWorkDocumentType"))
                legalPayload.right_to_work_document_type =
                  legal.rightToWorkDocumentType;
              if (modified.has("rightToWorkDocumentNumber"))
                legalPayload.right_to_work_document_number =
                  legal.rightToWorkDocumentNumber;
              if (modified.has("rightToWorkDocumentExpiryDate"))
                legalPayload.right_to_work_document_expiry_date =
                  legal.rightToWorkDocumentExpiryDate;
              if (modified.has("shareCode"))
                legalPayload.share_code = legal.shareCode;
              if (modified.has("rightToWorkFile"))
                legalPayload.right_to_work_file = legal.rightToWorkFile;
              if (modified.has("countryOfIssue"))
                legalPayload.country_of_issue = legal.countryOfIssue;
              if (modified.has("workRestrictions"))
                legalPayload.work_restrictions = legal.workRestrictions;
            }
            if (legal.id) {
              await updateLegalWorkEligibilities(legal.id, legalPayload);
            } else {
              await createLegalWorkEligibilities(legalPayload);
              window.location.reload();
            }
          }
          if (legalUpdated) hasUpdates = true;
          setModifiedFields((prev) => ({ ...prev, legalVerifications: {} }));
          break;

        // case "ID & Documents":
        //   for (const index in modifiedFields.idAndDocuments) {
        //     const doc = formData.idAndDocuments[index];
        //     if (!doc) continue;
        //     const modified = modifiedFields.idAndDocuments[index];
        //     const documentPayload = { user_id: idToUse };
        //     if (modified.has("governmentIdType"))
        //       documentPayload.title = doc.governmentIdType;
        //     if (modified.has("documentNumber"))
        //       documentPayload.document_number = doc.documentNumber;
        //     if (modified.has("documentExpiryDate"))
        //       documentPayload.expiry_date = doc.documentExpiryDate;
        //     if (modified.has("idAndDocumentsFile"))
        //       documentPayload.file = doc.idAndDocumentsFile;
        //     if (doc.id) {
        //       await updateOtherUserDocuments(doc.id, documentPayload);
        //     } else {
        //       await createOtherUserDocuments({
        //         user_id: idToUse,
        //         title: doc.governmentIdType,
        //         document_number: doc.documentNumber,
        //         expiry_date: doc.documentExpiryDate,
        //         file: doc.idAndDocumentsFile,
        //       });
        //       window.location.reload();
        //     }
        //   }
        //   setModifiedFields((prev) => ({ ...prev, idAndDocuments: {} }));
        //   break;

        case "My Availability":
          const availabilityPayload = {};
          if (isEditing.availability) {
            if (formData.availability !== employee.profile?.availability) {
              availabilityPayload.availability = formData.availability;
            }
          }
          if (Object.keys(availabilityPayload).length > 0) {
            hasUpdates = true;
            await updateEmployee(idToUse, { profile: availabilityPayload });
          }
          break;

        default:
          setError("No updates for this section");
          return;
      }

      if (hasUpdates) {
        const updatedEmployee = await fetchSingleEmployee(idToUse);
        setEmployee(updatedEmployee);
        setProfilePhotoPreview(
          updatedEmployee.profile?.profile_image_url || null
        );
        setProfilePhotoRemoved(false);
        setProfilePhotoFile(null);

        setIsEditing({
          profile: false,
          personal: false,
          nextOfKin: false,
          loginCredentials: false,
          employment: false,
          legal: false,
          insurance: false,
          education: false,
          professionalQualifications: false,
          idAndDocuments: false,
          bank: false,
          proofOfAddress: false,
          drivingLicenseAndDBS: false,
          permissions: false,
          referenceChecks: false,
          skills: false,
        });
        setHasChanges(false);
        setSuccessMessage("Employee details updated successfully");
      }
    } catch (err) {
      setError(err.message || "Failed to update employee details");
    } finally {
      setTimeout(() => {
        setSuccessMessage("");
        setError("");
        setIsSaving(false);
      }, 2000);
    }
  };

  const renderProgressCircle = () => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const progress = (profileCompletion / 100) * circumference;
    const strokeDashoffset = circumference - progress;

    return (
      <div className="profile-completion-circle">
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="4"
          />
          <circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke="#7226ff"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 25 25)"
          />
          <text
            x="25"
            y="25"
            textAnchor="middle"
            dy=".3em"
            fontSize="12"
            fontWeight="bold"
            fill="#333"
          >
            {Math.round(profileCompletion)}%
          </text>
        </svg>
        <div className="completion-label">Profile Complete</div>
      </div>
    );
  };

  const renderSidebar = () => (
    <nav className="sidebar">
      <ul>
        {sections.map((section) => (
          <li key={section}>
            <button
              className={`sidebar-item ${
                selectedSection === section ? "active" : ""
              }`}
              onClick={() => setSelectedSection(section)}
            >
              {section}
              {warningSections.includes(section) && (
                <span className="warning-icon">
                  <DangerWarningIcon />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  const renderProfileCard = () => {
    if (!employee || !formData) return null;

    const initials = `${employee.first_name?.charAt(0) || ""}${
      employee.last_name?.charAt(0) || ""
    }`;

    return (
      <div className="info-card">
        <div className="profile-info">
          <div>
            <ProfilePhotoEditor
              imageUrl={employee.profile?.profile_image_url}
              previewUrl={profilePhotoPreview}
              isRemoved={profilePhotoRemoved}
              initials={initials}
              isEditing={isEditing.profile}
              onUpload={handleProfilePhotoUpload}
              onRemove={handleProfilePhotoRemove}
            />

            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {isEditing.profile ? (
                  <>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange(
                          "personal",
                          "firstName",
                          e.target.value
                        )
                      }
                      className="edit-input"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange(
                          "personal",
                          "lastName",
                          e.target.value
                        )
                      }
                      className="edit-input"
                    />
                  </>
                ) : (
                  <h3 style={{ margin: 0 }}>
                    {employee.first_name} {employee.last_name}
                  </h3>
                )}
                <StatusBadge status={employee.is_active} />
              </div>
              <p>Employee ID: {employee.profile?.employee_id || "N/A"}</p>
              <p>{capitalizeText(employee.job_role || "N/A")}</p>
            </div>
          </div>
          <button
            className="edit-button"
            onClick={() => handleEditToggle("profile")}
          >
            {isEditing.profile ? (
              <>
                Cancel <IoMdClose />
              </>
            ) : (
              <>
                Edit <PencilIcon />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "Basic Information":
        return (
          <BasicInformationStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleEventInputChange={handleEventInputChange}
          />
        );
      case "Employment Details":
        return (
          <EmploymentDetailsStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            addEmploymentRecord={addEmploymentRecord}
            isOwnProfile={isOwnProfile}
          />
        );
      case "Education Details":
        return (
          <EducationDetailsStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleEducationCertificateChange={handleEducationCertificateChange}
            removeEducationCertificate={removeEducationCertificate}
            educationCertificateRef={educationCertificateRef}
            addEducationRecord={addEducationRecord}
            removeEducationRecord={removeEducationRecord}
          />
        );
      case "Reference Checks":
        return (
          <ReferenceChecksStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            addReferenceCheck={addReferenceCheck}
            removeReferenceCheck={removeReferenceCheck}
          />
        );
      case "Legal & Work Eligibility":
        return (
          <LegalWorkEligibilityStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleRightToRentFileChange={handleRightToRentFileChange}
            removeRightToRentFile={removeRightToRentFile}
            rightToRentFileRef={rightToRentFileRef}
            handleRightToWorkFileChange={handleRightToWorkFileChange}
            removeRightToWorkFile={removeRightToWorkFile}
            rightToWorkFileRef={rightToWorkFileRef}
            addLegalRecord={addLegalRecord}
            removeLegalRecord={removeLegalRecord}
          />
        );
      case "Insurance Verification":
        return (
          <InsuranceVerificationStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleInsuranceFileChange={handleInsuranceFileChange}
            removeInsuranceFile={removeInsuranceFile}
            insuranceFileRef={insuranceFileRef}
            addInsuranceRecord={addInsuranceRecord}
            removeInsuranceRecord={removeInsuranceRecord}
          />
        );
      case "Professional Qualifications":
        return (
          <ProfessionalQualificationsStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleProfessionalQualificationCertificateChange={
              handleProfessionalQualificationCertificateChange
            }
            removeProfessionalQualificationCertificate={
              removeProfessionalQualificationCertificate
            }
            professionalQualificationCertificateRef={
              professionalQualificationCertificateRef
            }
            addProfessionalQualification={addProfessionalQualification}
            removeProfessionalQualification={removeProfessionalQualification}
          />
        );
      case "Skills":
        return (
          <SkillsStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleAddSkill={handleAddSkill}
            handleRemoveSkill={handleRemoveSkill}
            handleSkillFileChange={handleSkillFileChange}
            handleSkillFileRemove={handleSkillFileRemove}
          />
        );
      // case "ID & Documents":
      //   return (
      //     <IDAndDocumentsStep
      //       formData={formData}
      //       isEditing={isEditing}
      //       handleEditToggle={handleEditToggle}
      //       handleInputChange={handleInputChange}
      //       handleIDAndDocumentsFileChange={handleIDAndDocumentsFileChange}
      //       removeIDAndDocumentsFile={removeIDAndDocumentsFile}
      //       idAndDocumentsFileRef={idAndDocumentsFileRef}
      //       addIdAndDocumentsRecord={addIdAndDocumentsRecord}
      //       removeIdAndDocumentsRecord={removeIdAndDocumentsRecord}
      //     />
      //   );
      case "Bank Details":
        return (
          <BankDetailsStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
          />
        );
      case "Proof of Address":
        return (
          <ProofOfAddressStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleUtilityBillUpload={handleUtilityBillUpload}
            removeUtilityBill={removeUtilityBill}
            utilityBillRef={utilityBillRef}
            handleNinUpload={handleNinUpload}
            removeNin={removeNin}
            ninRef={ninRef}
            addProofOfAddressRecord={addProofOfAddressRecord}
            removeProofOfAddressRecord={removeProofOfAddressRecord}
          />
        );
      case "Driving License & DBS Verification":
        return (
          <DrivingLicenseAndDBSStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            handleDrivingLicenseFrontChange={handleDrivingLicenseFrontChange}
            removeDrivingLicenseFront={removeDrivingLicenseFront}
            drivingLicenseFrontRef={drivingLicenseFrontRef}
            handleDrivingLicenseBackChange={handleDrivingLicenseBackChange}
            removeDrivingLicenseBack={removeDrivingLicenseBack}
            drivingLicenseBackRef={drivingLicenseBackRef}
            handleDbsCertificateChange={handleDbsCertificateChange}
            removeDbsCertificate={removeDbsCertificate}
            dbsCertificateRef={dbsCertificateRef}
            handleDbsUpdateServiceChange={handleDbsUpdateServiceChange}
            removeDbsUpdateService={removeDbsUpdateService}
            dbsUpdateServiceRef={dbsUpdateServiceRef}
            isCompanyView={isCompanyView}
          />
        );
      case "Permissions":
        return (
          <PermissionsStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
            isProfileView={isProfileView}
            isOwnProfile={isOwnProfile}
          />
        );
      case "My Availability":
        return (
          <AvailabilityStep
            formData={formData}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange}
          />
        );
      default:
        return (
          <div className="placeholder-content">
            <p>Content for {selectedSection} coming soon.</p>
          </div>
        );
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState text="Loading Employee Details..." />;
    }

    if (!employee) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="no-data"
        >
          <p>No employee data found</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="employee-details-container"
      >
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} />
          Back
        </button>

        <div className="page-header">
          <div className="header-text">
            <h1>{title}</h1>
            <p className="subtitle">
              View {isProfileView ? "your profile" : "employee details"}
            </p>
          </div>
          {renderProgressCircle()}
        </div>

        <div className="main-layout">
          {renderSidebar()}
          <div className="right-content">
            {renderProfileCard()}
            {renderSectionContent()}
            <button
              className="save-button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const sections = [
    "Basic Information",
    "Employment Details",
    "Education Details",
    "Skills",
    "Reference Checks",
    "Legal & Work Eligibility",
    "Insurance Verification",
    "Professional Qualifications",
    // "ID & Documents",
    "Bank Details",
    "Proof of Address",
    "Driving License & DBS Verification",
    ...(currentUser.role === "root-admin" && !isProfileView
      ? ["Permissions"]
      : []),
    `${isProfileView ? "My" : "Employee"} Documents`,
    "My Availability",
  ];

  const warningSections = [];

  const pageContent = (
    <>
      <ToastNotification
        successMessage={successMessage}
        errorMessage={error}
        onClose={() => {
          setSuccessMessage(null);
          setError(null);
        }}
      />
      <div className="DB-Envt-Container">{renderContent()}</div>
    </>
  );

  const showNav = !isHRApp && !isProfileView;

  return showNav ? (
    <motion.div
      className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">{pageContent}</div>
    </motion.div>
  ) : (
    <>{pageContent}</>
  );
};

export default EmployeeDetailsPage;
