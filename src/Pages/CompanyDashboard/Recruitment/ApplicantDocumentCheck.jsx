import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentCheckTable from './DocumentCheckTable';
import pdfIcon from '../../../assets/icons/pdf.png';
import imageIcon from '../../../assets/icons/image.png';
import {
  ClockIcon,
  ArrowLeftIcon,
  XMarkIcon,
  DocumentTextIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { updateApplicantComplianceStatus } from './ApiService';

const ApplicantDocumentCheck = ({ applicant, complianceChecklist, onHide, onComplianceStatusChange }) => {

  // console.log("complianceChecklist")
  // console.log(complianceChecklist)
  // console.log("complianceChecklist")

  const [activeChecks, setActiveChecks] = useState([]);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [formData, setFormData] = useState({ 
    name: '', 
    remark: '',
    position: '',
    date: new Date().toLocaleDateString()
  });
  const [formErrors, setFormErrors] = useState({});
  const [submissionState, setSubmissionState] = useState('idle');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [verificationDate] = useState(new Date());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialState, setInitialState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [complianceData, setComplianceData] = useState(
    applicant?.compliance_status?.map(item => ({
      ...item,
      status: item.status || 'pending',
      rejectionReason: item.notes || '',
    })) || []
  );

  useEffect(() => {
   //console.log('Applicant:', applicant.id);
   //console.log('ComplianceChecklist:', complianceChecklist);
    setComplianceData(prepareComplianceData());
  }, [applicant, complianceChecklist]);

  const handleClose = () => {
    if (onHide) onHide();
  };

  const defaultChecklistItems = [
    "Is the passport or driver's license valid and clearly visible?",
    "Has the candidate provided a shared code or date of birth?",
    "Is a valid DBS certificate uploaded?",
    "Are the required training certificates submitted and verified?",
    "Is there a valid proof of address (utility bill, bank statement, etc.)?",
    "Has the right to work check been completed successfully?",
    "Are references from previous roles provided and verifiable?",
  ];

  const checklistItems = complianceChecklist && complianceChecklist.length > 0
    ? complianceChecklist.map((item) => {
        switch (item.name.toLowerCase()) {
          case 'passport':
          case 'drivers licence':
            return "Is the passport or driver's license valid and clearly visible?";
          case 'shared code':
          case 'date of birth':
            return "Has the candidate provided a shared code or date of birth?";
          case 'dbs':
            return "Is a valid DBS certificate uploaded?";
          case 'training certificate':
            return "Are the required training certificates submitted and verified?";
          case 'proof of address':
            return "Is there a valid proof of address (utility bill, bank statement, etc.)?";
          case 'right to work':
            return "Has the right to work check been completed successfully?";
          case 'references':
            return "Are references from previous roles provided and verifiable?";
          default:
            return `Is the ${item.name} valid and properly submitted?`;
        }
      })
    : defaultChecklistItems;

  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
    header: { marginBottom: 20, paddingBottom: 15, borderBottom: '1px solid #7226FF' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#372580', textAlign: 'center', marginBottom: 5 },
    subtitle: { fontSize: 12, color: '#372580', textAlign: 'center', marginBottom: 15 },
    section: { marginBottom: 20 },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#372580', marginBottom: 10, paddingBottom: 3, borderBottom: '1px solid #e5e7eb' },
    grid: { display: 'flex', flexDirection: 'row', marginBottom: 8 },
    gridLabel: { width: '30%', fontWeight: 'bold', fontSize: 11 },
    gridValue: { width: '70%', fontSize: 11 },
    summaryBox: { backgroundColor: '#f7f5ff', padding: 15, borderRadius: 5, borderLeft: '4px solid #7226FF', marginBottom: 20 },
    summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#372580', marginBottom: 5 },
    summaryStatus: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    complianceScore: { fontSize: 14, fontWeight: 'bold', color: '#372580', marginTop: 10, textAlign: 'center', backgroundColor: '#ebe6ff', padding: 8, borderRadius: 4 },
    summaryText: { fontSize: 10, color: '#374151', lineHeight: 1.5, marginTop: 10 },
    checklist: { marginBottom: 20 },
    checklistItem: { display: 'flex', flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
    checkStatus: { width: 30, fontSize: 10, fontWeight: 'bold', color: '#7226FF', marginRight: 5, textAlign: 'right' },
    checkText: { fontSize: 10, flex: 1 },
    remarks: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, padding: 10, minHeight: 60 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center' },
    footerText: { fontSize: 8, color: '#372580', marginTop: 3 },
    signatureArea: { marginTop: 20, paddingTop: 10, borderTop: '1px dashed #cbd5e1' },
    signatureLine: { width: '60%', borderBottom: '1px solid #94a3b8', marginBottom: 5 },
    signatureLabel: { fontSize: 10, color: '#64748b' },
  });

  useEffect(() => {
    if (submissionState === 'success' && !initialState) {
      setInitialState({
        activeChecks: [...activeChecks],
        formData: { ...formData },
      });
    }
  }, [submissionState, activeChecks, formData, initialState]);

  useEffect(() => {
    if (submissionState === 'success' && initialState) {
      const checksChanged = JSON.stringify(initialState.activeChecks) !== JSON.stringify(activeChecks);
      const formDataChanged = 
        initialState.formData.name !== formData.name ||
        initialState.formData.position !== formData.position ||
        initialState.formData.remark !== formData.remark;
      
      setHasChanges(checksChanged || formDataChanged);
    }
  }, [activeChecks, formData, submissionState, initialState]);

  const ComplianceReport = () => {
    const totalItems = checklistItems.length;
    const verifiedItems = activeChecks.length;
    const complianceScore = Math.round((verifiedItems / totalItems) * 100);
    const isCompliant = complianceScore >= 80;
    
    return (
      <Document>
        <Page style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>COMPLIANCE VERIFICATION REPORT</Text>
            <Text style={styles.subtitle}>Generated on {verificationDate.toLocaleDateString()} at {verificationDate.toLocaleTimeString()}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Verification Details</Text>
            
            <View style={styles.grid}>
              <Text style={styles.gridLabel}>Report ID:</Text>
              <Text style={styles.gridValue}>COMP-{Date.now().toString().slice(-6)}</Text>
            </View>
            
            <View style={styles.grid}>
              <Text style={styles.gridLabel}>Applicant Name:</Text>
              <Text style={styles.gridValue}>{applicant?.full_name || 'Emma Johnson'}</Text>
            </View>
            
            <View style={styles.grid}>
              <Text style={styles.gridLabel}>Application Date:</Text>
              <Text style={styles.gridValue}>06-30-2025</Text>
            </View>
            
            <View style={styles.grid}>
              <Text style={styles.gridLabel}>Verification Date:</Text>
              <Text style={styles.gridValue}>{verificationDate.toLocaleDateString()}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Verifier Information</Text>
            
            <View style={styles.grid}>
              <Text style={styles.gridLabel}>Verifier Name:</Text>
              <Text style={styles.gridValue}>{formData.name}</Text>
            </View>
            
            <View style={styles.grid}>
              <Text style={styles.gridLabel}>Position:</Text>
              <Text style={styles.gridValue}>{formData.position || 'Compliance Officer'}</Text>
            </View>
            
            <View style={styles.grid}>
              <Text style={styles.gridLabel}>Verification Date:</Text>
              <Text style={styles.gridValue}>{verificationDate.toLocaleDateString()}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Verification Summary</Text>
            
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Overall Compliance Status</Text>
              <Text style={[styles.summaryStatus, { color: isCompliant ? '#16a34a' : '#dc2626' }]}>
                {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </Text>
              
              <Text style={styles.complianceScore}>
                Compliance Score: {complianceScore}%
              </Text>
              
              <Text style={styles.summaryText}>
                {isCompliant 
                  ? `All required documents have been verified and meet the organization's compliance standards. 
                    The candidate has successfully passed all verification checks and is cleared for employment. 
                    This report is valid for 90 days from the date of issue.`
                  : `The candidate has not met the required compliance threshold (80%). 
                    Only ${verifiedItems} out of ${totalItems} documents were successfully verified. 
                    Additional documentation or verification is required before employment clearance.`}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Document Checklist</Text>
            
            <View style={styles.checklist}>
              {checklistItems.map((item, index) => (
                <View key={index} style={styles.checklistItem}>
                  <Text style={styles.checkStatus}>
                    {activeChecks.includes(index) ? 'Yes' : complianceData[index]?.status || 'No'}
                  </Text>
                  <Text style={styles.checkText}>{item}</Text>
                  {complianceData[index]?.rejectionReason && (
                    <Text style={{ fontSize: 8, color: '#dc2626' }}>
                      Reason: {complianceData[index].rejectionReason}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            
            <Text style={styles.sectionHeader}>Verifier Remarks</Text>
            <View style={styles.remarks}>
              <Text style={{ fontSize: 10 }}>
                {formData.remark || "No additional remarks provided by the verifier."}
              </Text>
            </View>
          </View>
          
          <View style={styles.signatureArea}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Verifier Signature</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>This compliance report was generated by the Automated Compliance Verification System</Text>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Company Name. All rights reserved. CONFIDENTIAL</Text>
          </View>
        </Page>
      </Document>
    );
  };

  const toggleCheck = (index) => {
    setActiveChecks((prev) => {
      const newChecks = prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index];
      const newComplianceData = [...complianceData];
      newComplianceData[index] = {
        ...newComplianceData[index],
        status: newChecks.includes(index) ? 'Accepted' : 'Pending'
      };
      setComplianceData(newComplianceData);
      return newChecks;
    });
  };

  const handleContinue = () => {
    setDirection('forward');
    setShowVerificationForm(true);
    setShowSuccessAlert(false);
    setShowPdfViewer(false);
    setFormErrors({});
  };

  const handleGoBack = () => {
    setDirection('backward');
    setShowVerificationForm(false);
    setShowSuccessAlert(false);
    setShowPdfViewer(false);
    setFormErrors({});
  };

  const generatePdf = async () => {
    const doc = (
      <Document>
        <Page size="A4">
          <View>
            <Text>Applicant: {applicant?.full_name || 'Unknown'}</Text>
            {complianceData.map((item, index) => (
              <Text key={index}>
                {item.title || 'Untitled'}: {item.status || 'Pending'}
              </Text>
            ))}
          </View>
        </Page>
      </Document>
    );

    const pdfInstance = pdf();
    pdfInstance.updateContainer(doc);
    const blob = await pdfInstance.toBlob();
    //console.log('PDF generated successfully', blob);
    return URL.createObjectURL(blob);
  };

const handleSubmit = async () => {
  const errors = {};
  if (!formData.name.trim()) {
    errors.name = 'Verifier name is required.';
  }
  setFormErrors(errors);

  if (Object.keys(errors).length > 0) return;

  setSubmissionState('submitting');

  setTimeout(async () => {
    setSubmissionState('generating');

    try {
      const pdfUrl = await generatePdf();
      setPdfUrl(pdfUrl);

      const updatedComplianceData = [...complianceData];
      updatedComplianceData.forEach(item => {
        if (!item.status || item.status === 'Pending') {
          item.status = 'Accepted';
        }
      });
      setComplianceData(updatedComplianceData);

      // Trigger save changes instead of direct API call
      await handleSaveChanges();
    } catch (error) {
      console.error('Error during submission:', error);
    }

    setTimeout(() => {
      setSubmissionState('success');
      setShowSuccessAlert(true);
      setShowVerificationForm(false);
      setDirection('backward');
      setFormErrors({});
    }, 1000);
  }, 1000);
};

  const handleViewReport = () => {
    setShowPdfViewer(true);
  };

  const handleCloseViewer = () => {
    setShowPdfViewer(false);
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `compliance_report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      generatePdf().then((url) => {
        if (url) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `compliance_report_${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };



  // Define showAlert function
  const showAlert = (message, type = 'success') => {
    setAlertMessage({ text: message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

const handleSaveChanges = async () => {
  if (!applicant?.id) {
    console.warn('Applicant ID is missing, cannot save changes');
    alert('Data for the update request not set');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user?.id) {
    console.error('User ID is missing from localStorage');
    alert('User authentication data is missing. Please log in again.');
    return;
  }

  const promises = complianceData.map(async (item) => {
    if (item.id) {
      // console.log(`Updating compliance item ${item.title} (ID: ${item.id}) with status ${item.status}`);
      const payload = {
        name: item.title,
        status: item.status === 'Accepted' ? 'completed' : item.status.toLowerCase() === 'rejected' ? 'failed' : 'pending',
        checked_by: parseInt(user.id, 10),
        notes: item.rejectionReason || '',
      };

      try {
        await onComplianceStatusChange(applicant.id, item.id, payload);
      } catch (error) {
        console.error(`Error updating compliance status for item ${item.id}:`, error.message);
      }
    } else {
      console.warn(`Skipping update for ${item.title} due to missing ID`);
    }
  });

  try {
    await Promise.all(promises);
    setHasChanges(false);
    showAlert('Changes saved successfully.', 'success');
  } catch (error) {
    console.error('Error updating compliance status:', error.message);
    alert('Failed to save changes. Please try again.');
  }
};



  const handleClearData = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    
    setActiveChecks([]);
    setShowVerificationForm(false);
    setDirection('forward');
    setFormData({ 
      name: '', 
      remark: '',
      position: '',
      date: new Date().toLocaleDateString() 
    });
    setFormErrors({});
    setSubmissionState('idle');
    setShowSuccessAlert(false);
    setShowPdfViewer(false);
    setPdfUrl(null);
    setShowClearConfirm(false);
    setHasChanges(false);
    setInitialState(null);
    setIsSaving(false);
    setComplianceData(prepareComplianceData());
  };

  const getSlideAnimation = () => ({
    initial: { x: direction === 'forward' ? 10 : -10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction === 'forward' ? -10 : 10, opacity: 0 },
    transition: { duration: 0.4 }
  });

  const renderSubmitButtonContent = () => {
    switch (submissionState) {
      case 'submitting':
        return (
          <>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                border: '3px solid #fff',
                borderTopColor: 'transparent',
                marginRight: 5,
                display: 'inline-block'
              }}
            />
            Submitting
          </>
        );
      case 'generating':
        return (
          <>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                border: '3px solid #fff',
                borderTopColor: 'transparent',
                marginRight: 5,
                display: 'inline-block'
              }}
            />
            Generating Report
          </>
        );
      case 'success':
        return hasChanges ? (
          <>
            <DocumentTextIcon style={{ width: 18, height: 18, marginRight: 5 }} />
            Save Changes
          </>
        ) : (
          <>
            <DocumentTextIcon style={{ width: 18, height: 18, marginRight: 5 }} />
            View Compliance Report
          </>
        );
      default:
        return 'Submit';
    }
  };

  useEffect(() => {
    if (showSuccessAlert && !hasChanges) {
      const timer = setTimeout(() => setShowSuccessAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert, hasChanges]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

const prepareComplianceData = () => {
  //console.log('Preparing compliance data with applicant:', applicant);
  return applicant?.documents?.map((doc, index) => {
    const fileUrl = doc.file_url;
    const extension = fileUrl.split('.').pop().toLowerCase();
    const fileType = extension === 'pdf' ? 'PDF' : ['jpg', 'jpeg', 'png'].includes(extension) ? 'Image' : 'Unknown';
    const fileIcon = extension === 'pdf' ? pdfIcon : ['jpg', 'jpeg', 'png'].includes(extension) ? imageIcon : null;
    const title = complianceChecklist.find((item) =>
      item.name.toLowerCase().includes(doc.document_type.toLowerCase())
    )?.name || doc.document_type;

    // Find the matching compliance checklist item
    const checklistItem = complianceChecklist.find((item) =>
      item.name.toLowerCase().includes(doc.document_type.toLowerCase())
    );

    const complianceStatus = applicant.compliance_status?.find(
      (item) => item.title === title || item.document_type === doc.document_type
    );

 

    // console.log("applicant doc", applicant);
    // console.log("complianceStatus", complianceStatus);
    // console.log("checklistItem", checklistItem);

    return {
      id: checklistItem?.id || `temp_${index}_${Date.now()}`, // Use ID from complianceChecklist
      title: title,
      fileName: fileUrl.split('/').pop() || 'Unknown',
      fileType: fileType,
      fileIcon: fileIcon,
      fileUrl: fileUrl,
      status: complianceStatus?.status || 'Pending',
      rejectionReason: complianceStatus?.rejection_reason || '',
    };
  }) || [];
};

  return (
    <div className="DocComplianceCheck">
      <div className="DocComplianceCheck-Body" onClick={handleClose}></div>
      <button className="DocComplianceCheck-btn" onClick={handleClose}>
        <XMarkIcon />
      </button>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="DocComplianceCheck-Main"
      >
        <div className="DocComplianceCheck-Part">
          <div className="DocComplianceCheck-Part-Top">
            <h3>Compliance Check</h3>
          </div>

          <div className="ssen-regs">
            <div className="ssen-regs-1"><span>EM</span></div>
            <div className="ssen-regs-2">
              <div>
                <h4>{applicant?.full_name || 'Applicant Name'}</h4>
                <p>Applied: {applicant?.created_at ? new Date(applicant.created_at).toLocaleString(undefined, 
                  { dateStyle: 'medium', timeStyle: 'short' }) : 'Date'}</p>
              </div>
            </div>
          </div>

          <div className="PPPOl-Seacs">
            <ul>
              <li>Uploaded Files</li>
              <li>
                <span>Status:
                  {submissionState === 'success' ? (
                    <b className="status completed">
                      <CheckCircleIcon /> Checked
                    </b>
                  ) : (
                    <b className="status pending">
                      <ClockIcon /> Pending
                    </b>
                  )}
                </span>
              </li>
            </ul>
            <ul>
              {submissionState === 'success' && (
                <li className="OIUkuja-BBtns">
                  <button
                    className="btn-primary-bg"
                    onClick={hasChanges ? handleSaveChanges : handleViewReport}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: '50%',
                            border: '3px solid #fff',
                            borderTopColor: 'transparent',
                            marginRight: 5,
                            display: 'inline-block'
                          }}
                        />
                        Saving...
                      </>
                    ) : hasChanges ? (
                      <>
                        <DocumentTextIcon />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <DocumentTextIcon />
                        View Report
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={isSaving}
                    className='ClearDatt-BTn'
                  >
                    <ArrowPathIcon />
                    Clear Data
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="POlail-AAPAPl-Secc custom-scroll-bar">
            <DocumentCheckTable complianceData={complianceData} onUpdate={setComplianceData} />
          </div>
        </div>

        <div className="DocComplianceCheck-Part">
          <div className="DocComplianceCheck-Part-Top">
            <h3>Document Verification</h3>
          </div>

          <AnimatePresence mode="wait">
            {!showVerificationForm ? (
              <motion.div
                key="checklist"
                {...getSlideAnimation()}
                className="POlails-Gtha custom-scroll-bar"
              >
                <h4>Checklist for Document Verification</h4>
                <ul className="checcck-lissT oikauk-Ola">
                  {checklistItems.map((item, index) => (
                    <li
                      key={index}
                      className={activeChecks.includes(index) ? 'active-Li-Check' : ''}
                      onClick={() => toggleCheck(index)}
                    >
                      {item} <span></span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                {...getSlideAnimation()}
                className="POlails-Gtha custom-scroll-bar"
              >
                <div className="GGtg-DDDVa">
                  <label>Verifier Name: <span style={{ color: '#7226FF' }}>*</span></label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="oujka-Inpuauy"
                    required
                  />
                  {formErrors.name && (
                    <p className="erro-message-Txt">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="GGtg-DDDVa">
                  <label>Position:</label>
                  <input
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Your position/role"
                    className="oujka-Inpuauy"
                  />
                </div>

                <div className="GGtg-DDDVa">
                  <label>Remark (Optional):</label>
                  <textarea
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    className="oujka-Inpuauy OIUja-Tettxa"
                    placeholder="Enter verification notes or comments"
                  />
                </div>
                <div className="compliance-consent-text">
                  <p>
                    By submitting this verification, you confirm that you have thoroughly reviewed all submitted documents and performed all necessary checks. 
                    An official compliance report will be generated with your name as the verifier.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={showVerificationForm ? 'form-buttons' : 'checklist-buttons'}
              className="oioak-POldj-BTn oikau-OOIl"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {showVerificationForm && (
                <button
                  className="CLCLCjm-BNtn"
                  onClick={handleGoBack}
                  disabled={submissionState === 'submitting' || submissionState === 'generating'}
                >
                  <ArrowLeftIcon />
                  Go Back
                </button>
              )}

              {!showVerificationForm ? (
                <button 
                  className="btn-primary-bg" 
                  onClick={handleContinue}
                  disabled={submissionState === 'submitting' || submissionState === 'generating'}
                >
                  Continue
                </button>
              ) : (
                <button
                  className={`btn-primary-bg ${submissionState === 'success' ? 'success-btn' : ''}`}
                  onClick={submissionState === 'success' ? 
                    (hasChanges ? handleSaveChanges : handleViewReport) : 
                    handleSubmit}
                  disabled={submissionState === 'submitting' || submissionState === 'generating'}
                  style={{ position: 'relative' }}
                >
                  {renderSubmitButtonContent()}
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            className="alert-box success"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="success-alert-content">
              <div className="success-text">
                <h3>
                  {hasChanges ? "Changes Saved Successfully!" : "Compliance Check Successful!"}
                </h3>
                <p>
                  {hasChanges 
                    ? "The compliance report has been updated with your changes." 
                    : "The compliance report has been generated with your verification details."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPdfViewer && pdfUrl && (
          <motion.div
            className="pdf-viewer-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pdf-viewer-overlay" onClick={handleCloseViewer}></div>
            <motion.div
              className="pdf-viewer-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="pdf-viewer-header">
                <h3>
                  <DocumentTextIcon className="icon" />
                  Compliance Verification Report
                </h3>
                <div className="pdf-viewer-actions">
                  <button 
                    className="download-btn"
                    onClick={handleDownloadPdf}
                  >
                    <ArrowDownTrayIcon className="icon" />
                    Download
                  </button>
                  <button 
                    className="close-btn"
                    onClick={handleCloseViewer}
                  >
                    <XCircleIcon className="icon" />
                  </button>
                </div>
              </div>
              <div className="pdf-viewer-content">
                <iframe 
                  src={pdfUrl} 
                  title="Compliance Report"
                  width="100%" 
                  height="100%"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="confirmation-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="confirmation-overlay" onClick={() => setShowClearConfirm(false)}></div>
            <motion.div
              className="confirmation-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="confirmation-header">
                <h3>Confirm Clear Data</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowClearConfirm(false)}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
              <div className="confirmation-body">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <ExclamationTriangleIcon className="w-10 h-10 text-yellow-500" />
                </motion.div>
                <p>Are you sure you want to clear all verification data? This action cannot be undone. All checks, form data, and the generated report will be permanently removed.</p>
              </div>
              <div className="oioak-POldj-BTn clOIkka-BBBTn" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  className="CLCLCjm-BNtn"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary-bg"
                  onClick={handleClearData}
                >
                  Confirm Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicantDocumentCheck;