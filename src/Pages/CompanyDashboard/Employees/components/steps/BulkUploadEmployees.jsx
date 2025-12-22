import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { generateRandomPassword } from "../../../../../utils/helpers";
import { bulkCreateUsers, fetchUsersNoPagination } from "../../../OnboardingDocuments/config/apiConfig";
import { autoAssignCarerToCluster } from "../../config/apiService";
import { downloadSampleExcel } from "./SampleExcelDownload";

import * as XLSX from 'xlsx';

// ClusterTable component
const ClusterTable = ({
  data = [],
  currentView = "employees",
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
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Address</th>
                <th>City</th>
                <th>Postal Code</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>
                    <div>Creating employees...</div>
                  </td>
                </tr>
              ) : displayedData.length > 0 ? (
                displayedData.map((item, index) => {
                  const isDuplicate = duplicateEmails.includes(item.workEmail?.toLowerCase());
                  return (
                    <tr
                      key={item.id}
                      style={isDuplicate ? { backgroundColor: '#ffebee' } : {}}
                    >
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
                        type="email"
                        value={item.workEmail}
                        onChange={(e) => handleFieldChange(index, 'workEmail', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      />
                    </td>
                    <td>
                      <select
                        value={item.role}
                        onChange={(e) => handleFieldChange(index, 'role', e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                      >
                        <option value="staff">Staff</option>
                        <option value="carer">Carer</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                        <option value="co-admin">Co-Admin</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.workPhoneRaw || `${item.workPhoneCode || ''}${item.workPhone || ''}`}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Store the raw input
                          handleFieldChange(index, 'workPhoneRaw', value);

                          // Parse the phone number more flexibly
                          if (value.startsWith('+')) {
                            // Has country code
                            const parts = value.split(/\s+/);
                            const code = parts[0];
                            const number = parts.slice(1).join('').replace(/\D/g, '');
                            handleFieldChange(index, 'workPhoneCode', code);
                            handleFieldChange(index, 'workPhone', number);
                          } else if (value.match(/^\d/)) {
                            // Starts with digits, no country code
                            handleFieldChange(index, 'workPhoneCode', '');
                            handleFieldChange(index, 'workPhone', value.replace(/\D/g, ''));
                          } else {
                            // Empty or invalid
                            handleFieldChange(index, 'workPhoneCode', '');
                            handleFieldChange(index, 'workPhone', '');
                          }
                        }}
                        style={{ width: '100%', border: 'none', background: 'transparent' }}
                        placeholder="+44 1234567890"
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
                        value={item.postalCode}
                        onChange={(e) => handleFieldChange(index, 'postalCode', e.target.value)}
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
                        title="Remove user"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10}>
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

export default function BulkUploadEmployees({
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

  // Fetch existing users when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadExistingUsers = async () => {
        try {
          const users = await fetchUsersNoPagination();
          setExistingUsers(users || []);
        } catch (error) {
          console.error('Failed to fetch existing users:', error);
          setExistingUsers([]);
        }
      };
      loadExistingUsers();
    }
  }, [isOpen]);

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
      .filter(item => item && item.workEmail)
      .map(item => item.workEmail.toLowerCase())
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
        "Duplicate Users Detected",
        "Some email addresses already exist in the system. Please remove the duplicate users from the list before proceeding."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const bulkPayload = bulkData.map((item) => ({
        email: item.workEmail,
        password: item.password,
        first_name: item.firstName,
        last_name: item.lastName,
        role: item.role || "staff",
        profile: {
          zip_code: item.postalCode,
          street: item.address,
        },
        cluster_assignment: {
          postcode: item.postalCode,
          address: item.address
        }
      }));

      const result = await bulkCreateUsers(bulkPayload);

      console.log('Bulk create result:', result);
      // Auto-assign created employees to clusters (non-blocking)
      result.created?.forEach(employee => {
        // Skip if no postcode (required for auto-assignment)
        if (!employee.data?.profile?.zip_code) {
          console.log('Skipping auto-assign for employee', employee.data.id, 'due to missing postcode');
          return;
        }
        console.log('Calling auto assign for employee', employee.data.id, 'with payload:', {
          carerId: employee.data.id,
          postcode: employee.data.profile.zip_code,
          address: employee.data.profile.address_line || employee.data.profile.street,
        });
        const assignPayload = {
          carerId: employee.data.id,
          postcode: employee.data.profile.zip_code,
          address: employee.data.profile.address_line || employee.data.profile.street,
        };
        autoAssignCarerToCluster(assignPayload).catch(error => {
          console.error('Auto-assign failed for employee', employee.data.id, error);
        });
      });

      // Check if there were any errors in the response
      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map(err =>
          `- ${err.email}: ${Object.values(err.errors).flat().join(', ')}`
        ).join('\n');

        onError(
          `Bulk Creation Partially Failed`,
          `${result.message || `Created ${result.created?.length || 0} users, ${result.errors.length} failed.`}\n\nErrors:\n${errorMessages}`
        );

        // Update the duplicate emails based on API response
        const apiDuplicates = result.errors
          .filter(err => err.errors.email && err.errors.email.some(msg => msg.includes('already exists')))
          .map(err => err.email.toLowerCase());

        if (apiDuplicates.length > 0) {
          setDuplicateEmails(apiDuplicates);
        }

        // Don't close modal if there were errors
        return;
      }

      setSuccessTitle(`${result.created?.length || bulkData.length} Employees Created Successfully`);
      setSuccessMessage("Bulk employees have been created and are being assigned to clusters.");
      setBulkData([]);
      // Don't close modal, show success message inside
    } catch (error) {
      onError("Bulk Creation Failed", error.message || "There was an error creating the bulk employees. Please try again.");
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
        console.log('Uploaded employees data:', jsonData);
        // Process jsonData for ClusterTable, matching personal info fields
        const processedData = jsonData.map((row, index) => {
          const phoneMatch = row['Phone'] ? row['Phone'].match(/^(\+\d{1,3})(\s*(\d[\s-]*)*\d)$/) : null;
          return {
            id: index,
            firstName: row['First Name'] || '',
            lastName: row['Last Name'] || '',
            workEmail: row['Email'] || '',
            role: row['Role'] || '',
            workPhoneCode: phoneMatch ? phoneMatch[1] : '+1',
            workPhone: phoneMatch ? phoneMatch[2].replace(/\D/g, '') : '',
            address: row['Address'] || '',
            city: row['City'] || '',
            postalCode: row['Postal Code'] || '',
            loginEmail: row['Username'] || '',
            // password: row['Password'] || generateRandomPassword(),
            password: row['Password'] || generateRandomPassword(),
          };
        });
        setBulkData(processedData);

        // Check for duplicates
        setIsCheckingDuplicates(true);
        setTimeout(() => {
          checkForDuplicates(processedData);
          setIsCheckingDuplicates(false);
        }, 500); // Small delay to show loading state

        // Do not close modal to show the table
        // alert(`Uploaded ${jsonData.length} employees successfully!`); // Removed
      };
      reader.readAsArrayBuffer(file);
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
                  ⚠️ Duplicate Users Found
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
                  🔍 Checking for duplicate users...
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
                {isSubmitting ? 'Creating...' : 'Save Employees'}
              </button>
              <button
                onClick={onClose}
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
  );
}