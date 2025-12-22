import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { generateRandomPassword } from "../../../../../utils/helpers";
import { bulkCreateClients, fetchClients, autoAssignClientToCluster } from "../../config/apiService";
import { downloadSampleExcel } from "./SampleExcelDownload";

import * as XLSX from 'xlsx';

// ClusterTable component
const ClusterTable = ({
  data = [],
  currentView = "clients",
  isLoading = false,
  onDataChange,
  onDuplicateCheck,
  duplicateEmails = []
}) => {
  const handleFieldChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onDataChange(updatedData);
  };

  const handleRemoveUser = (index, onDuplicateCheck) => {
    const updatedData = data.filter((_, i) => i !== index);
    onDataChange(updatedData);
    // Re-check duplicates after removal
    if (onDuplicateCheck) {
      setTimeout(() => onDuplicateCheck(updatedData), 100);
    }
  };

  const displayedData = data;
  return (
    <div className="GThaks-POla-Table">
      <div className="CLusssd-Table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Preferred Name</th>
                <th>Gender Identity</th>
                <th>Preferred Pronouns</th>
                <th>Date of Birth</th>
                <th>Marital Status</th>
                <th>NHIS Number</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Alternate Phone</th>
                <th>Login Email</th>
                <th>Password</th>
                <th>Primary Contact</th>
                <th>Primary Contact Phone</th>
                <th>Primary Contact Email</th>
                <th>Secondary Contact</th>
                <th>Secondary Contact Phone</th>
                <th>Secondary Contact Email</th>
                <th>Communication Preferences</th>
                <th>Address Line</th>
                <th>Town/City</th>
                <th>County</th>
                <th>Postcode</th>
                <th>Type of Residence</th>
                <th>Lives Alone</th>
                <th>Cohabitants</th>
                <th>Key Safe/Access Instructions</th>
                <th>Next of Kin Name</th>
                <th>Next of Kin Relationship</th>
                <th>Next of Kin Email</th>
                <th>Next of Kin Town</th>
                <th>Next of Kin Phone 1</th>
                <th>Next of Kin Phone 2</th>
                <th>Preferred Care Times</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={36} style={{ textAlign: 'center', padding: '20px' }}>
                    <div>Creating clients...</div>
                  </td>
                </tr>
              ) : displayedData.length > 0 ? (
                displayedData.map((item, index) => {
                  const isDuplicate = duplicateEmails.includes(item.email?.toLowerCase());
                  return (
                    <tr
                      key={item.id}
                      style={isDuplicate ? { backgroundColor: '#ffebee' } : {}}
                    >
                    <td>
                      <select
                        value={item.title}
                        onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.firstName}
                        onChange={(e) => handleFieldChange(index, 'firstName', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.lastName}
                        onChange={(e) => handleFieldChange(index, 'lastName', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.preferredName}
                        onChange={(e) => handleFieldChange(index, 'preferredName', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <select
                        value={item.gender}
                        onChange={(e) => handleFieldChange(index, 'gender', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.pronouns}
                        onChange={(e) => handleFieldChange(index, 'pronouns', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.dob}
                        onChange={(e) => handleFieldChange(index, 'dob', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <select
                        value={item.maritalStatus}
                        onChange={(e) => handleFieldChange(index, 'maritalStatus', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.nhisNumber}
                        onChange={(e) => handleFieldChange(index, 'nhisNumber', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={item.email}
                        onChange={(e) => handleFieldChange(index, 'email', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.phone}
                        onChange={(e) => handleFieldChange(index, 'phone', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.altPhone}
                        onChange={(e) => handleFieldChange(index, 'altPhone', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={item.loginEmail}
                        onChange={(e) => handleFieldChange(index, 'loginEmail', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.password}
                        onChange={(e) => handleFieldChange(index, 'password', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.primaryContact}
                        onChange={(e) => handleFieldChange(index, 'primaryContact', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.primaryContactPhone}
                        onChange={(e) => handleFieldChange(index, 'primaryContactPhone', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={item.primaryContactEmail}
                        onChange={(e) => handleFieldChange(index, 'primaryContactEmail', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.secondaryContact}
                        onChange={(e) => handleFieldChange(index, 'secondaryContact', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.secondaryContactPhone}
                        onChange={(e) => handleFieldChange(index, 'secondaryContactPhone', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={item.secondaryContactEmail}
                        onChange={(e) => handleFieldChange(index, 'secondaryContactEmail', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.communicationPreferences}
                        onChange={(e) => handleFieldChange(index, 'communicationPreferences', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.address}
                        onChange={(e) => handleFieldChange(index, 'address', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.city}
                        onChange={(e) => handleFieldChange(index, 'city', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.county}
                        onChange={(e) => handleFieldChange(index, 'county', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.postalCode}
                        onChange={(e) => handleFieldChange(index, 'postalCode', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <select
                        value={item.residenceType}
                        onChange={(e) => handleFieldChange(index, 'residenceType', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      >
                        <option value="private_home">Private Home</option>
                        <option value="care_home">Care Home</option>
                        <option value="assisted_living">Assisted Living</option>
                        <option value="sheltered">Sheltered Housing</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.livesAlone}
                        onChange={(e) => handleFieldChange(index, 'livesAlone', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.cohabitants}
                        onChange={(e) => handleFieldChange(index, 'cohabitants', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.keySafeAccessInstructions}
                        onChange={(e) => handleFieldChange(index, 'keySafeAccessInstructions', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.nextOfKin}
                        onChange={(e) => handleFieldChange(index, 'nextOfKin', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.relationship}
                        onChange={(e) => handleFieldChange(index, 'relationship', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={item.nokEmail}
                        onChange={(e) => handleFieldChange(index, 'nokEmail', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.nokTown}
                        onChange={(e) => handleFieldChange(index, 'nokTown', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.nokPhone1}
                        onChange={(e) => handleFieldChange(index, 'nokPhone1', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.nokPhone2}
                        onChange={(e) => handleFieldChange(index, 'nokPhone2', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.preferredCareTimes || ''}
                        onChange={(e) => handleFieldChange(index, 'preferredCareTimes', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                        placeholder='{"monday": {"available": true, "start": "07:00", "end": "19:00"}, ...}'
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleRemoveUser(index, onDuplicateCheck)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff4444',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                        title="Remove client"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={36}>
                    No {currentView === "clients" ? "clients" : "carers"} available
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

export default function BulkUploadClients({
  isOpen,
  onClose,
  onSuccess,
  onError
}) {
  const [bulkData, setBulkData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingUsers, setExistingUsers] = useState([]);
  const [duplicateEmails, setDuplicateEmails] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [successTitle, setSuccessTitle] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch existing clients when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadExistingUsers = async () => {
        try {
          const users = await fetchClients();
          setExistingUsers(users.results || []);
        } catch (error) {
          console.error('Failed to fetch existing clients:', error);
          setExistingUsers([]);
        }
      };
      loadExistingUsers();
    }
  }, [isOpen]);

  // Helper function to convert communication preferences to valid API values
  const getCommunicationPreference = (preference) => {
    if (!preference) return "email";
    const pref = preference.toLowerCase();
    if (pref.includes("email") && pref.includes("phone")) return "email";
    if (pref.includes("phone")) return "phone_call";
    if (pref.includes("sms")) return "sms";
    return "email";
  };

  // Helper function to convert Django validation errors to user-friendly messages
  const getUserFriendlyErrorMessage = (field, errorMessage) => {
    const fieldNames = {
      'title': 'Title',
      'gender_identity': 'Gender Identity',
      'communication_preference': 'Communication Preference',
      'marital_status': 'Marital Status',
      'type_of_residence': 'Type of Residence',
      'email': 'Email',
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'contact_number': 'Phone Number',
      'date_of_birth': 'Date of Birth'
    };

    const validChoices = {
      'title': 'Mr, Mrs, Miss, or Dr',
      'gender_identity': 'Male, Female, Non-Binary, Other, or Prefer not to say',
      'communication_preference': 'Phone Call, SMS, or Email',
      'marital_status': 'Single, Married, Divorced, Widowed, or Other',
      'type_of_residence': 'Private Home, Care Home, Assisted Living, or Sheltered Housing'
    };

    const friendlyFieldName = fieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (errorMessage.includes('is not a valid choice')) {
      const invalidValue = errorMessage.match(/"([^"]+)"/)?.[1] || 'value';
      const validOptions = validChoices[field] || 'a valid option';
      return `${friendlyFieldName} '${invalidValue}' is not valid. Please use: ${validOptions}`;
    }

    if (errorMessage.includes('Date has wrong format')) {
      return `${friendlyFieldName} must be in YYYY-MM-DD format (e.g., 1990-01-15)`;
    }

    if (field === 'email' && errorMessage.includes('already exists')) {
      return 'This email address is already registered.';
    }

    // Return the original message if we can't make it more user-friendly
    return `${friendlyFieldName}: ${errorMessage}`;
  };

  // Check for duplicate emails
  const checkForDuplicates = (data) => {
    if (!existingUsers || existingUsers.length === 0) {
      setDuplicateEmails([]);
      return false;
    }

    const existingEmails = new Set(
      existingUsers
        .filter(user => user && user.email)
        .map(user => user.email.toLowerCase())
    );

    const duplicates = data
      .filter(item => item && item.email)
      .map(item => item.email.toLowerCase())
      .filter(email => existingEmails.has(email));

    setDuplicateEmails(duplicates);
    return duplicates.length > 0;
  };

  // Bulk create function
  const handleBulkCreate = async () => {
    if (bulkData.length === 0) return;

    // Check for duplicates before submitting
    const hasDuplicates = checkForDuplicates(bulkData);
    if (hasDuplicates) {
      onError(
        "Duplicate Clients Detected",
        "Some email addresses already exist in the system. Please remove the duplicate clients from the list before proceeding."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const bulkPayload = bulkData.map((item) => ({
        email: item.email,
        password: item.password,
        first_name: item.firstName,
        last_name: item.lastName,
        role: "client",
        profile: {
          title: item.title,
          contact_number: item.phone,
          alt_contact_number: item.altPhone,
          gender_identity: item.gender,
          preferred_pronouns: item.pronouns,
          preferred_name: item.preferredName,
          date_of_birth: item.dob,
          marital_status: item.maritalStatus,
          nhis_number: item.nhisNumber,
          address_line: item.address,
          town: item.city,
          county: item.county,
          postcode: item.postalCode,
          type_of_residence: item.residenceType,
          lives_alone: item.livesAlone === "yes",
          co_residents: item.cohabitants,
          key_safe_instructions: item.keySafeAccessInstructions,
          primary_contact_name: item.primaryContact,
          primary_contact_phone: item.primaryContactPhone,
          primary_contact_email: item.primaryContactEmail,
          secondary_contact_name: item.secondaryContact,
          secondary_contact_phone: item.secondaryContactPhone,
          secondary_contact_email: item.secondaryContactEmail,
          communication_preference: getCommunicationPreference(item.communicationPreferences),
          next_of_kin_full_name: item.nextOfKin,
          next_of_kin_relationship: item.relationship,
          next_of_kin_contact_number: item.nokPhone1,
          next_of_kin_alt_contact_number: item.nokPhone2,
          next_of_kin_town: item.nokTown,
          next_of_kin_email: item.nokEmail,
          preferred_care_times: (() => {
            try {
              return item.preferredCareTimes ? JSON.parse(item.preferredCareTimes) : {};
            } catch (e) {
              console.warn('Invalid JSON in preferred_care_times, using empty object:', item.preferredCareTimes);
              return {};
            }
          })()
        }
      }));

      const result = await bulkCreateClients(bulkPayload);

      console.log('Bulk create result:', result);
      // Auto-assign created clients to clusters (non-blocking)
      result.created?.forEach(client => {
        // Skip if no postcode (required for auto-assignment)
        if (!client.data?.profile?.postcode) {
          console.log('Skipping auto-assign for client', client.data.id, 'due to missing postcode');
          return;
        }
        console.log('Calling auto assign for client', client.data.id, 'with payload:', {
          name: `${client.data.first_name} ${client.data.last_name}`,
          postcode: client.data.profile.postcode,
          address: client.data.profile.address_line,
          town: client.data.profile.town,
          city: client.data.profile.city,
          clientId: client.data.id,
        });
        const assignPayload = {
          name: `${client.data.first_name} ${client.data.last_name}`,
          postcode: client.data.profile.postcode,
          address: client.data.profile.address_line,
          town: client.data.profile.town,
          city: client.data.profile.city,
          clientId: String(client.data.id),
        };
        autoAssignClientToCluster(assignPayload).catch(error => {
          console.error('Auto-assign failed for client', client.data.id, error);
        });
      });

      // Check if there were any created clients
      if (result.created && result.created.length > 0) {
        let message = `Successfully created ${result.created.length} clients.`;
        if (result.errors && result.errors.length > 0) {
          message += ` ${result.errors.length} failed due to validation errors.`;
        }
        setSuccessTitle(`${result.created.length} Clients Created Successfully`);
        setSuccessMessage(message);
        setBulkData([]);
        // Don't close modal, show success in modal
      } else if (result.errors && result.errors.length > 0) {
        // No clients created, show errors
        const errorMessages = result.errors.map(err => {
          let errorDetails = '';

          // Handle nested errors structure from Django API
          if (err.errors && typeof err.errors === 'object') {
            const errorStrings = [];

            // Handle profile errors
            if (err.errors.profile) {
              Object.entries(err.errors.profile).forEach(([field, messages]) => {
                if (Array.isArray(messages)) {
                  messages.forEach(msg => {
                    errorStrings.push(getUserFriendlyErrorMessage(field, msg));
                  });
                } else {
                  errorStrings.push(getUserFriendlyErrorMessage(field, messages));
                }
              });
            }

            // Handle other top-level errors
            Object.entries(err.errors).forEach(([field, messages]) => {
              if (field !== 'profile') {
                if (Array.isArray(messages)) {
                  messages.forEach(msg => {
                    errorStrings.push(getUserFriendlyErrorMessage(field, msg));
                  });
                } else {
                  errorStrings.push(getUserFriendlyErrorMessage(field, messages));
                }
              }
            });

            errorDetails = errorStrings.join('; ');
          } else {
            // Fallback for other error formats
            errorDetails = JSON.stringify(err.errors);
          }

          return `- ${err.email}: ${errorDetails}`;
        }).join('\n');

        onError(
          `Bulk Creation Failed`,
          `${result.message || `Created ${result.created?.length || 0} clients, ${result.errors.length} failed.`}\n\nPlease correct the following errors:\n${errorMessages}`
        );

        // Update the duplicate emails based on API response
        const apiDuplicates = result.errors
          .filter(err => err.errors && (
            (err.errors.email && err.errors.email.some(msg => msg.includes('already exists'))) ||
            (err.errors.profile && err.errors.profile.email && err.errors.profile.email.some(msg => msg.includes('already exists')))
          ))
          .map(err => err.email.toLowerCase());

        if (apiDuplicates.length > 0) {
          setDuplicateEmails(apiDuplicates);
        }

        // Don't close modal if there were errors
        return;
      } else {
        // No created or errors, perhaps unexpected
        onSuccess('Bulk Creation Completed', 'No clients were created.');
        setBulkData([]);
        onClose();
      }
    } catch (error) {
      onError("Bulk Creation Failed", error.message || "There was an error creating the bulk clients. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        console.log('Uploaded clients data:', jsonData);
        // Process jsonData for ClusterTable, matching personal info fields
        const processedData = jsonData.map((row, index) => ({
          id: index,
          title: row['Title'] || '',
          firstName: row['First Name'] || '',
          lastName: row['Last Name'] || '',
          preferredName: row['Preferred Name'] || '',
          gender: row['Gender Identity'] || '',
          pronouns: row['Preferred Pronouns'] || '',
          dob: row['Date of Birth'] || '',
          maritalStatus: row['Marital Status'] || '',
          nhisNumber: row['NHIS Number'] || '',
          email: row['Email'] || '',
          phone: row['Phone'] || '',
          altPhone: row['Alternate Phone'] || '',
          loginEmail: row['Login Email'] || '',
          password: row['Password'] || generateRandomPassword(),
          sendCredentialsToEmail: row['Send Credentials'] === 'Yes',
          primaryContact: row['Primary Contact'] || '',
          primaryContactPhone: row['Primary Contact Phone'] || '',
          primaryContactEmail: row['Primary Contact Email'] || '',
          secondaryContact: row['Secondary Contact'] || '',
          secondaryContactPhone: row['Secondary Contact Phone'] || '',
          secondaryContactEmail: row['Secondary Contact Email'] || '',
          communicationPreferences: row['Communication Preferences'] || '',
          address: row['Address Line'] || '',
          city: row['Town/City'] || '',
          county: row['County'] || '',
          postalCode: row['Postcode'] || '',
          residenceType: row['Type of Residence'] || '',
          livesAlone: row['Lives Alone'] || '',
          cohabitants: row['Cohabitants'] || '',
          keySafeAccessInstructions: row['Key Safe/Access Instructions'] || '',
          nextOfKin: row['Next of Kin Name'] || '',
          relationship: row['Next of Kin Relationship'] || '',
          nokEmail: row['Next of Kin Email'] || '',
          nokTown: row['Next of Kin Town'] || '',
          nokPhone1: row['Next of Kin Phone 1'] || '',
          nokPhone2: row['Next of Kin Phone 2'] || '',
          preferredCareTimes: row['Preferred Care Times'] || ''
        }));
        setBulkData(processedData);

        // Check for duplicates
        setIsCheckingDuplicates(true);
        setTimeout(() => {
          checkForDuplicates(processedData);
          setIsCheckingDuplicates(false);
        }, 500); // Small delay to show loading state

        // Do not close modal to show the table
        // alert(`Uploaded ${jsonData.length} clients successfully!`); // Removed
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const renderContent = () => {
    if (successMessage) {
      return (
        <div style={{ textAlign: 'center' }}>
          <h3>{successTitle}</h3>
          <p>{successMessage}</p>
          <button
            onClick={() => {
              setSuccessTitle(null);
              setSuccessMessage(null);
              onClose();
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#7226FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            Close
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <h3>Bulk Upload Clients</h3>
          <p>Upload an Excel file with client data or download a sample template.</p>
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
            <div>
              <div className="BBThas-UUKa" style={{ overflowX: 'auto' }}>
                <ClusterTable
                  data={bulkData}
                  currentView="clients"
                  isLoading={isSubmitting}
                  onDataChange={setBulkData}
                  onDuplicateCheck={checkForDuplicates}
                  duplicateEmails={duplicateEmails}
                />
              </div>

              {/* Duplicate warnings */}
              {duplicateEmails.length > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#fff3e0',
                  border: '1px solid #ffcc02',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <h4 style={{ color: '#f57c00', margin: '0 0 0.5rem 0' }}>
                    ⚠️ Duplicate Clients Found
                  </h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    The following email addresses already exist in the system. Please remove them from the list before proceeding:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#d32f2f' }}>
                    {duplicateEmails.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9em', color: '#666' }}>
                    Rows with duplicate emails are highlighted in red in the table above.
                  </p>
                </div>
              )}

              {/* Checking duplicates loading */}
              {isCheckingDuplicates && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#1976d2' }}>
                    🔍 Checking for duplicate clients...
                  </p>
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  onClick={handleBulkCreate}
                  disabled={isSubmitting || bulkData.length === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#7226FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Save Clients'}
                </button>
                <button
                  onClick={onClose}
                  className="Ujas-OMINAs"
                >
                  <XMarkIcon />
                </button>
              </div>
            </div>
          ) : (
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Please upload an Excel file to view and save the client data.
            </p>
          )}
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
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
      onClick={onClose}
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
        {renderContent()}
      </div>
    </div>
  );
}