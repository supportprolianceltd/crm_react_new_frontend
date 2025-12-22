import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownIcon,
  BarsArrowDownIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCarePlanByClient, updateCarePlan } from "../../../../config/apiConfig";

const MedicationScheduler = ({ clientData }) => {
  // clientData is passed from the Profile parent (persisted in location.state)
  // Log it so we can confirm the prop is received when navigating to this page
  // clientData is provided by the parent; no logging in production

  // Load medications from the client's care plan (if present)
  useEffect(() => {
    let mounted = true;
    const loadFromCarePlan = async () => {
      const clientId = clientData?.id;
      if (!clientId) return;
      try {
        const data = await fetchCarePlanByClient(clientId);
        // support multiple response shapes
        let plan = null;
        if (Array.isArray(data)) plan = data[0];
        else if (data?.results?.length) plan = data.results[0];
        else if (data?.items?.length) plan = data.items[0];
        else plan = data;

        const meds = plan?.medicalInfo?.medications || [];
        // map backend meds to table shape used by this component
        const mapped = (meds || []).map((m) => ({
          medication: m.drugName || m.name || "",
          support: plan?.medicalInfo?.medicalSupport ? "Assist" : "Independent",
          type: "",
          dosage: m.dosage || "",
          route: "",
          frequency: m.frequency ? String(m.frequency) : "",
          timeSlots: [],
          timeDetails: {},
          startDate: "",
          endDate: "",
          created: new Date().toLocaleDateString('en-US'),
          createdBy: "",
        }));

        if (mounted) {
          setCarePlanFull(plan || null);
          setCarePlanId(plan?.id || plan?.carePlanId || plan?._id || null);
          if (mapped.length > 0) {
            setMedications(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load care plan medications:", err);
      }
    };
    loadFromCarePlan();
    return () => { mounted = false; };
  }, [clientData]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [riskCategory, setRiskCategory] = useState('falls');
  const [otherRiskText, setOtherRiskText] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTimeType, setEndTimeType] = useState('recurring');
  const [editIndex, setEditIndex] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const dropdownRef = useRef(null);

  // New states for medication selection
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

  // State for medications table
  const [medications, setMedications] = useState([]);
  const [carePlanFull, setCarePlanFull] = useState(null);
  const [carePlanId, setCarePlanId] = useState(null);

  // Form states
  const [support, setSupport] = useState('Assist');
  const [type, setType] = useState('');
  const [dosage, setDosage] = useState('');
  const [route, setRoute] = useState('');
  const [dailyFrequency, setDailyFrequency] = useState('');
  const [timesPerDay, setTimesPerDay] = useState(0);
  const [timingType, setTimingType] = useState('Time Period');

  // State for time slots checkboxes
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [timeRanges, setTimeRanges] = useState({});
  const [expandedSlots, setExpandedSlots] = useState({});

  // Alert states
  const [successAlert, setSuccessAlert] = useState({ show: false, title: '', updated: false });
  const [errorAlert, setErrorAlert] = useState({ show: false, message: '' });

  const API_KEY = 'YOUR_NHS_API_KEY_HERE'; // Replace with your actual NHS API subscription key from https://digital.nhs.uk/developer

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hide alerts after 3 seconds
  useEffect(() => {
    if (successAlert.show) {
      const timer = setTimeout(() => {
        setSuccessAlert({ show: false, title: '', updated: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successAlert.show]);

  useEffect(() => {
    if (errorAlert.show) {
      const timer = setTimeout(() => {
        setErrorAlert({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorAlert.show]);

  const handleItemClick = () => {
    setIsFilterOpen(false); // Close dropdown when clicking an item
  };

  const handleFrequencyChange = (val) => {
    setFrequency(val);
  };

  // Mock data for testing (replace with real API once key is set)
  const mockMedicines = [
    { title: 'Paracetamol', description: 'Painkiller for mild to moderate pain.' },
    { title: 'Ibuprofen', description: 'Anti-inflammatory for pain and fever.' },
    { title: 'Aspirin', description: 'Pain relief and anti-inflammatory.' },
    { title: 'Aciclovir (Zovirax)', description: 'Treats cold sores and herpes.' },
    { title: 'Acrivastine', description: 'Antihistamine for allergies.' },
    { title: 'Adalimumab', description: 'For rheumatoid arthritis and psoriasis.' },
    { title: 'Alendronic acid', description: 'Treats osteoporosis.' },
    { title: 'Allopurinol', description: 'Prevents gout attacks.' },
    { title: 'Alogliptin', description: 'For type 2 diabetes.' },
    { title: 'Amitriptyline for depression', description: 'Antidepressant.' },
    { title: 'Amitriptyline for pain and migraine', description: 'Pain relief.' },
    { title: 'Amoxicillin', description: 'Antibiotic for bacterial infections.' },
    { title: 'Apixaban', description: 'Blood thinner to prevent clots.' },
    { title: 'Aripiprazole', description: 'For schizophrenia and bipolar.' },
    { title: 'Atenolol', description: 'Beta-blocker for high blood pressure.' },
    { title: 'Atorvastatin', description: 'Cholesterol-lowering statin.' },
    { title: 'Azelastine eye drops', description: 'For allergic conjunctivitis.' },
    { title: 'Azelastine nasal spray', description: 'For allergic rhinitis.' },
    { title: 'Beclometasone inhaler', description: 'For asthma.' },
    { title: 'Bendroflumethiazide', description: 'Diuretic for high blood pressure.' },
  ];

  // Fetch medicines from NHS API (first page for simplicity; extend for full pagination if needed)
  const fetchMedicines = async (page = 1) => {
    if (API_KEY === 'YOUR_NHS_API_KEY_HERE') {
      console.warn('Using mock data because API key is not set. Register at https://digital.nhs.uk/developer to get a key.');
      setMedicines(mockMedicines);
      setIsLoadingMedicines(false);
      return;
    }

    setIsLoadingMedicines(true);
    try {
      const response = await fetch(`https://api.service.nhs.uk/nhs-website-content/medicines?page=${page}`, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': API_KEY,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      // Assuming response has 'links' array with medicine objects { title, url, description }
      setMedicines(data.links || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      // Fallback to mock data on error
      setMedicines(mockMedicines);
    } finally {
      setIsLoadingMedicines(false);
    }
  };

  // Fetch medicines when modal opens
  useEffect(() => {
    if (open) {
      fetchMedicines(1); // Fetch first page
    }
  }, [open]);

  // Handle search filter (client-side since API lacks built-in search)
  const filteredMedicines = medicines.filter(med =>
    med.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parseDate = (dateStr) => {
    if (!dateStr) return '';
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const parseFrequency = (freq) => {
    if (!freq || freq === 'Not specified') return { dailyFrequency: '', timesPerDay: 0 };
    const lower = freq.toLowerCase();
    let times = 1;
    if (lower.includes('once daily')) times = 1;
    else if (lower.includes('twice daily')) times = 2;
    else if (lower.includes('three times daily')) times = 3;
    else {
      const match = lower.match(/(\d+)\s*times?\s*daily/i);
      if (match) times = parseInt(match[1]);
    }
    const dailyFrequency = times === 1 ? 'Daily' : 'Custom';
    return { dailyFrequency, timesPerDay: times };
  };

  const getFrequencyText = (times) => {
    if (!times) return 'Not specified';
    if (times === 1) return 'Once daily';
    if (times === 2) return 'Twice daily';
    if (times === 3) return 'Three times daily';
    return `${times} times daily`;
  };

  const getTimeRange = (slot) => {
    const ranges = {
      Morning: '6:00 AM - 11:14 AM',
      Lunch: '11:14 AM - 2:00 PM',
      Afternoon: '2:00 PM - 6:00 PM',
      Night: '6:00 PM - 10:00 PM',
      Evening: '6:00 PM - 10:00 PM',
    };
    return ranges[slot] || '';
  };

  const getCurrentRange = (slot) => {
    const slotTimes = timeRanges[slot];
    if (slotTimes?.startTime && slotTimes?.endTime) {
      return `${slotTimes.startTime} - ${slotTimes.endTime}`;
    }
    return '';
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRiskCategory('falls');
    setOtherRiskText('');
    setFrequency('once');
    setStartDate('');
    setEndDate('');
    setEndTimeType('recurring');
    setSelectedMedication('');
    setSearchTerm('');
    setSupport('Assist');
    setType('');
    setDosage('');
    setRoute('');
    setDailyFrequency('');
    setTimesPerDay(0);
    setTimingType('Time Period');
    setSelectedTimeSlots([]);
    setTimeRanges({});
    setExpandedSlots({});
    setIsDirty(false);
  };

  const handleAddNew = () => {
    setEditIndex(null);
    resetForm();
    setOpen(true);
  };

  const handleEdit = (index) => {
    const med = medications[index];
    setEditIndex(index);
    setSelectedMedication(med.medication);
    setSearchTerm(med.medication);
    setSupport(med.support);
    setType(med.type);
    setDosage(med.dosage);
    setRoute(med.route);
    const { dailyFrequency, timesPerDay } = parseFrequency(med.frequency);
    setDailyFrequency(dailyFrequency);
    setTimesPerDay(timesPerDay);
    setStartDate(parseDate(med.startDate));
    setEndDate(parseDate(med.endDate));
    setSelectedTimeSlots(med.timeSlots || []);
    const newTimeRanges = med.timeDetails || {};
    const newExpanded = {};
    Object.keys(newTimeRanges).forEach(slot => {
      newExpanded[slot] = !(newTimeRanges[slot].startTime && newTimeRanges[slot].endTime);
    });
    setTimeRanges(newTimeRanges);
    setExpandedSlots(newExpanded);
    setIsDirty(false);
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMedication) {
      setErrorAlert({ show: true, message: 'Please select a medication' });
      return;
    }
    if (!support || !type || !dosage || !route || !dailyFrequency || (dailyFrequency === 'Custom' && timesPerDay === 0) || selectedTimeSlots.length === 0) {
      setErrorAlert({ show: true, message: 'Please fill in all required fields' });
      return;
    }
    if (selectedTimeSlots.length > 0 && (!startDate || !endDate)) {
      setErrorAlert({ show: true, message: 'Please select start and end dates for the medication schedule' });
      return;
    }

    if (saving) return; // prevent duplicate submits
    setSaving(true);

    const formattedStartDate = startDate ? new Date(startDate).toISOString() : null;
    const formattedEndDate = endDate ? new Date(endDate).toISOString() : null;

    // Build the minimal medication object the backend expects
    // Only include the fields required by the API to persist the medication
    const backendMed = {
      tenantId: carePlanFull?.tenantId || undefined,
      medicalInfoId: carePlanFull?.medicalInfo?.id || carePlanFull?.medicalInfo?.medicalInfoId || undefined,
      drugName: selectedMedication,
      dosage,
      frequency: getFrequencyText(timesPerDay),
    };

    try {
      if (carePlanId && carePlanFull) {
        const existing = carePlanFull?.medicalInfo?.medications || [];
        const updatedMeds = [...existing, backendMed];
        const patchData = { medicalInfo: { ...(carePlanFull.medicalInfo || {}), medications: updatedMeds } };

        const updatedPlan = await updateCarePlan(carePlanId, patchData);
        // update local state from returned plan
        setCarePlanFull(updatedPlan || null);
        const newMeds = (updatedPlan?.medicalInfo?.medications || []).map((m) => ({
          medication: m.drugName || m.name || '',
          support: updatedPlan?.medicalInfo?.medicalSupport ? 'Assist' : 'Independent',
          type: m.type || '',
          dosage: m.dosage || '',
          route: m.route || '',
          frequency: m.frequency ? String(m.frequency) : getFrequencyText(timesPerDay),
          timeSlots: m.timeSlots || [],
          timeDetails: m.timeDetails || {},
          startDate: m.startDate ? new Date(m.startDate).toLocaleDateString('en-US') : '',
          endDate: m.endDate ? new Date(m.endDate).toLocaleDateString('en-US') : '',
          created: new Date().toLocaleDateString('en-US'),
          createdBy: m.createdBy || '',
        }));

        setMedications(newMeds);
        setSuccessAlert({ show: true, title: selectedMedication, updated: false });
      } else {
        // No care plan to patch - fallback to local-only update
        const newMed = {
          medication: selectedMedication,
          support,
          type,
          dosage,
          route,
          frequency: getFrequencyText(timesPerDay),
          timeSlots: selectedTimeSlots,
          timeDetails: timeRanges,
          startDate: formattedStartDate ? new Date(formattedStartDate).toLocaleDateString('en-US') : '',
          endDate: formattedEndDate ? new Date(formattedEndDate).toLocaleDateString('en-US') : '',
          created: new Date().toLocaleDateString('en-US'),
          createdBy: 'Unknown'
        };
        if (editIndex !== null) {
          setMedications(prev => {
            const newMeds = [...prev];
            newMeds[editIndex] = { ...newMeds[editIndex], ...newMed };
            return newMeds;
          });
          setSuccessAlert({ show: true, title: selectedMedication, updated: true });
        } else {
          setMedications(prev => [...prev, newMed]);
          setSuccessAlert({ show: true, title: selectedMedication, updated: false });
        }
      }
    } catch (err) {
      console.error('Failed to append medication to care plan:', err);
      setErrorAlert({ show: true, message: 'Failed to save medication. Try again.' });
    } finally {
      setSaving(false);
      setOpen(false);
      setEditIndex(null);
      resetForm();
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setEditIndex(null);
    resetForm();
  };

  const handleTimeSlotChange = (slot, checked) => {
    if (checked) {
      setSelectedTimeSlots(prev => [...prev, slot]);
      setTimeRanges(prev => ({...prev, [slot]: {startTime: '', endTime: ''}}));
      setExpandedSlots(prev => ({...prev, [slot]: true}));
    } else {
      setSelectedTimeSlots(prev => prev.filter(s => s !== slot));
      setTimeRanges(prev => { 
        const newRanges = {...prev}; 
        delete newRanges[slot]; 
        return newRanges; 
      });
      setExpandedSlots(prev => { 
        const newExpanded = {...prev}; 
        delete newExpanded[slot]; 
        return newExpanded; 
      });
    }
    if (editIndex !== null) setIsDirty(true);
  };

  const handleStartTimeChange = (slot, value) => {
    setTimeRanges(prev => ({...prev, [slot]: {...prev[slot], startTime: value}}));
    if (value && prev[slot]?.endTime) {
      setExpandedSlots(prevExpanded => ({...prevExpanded, [slot]: false}));
    }
    if (editIndex !== null) setIsDirty(true);
  };

  const handleEndTimeChange = (slot, value) => {
    setTimeRanges(prev => ({...prev, [slot]: {...prev[slot], endTime: value}}));
    if (prev[slot]?.startTime && value) {
      setExpandedSlots(prevExpanded => ({...prevExpanded, [slot]: false}));
    }
    if (editIndex !== null) setIsDirty(true);
  };

  const toggleSlotExpansion = (slot) => {
    setExpandedSlots(prev => ({...prev, [slot]: !prev[slot]}));
    if (editIndex !== null) setIsDirty(true);
  };

  const handleDailyFrequencyChange = (e) => {
    const value = e.target.value;
    setDailyFrequency(value);
    if (value === 'Daily') {
      setTimesPerDay(1);
    }
    if (editIndex !== null) setIsDirty(true);
  };

  const handleFormChange = () => {
    if (editIndex !== null) setIsDirty(true);
  };

  const filters = ["Once Daily", "Twice Daily", "Subcutaneous"];

  const isMuted = editIndex !== null && !isDirty;


    const navigate = useNavigate();

  const goBack = () => navigate(-1);

  return (
    <div className="GenReq-Page Meddi-Ppage">
        <div className='DDD-PPLso-1-Top'>
                  <span
                    role='button'
                    tabIndex={0}
                    onClick={goBack}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goBack(); }}
                  ><ArrowLeftIcon /> Go Back</span>
                </div>

      <div className="GHGb-MMIn-DDahs-Top KKm-Hheaders">
        <h3>Medication Scheduler</h3>
        <button className="GenFlt-BTn btn-primary-bg" onClick={handleAddNew}>
          <PlusIcon /> Add Medication
        </button>
      </div>

      <div className="PPOl-COnt">
        <div className="PPOlaj-SSde-TopSSUB">
          {/* Search */}
          <div className="oIK-Search">
            <span>
              <MagnifyingGlassIcon />
            </span>
            <input type="text" placeholder="Search item" />
          </div>

          {/* Sort + Filter */}
          <div className="oIK-Btns">
            <div className="dropdown-container">
              <button>
                Sort by: Frequency
                <ArrowDownIcon />
              </button>
            </div>

            {/* Filter Dropdown */}
            <div
              className="dropdown-container"
              style={{ position: "relative" }}
              ref={dropdownRef}
            >
              <button className="LLl-BBtn-ACCt" onClick={toggleFilter}>
                Filters <BarsArrowDownIcon />
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.ul
                    className="dropdown-menu ooko-drooap"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                      overflow: "hidden",
                      position: "absolute",
                      top: "100%",
                    }}
                  >
                    {filters.map((filter) => (
                      <li
                        key={filter}
                        className="dropdown-item"
                        onClick={handleItemClick}
                      >
                        <span>{filter}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

           <div className="table-container Absoluted-Tbd" style={{ paddingBottom: "5rem" }}>
               <table>
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Support</th>
                  <th>Type</th>
                  <th>Dosage</th>
                  <th>Route</th>
                  <th>Frequency</th>
                  <th>Time Slots</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Created</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {medications.length === 0 ? (
                  <tr className="monn-Ntga">
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2rem' }}>
                      No medications added yet.
                    </td>
                  </tr>
                ) : (
                  medications.map((med, index) => (
                    <tr key={index} onClick={() => handleEdit(index)} style={{ cursor: 'pointer' }}>
                      <td>{med.medication}</td>
                      <td>{med.support}</td>
                      <td>{med.type}</td>
                      <td>{med.dosage}</td>
                      <td>{med.route}</td>
                      <td>{med.frequency}</td>
                      <td>{(med.timeSlots || []).join(', ')}</td>
                      <td>{med.startDate}</td>
                      <td>{med.endDate}</td>
                      <td>{med.created}</td>
                      <td>{med.createdBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>

          </div>


      </div>

      {/* global success alert */}
      <AnimatePresence>
        {successAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className='global-task-success-alert'
          >
            <div>{successAlert.updated ? 'Successfully updated:' : 'Successfully added:'} <strong>{successAlert.title}</strong></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* global error alert */}
      <AnimatePresence>
        {errorAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className='global-task-error-alert'
          >
            <div>{errorAlert.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className='add-task-backdrop'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className='add-task-panel'
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className='TTas-Boxxs custom-scroll-bar'>
                    <div className='TTas-Boxxs-Top'>
                      <h4>{editIndex !== null ? 'Edit Medication' : 'Add Medication'}</h4>
                      <p>View and manage the client’s current and past medications to support accurate and timely administration</p>
                    </div>

                    

                <div className='TTas-Boxxs-Body'>
                  <form onSubmit={handleSave} className='add-task-form'>

                       <div className="Info-Palt-Main No-Grid OOksl-Pls">
                       <div className="Info-TTb-BS-HYH">
                          <p>Add Medication</p>
                           <h5 className="oola-Hrra">Search the NHS <a href="#">medicines database</a> below</h5>
                           <div className="TTtata-Inputcc">
                            {/* Integrated NHS Medicines Search */}
                            <div className="genn-Drop-Search">
                              <span>
                                <MagnifyingGlassIcon />
                              </span>
                            <input 
                              type="text" 
                              placeholder="Search for medication from NHS database..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            </div>
                            {isLoadingMedicines ? (
                              <p>Loading medicines...</p>
                            ) : (
                              <ul className="custom-scroll-bar OOkl-ULLI">
                                {filteredMedicines.length > 0 ? (
                                  filteredMedicines.map((med) => (
                                    <li
                                      key={med.title || med.url}
                                      onClick={() => {
                                        setSelectedMedication(med.title);
                                        setSearchTerm(med.title);
                                        if (editIndex !== null) setIsDirty(true);
                                      }}
                                      style={{
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: selectedMedication === med.title ? '#ece8fd' : 'transparent'
                                      }}
                                    >
                                      {med.title} {med.description ? ` - ${med.description}` : ''}
                                    </li>
                                  ))
                                ) : searchTerm ? (
                                  <li>No matching medicines found.</li>
                                ) : (
                                  <li>Start typing to search or wait for list to load.</li>
                                )}
                              </ul>
                            )}
                            {/* {selectedMedication && (
                              <p className="slelct-PPsgbaMed">
                                <span>Selected:</span> <strong>{selectedMedication}</strong>
                              </p>
                            )} */}
                            </div>
                            </div>
                          </div>


                     <div className="Info-Palt-Main No-Grid OOksl-Pls">
                       <div className="Info-TTb-BS-HYH">
                          <p>Support</p>
                          <h5>Choose whether the client takes medication independently, with supervision, or needs full support</h5>
                           <div className="TTtata-Input">
                              <select value={support} onChange={(e) => { setSupport(e.target.value); handleFormChange(); }}>
                               <option>Assist</option>
                               <option>Administer</option>
                              </select>
                            </div>
                            <h5><InformationCircleIcon /> <span>If you’re unsure, we recommend using the <a href="#">COC’s guidance</a> on medicine</span></h5>
                            </div>
                          </div>

                    <div className="Info-Palt-Main No-Grid OOksl-Pls">
                       <div className="Info-TTb-BS-HYH">
                          <p>Type</p>
                          <h5>What type of prescription is this?</h5>
                               <div className='TTtata-Selltss-LInBt'>
                        <label>
                          <input
                            type='radio'
                            name="type"
                            value="Scheduled"
                            checked={type === 'Scheduled'}
                            onChange={(e) => { setType(e.target.value); handleFormChange(); }}
                          />
                         Scheduled
                        </label>

                        <label>
                          <input
                            type='radio'
                            name="type"
                            value="PRN"
                            checked={type === 'PRN'}
                            onChange={(e) => { setType(e.target.value); handleFormChange(); }}
                          />
                          PRN
                        </label>

                        <label>
                          <input
                            type='radio'
                            name="type"
                            value="Blister Pack"
                            checked={type === 'Blister Pack'}
                            onChange={(e) => { setType(e.target.value); handleFormChange(); }}
                          />
                         Blister Pack
                        </label>
                      </div>
                          </div>
                          </div>


                             <div className="Info-Palt-Main No-Grid OOksl-Pls">
                       <div className="Info-TTb-BS-HYH">
                          <p>Dosage</p>
                          <h5>What is the dosage for this prescription?</h5>
                               <div className='TTtata-Selltss-LInBt'>
                        <label>
                          <input
                            type='radio'
                            name="dosage"
                            value="Quantity"
                            checked={dosage === 'Quantity'}
                            onChange={(e) => { setDosage(e.target.value); handleFormChange(); }}
                          />
                        Quantity
                        </label>

                        <label>
                          <input
                            type='radio'
                            name="dosage"
                            value="Range"
                            checked={dosage === 'Range'}
                            onChange={(e) => { setDosage(e.target.value); handleFormChange(); }}
                          />
                          Range
                        </label>

                        <label>
                          <input
                            type='radio'
                            name="dosage"
                            value="Other"
                            checked={dosage === 'Other'}
                            onChange={(e) => { setDosage(e.target.value); handleFormChange(); }}
                          />
                        Other
                        </label>
                      </div>
                          </div>
                          </div>





                             <div className="Info-Palt-Main No-Grid OOksl-Pls">
                       <div className="Info-TTb-BS-HYH">
                          <p>Route</p>
                          <h5>What is the route for this administration?</h5>
                               <div className='TTtata-Selltss-LInBt'>
                        <label>
                          <input
                            type='radio'
                            name="route"
                            value="Oral"
                            checked={route === 'Oral'}
                            onChange={(e) => { setRoute(e.target.value); handleFormChange(); }}
                          />
                        Oral
                        </label>

                        <label>
                          <input
                            type='radio'
                            name="route"
                            value="Other"
                            checked={route === 'Other'}
                            onChange={(e) => { setRoute(e.target.value); handleFormChange(); }}
                          />
                          Other
                        </label>

                      </div>
                          </div>
                          </div>



                          
                             <div className="Info-Palt-Main No-Grid OOksl-Pls">
                       <div className="Info-TTb-BS-HYH">
                          <p>Frequency</p>
                          <h5>How often is this medication taken? </h5>
                               <div className='TTtata-Selltss-LInBt'>
                        <label>
                          <input
                            type='radio'
                            name="dailyFrequency"
                            value="Daily"
                            checked={dailyFrequency === 'Daily'}
                            onChange={handleDailyFrequencyChange}
                          />
                         Daily
                        </label>

                        <label>
                          <input
                            type='radio'
                            name="dailyFrequency"
                            value="Custom"
                            checked={dailyFrequency === 'Custom'}
                            onChange={handleDailyFrequencyChange}
                          />
                         Custom
                        </label>
                      </div>
                          </div>

                          <AnimatePresence>
                            {dailyFrequency === 'Custom' && (
                              <motion.div
                                className="Info-TTb-BS-HYH"
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                layout
                              >
                          <h5>How many times per day? </h5>
                               <div className='TTtata-Selltss-LInBt'>
                        <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={1}
                            checked={timesPerDay === 1}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                         1
                        </label>

                        <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={2}
                            checked={timesPerDay === 2}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                         2
                        </label>

                         <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={3}
                            checked={timesPerDay === 3}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                         3
                        </label>

                         <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={4}
                            checked={timesPerDay === 4}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                        4
                        </label>

                         <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={5}
                            checked={timesPerDay === 5}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                        5
                        </label>

                         <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={6}
                            checked={timesPerDay === 6}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                         6
                        </label>

                         <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={7}
                            checked={timesPerDay === 7}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                         7
                        </label>

                         <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={8}
                            checked={timesPerDay === 8}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                         8
                        </label>

                         <label>
                          <input
                            type='radio'
                            name="timesPerDay"
                            value={9}
                            checked={timesPerDay === 9}
                            onChange={(e) => { setTimesPerDay(Number(e.target.value)); handleFormChange(); }}
                          />
                         9
                        </label>
                      </div>
                          </motion.div>
                            )}
                          </AnimatePresence>

                          </div>



                          
                     <div className="Info-Palt-Main No-Grid OOksl-Pls">
                       <div className="Info-TTb-BS-HYH">
                          <p>Medication Schedule</p>
                          <h5>Select Preferred timing</h5>
                           <div className="TTtata-Input">
                              <select value={timingType} onChange={(e) => { setTimingType(e.target.value); handleFormChange(); }}>
                               <option>Time Period</option>
                               <option>Exact Time</option>
                              </select>
                            </div>
                            </div>

                              <div className="Info-TTb-BS-HYH">
                          <h5>Select applicable time slots (e.g., for twice-daily, select two)</h5>
                            <div className="TTtata-Selltss-LInBt">
                              <label>
                                <input 
                                  type="checkbox" 
                                  value="Morning"
                                  checked={selectedTimeSlots.includes('Morning')}
                                  onChange={(e) => handleTimeSlotChange('Morning', e.target.checked)}
                                />
                                Morning
                                </label>
                                <label>
                                <input 
                                  type="checkbox" 
                                  value="Lunch"
                                  checked={selectedTimeSlots.includes('Lunch')}
                                  onChange={(e) => handleTimeSlotChange('Lunch', e.target.checked)}
                                />
                                Lunch
                                </label>
                                <label>
                                <input 
                                  type="checkbox" 
                                  value="Afternoon"
                                  checked={selectedTimeSlots.includes('Afternoon')}
                                  onChange={(e) => handleTimeSlotChange('Afternoon', e.target.checked)}
                                />
                                Afternoon
                                </label>
                                <label>
                                <input 
                                  type="checkbox" 
                                  value="Night"
                                  checked={selectedTimeSlots.includes('Night')}
                                  onChange={(e) => handleTimeSlotChange('Night', e.target.checked)}
                                />
                                Night
                                </label>
                                <label>
                                <input 
                                  type="checkbox" 
                                  value="Evening"
                                  checked={selectedTimeSlots.includes('Evening')}
                                  onChange={(e) => handleTimeSlotChange('Evening', e.target.checked)}
                                />
                                Evening
                                </label>
                            </div>
                            </div>

                              <AnimatePresence>
                                {selectedTimeSlots.map((slot) => (
                                  <motion.div
                                    key={slot}
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    layout
                                  >
                                    <div className="Info-TTb-BS-HYH">
                                       <h5 
                                         className="RRagbs-Plsa"
                                         onClick={() => toggleSlotExpansion(slot)}
                                         style={{ cursor: 'pointer' }}
                                       >
                                        {slot}{getCurrentRange(slot) ? `: ${getCurrentRange(slot)}` : ''}
                                       </h5>
                                    </div>

                                    <AnimatePresence>
                                      {expandedSlots[slot] && (
                                        <motion.div
                                          className="ggllak-Ppaths"
                                          initial={{ opacity: 0, height: 0, y: -10 }}
                                          animate={{ opacity: 1, height: "auto", y: 0 }}
                                          exit={{ opacity: 0, height: 0, y: -10 }}
                                          transition={{ duration: 0.3, ease: "easeInOut" }}
                                          layout
                                        >
                                          <div className="Info-TTb-BS-HYH">
                                            <h5>Start Time</h5>
                                            <div className="TTtata-Input">
                                              <input 
                                                type="time" 
                                                value={timeRanges[slot]?.startTime || ''} 
                                                onChange={(e) => handleStartTimeChange(slot, e.target.value)}
                                              />
                                            </div>
                                          </div>

                                          <div className="Info-TTb-BS-HYH">
                                            <h5>End Time</h5>
                                            <div className="TTtata-Input">
                                              <input 
                                                type="time" 
                                                value={timeRanges[slot]?.endTime || ''} 
                                                onChange={(e) => handleEndTimeChange(slot, e.target.value)}
                                              />
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                ))}
                              </AnimatePresence>

                            <AnimatePresence>
                              <motion.div
                                className="ggllak-Ppaths"
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                layout
                              >
                               <div className="Info-TTb-BS-HYH">
                          <h5>First Dosage</h5>
                            <div className="TTtata-Input">
                              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); handleFormChange(); }} />
                            </div>
                            </div>


                               <div className="Info-TTb-BS-HYH">
                          <h5>Last Dosage</h5>
                            <div className="TTtata-Input">
                              <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); handleFormChange(); }} />
                            </div>
                            </div>
                            </motion.div>
                            </AnimatePresence>

                          </div>

                          
              <div className="Info-Palt-Main No-Grid OOksl-Pls">
                                   <div className='TTtata-Selltss OOksl-Pls'>
                      <h4>Care Visit</h4>

                            <div className="TTtata-Selltss-LInBt">
                              <label>
                                <input type="checkbox" />
                                Add  to Care Visit
                              </label>
                             
                            </div>
                    </div>


                    </div>





           

                    <div className='add-task-actions'>
                      <button type='button' className='close-task' onClick={handleCancel}>Cancel</button>
                      <button type='submit' className={`proceed-tast-btn btn-primary-bg ${isMuted ? 'muted' : ''}`} disabled={isMuted}>
                        {saving ? (
                          <>
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              style={{
                                width: 15,
                                height: 15,
                                borderRadius: "50%",
                                border: "3px solid #fff",
                                borderTopColor: "transparent",
                                marginRight: "5px",
                                display: "inline-block",
                              }}
                            />
                            Adding..
                          </>
                        ) : (editIndex !== null ? 'Save changes' : 'Add Medication')}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicationScheduler;