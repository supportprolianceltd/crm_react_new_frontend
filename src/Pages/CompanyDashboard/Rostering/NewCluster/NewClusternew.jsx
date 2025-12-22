import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import './NewCluster.css';
import {
  MapPinIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  BarsArrowDownIcon,
  ChevronDownIcon,
  CheckIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { IconCaretDown } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import TomTomMap from './TomTomMap/TomTomMap';
import useSearchPostcode from '../../../../hooks/useSearchPostcode';

import ClusTImg from './Img/location-icon.png';

const initialClusters = [
  { id: 1, name: "Central London Cluster", region: "Central London", postcode: "SW1A 1AA", coords: [-0.141563, 51.50101], description: "Cluster for central London area" },
  { id: 2, name: "Westminster Cluster", region: "Westminster", postcode: "W1A 0AX", coords: [-0.143774, 51.518563], description: "Cluster for Westminster area" },
  { id: 3, name: "Camden Cluster", region: "Camden", postcode: "NW1 1AA", coords: [-0.135405, 51.530786], description: "Cluster for Camden area" },
  { id: 4, name: "Islington Cluster", region: "Islington", postcode: "N1 9GU", coords: [-0.121668, 51.534911], description: "Cluster for Islington area" },
  { id: 5, name: "Hackney Cluster", region: "Hackney", postcode: "E8 1GQ", coords: [-0.05607, 51.544479], description: "Cluster for Hackney area" },
  { id: 6, name: "Chelsea Cluster", region: "Chelsea", postcode: "SW3 5XP", coords: [-0.166776, 51.488493], description: "Cluster for Chelsea area" },
  { id: 7, name: "Kensington Cluster", region: "Kensington", postcode: "W8 5TT", coords: [-0.191128, 51.501371], description: "Cluster for Kensington area" },
  { id: 8, name: "Southwark Cluster", region: "Southwark", postcode: "SE1 9SG", coords: [-0.087625, 51.504963], description: "Cluster for Southwark area" },
  { id: 9, name: "Greenwich Cluster", region: "Greenwich", postcode: "SE10 9NN", coords: [-0.007809, 51.482186], description: "Cluster for Greenwich area" },
  { id: 10, name: "Hammersmith Cluster", region: "Hammersmith", postcode: "W6 9JU", coords: [-0.234114, 51.491514], description: "Cluster for Hammersmith area" },
];

// Lists for generating client names
const clientFirstNames = [
  'Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
  'Katherine', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rose', 'Sam', 'Tina',
  'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zoe', 'Aaron', 'Bella', 'Chris', 'Diana'
];

const clientSurnames = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Johnson',
  'Roberts', 'Robinson', 'Thompson', 'Wright', 'Walker', 'White', 'Hall', 'Green', 'Lewis', 'Harris',
  'Clarke', 'Patel', 'Jackson', 'Wood', 'Turner', 'King', 'Barnes', 'Lee', 'Allen', 'Young'
];

// Sample caretakers with real UK names (without images)
const caretakerData = [
  {
    name: "Emma Davies",
    role: "Senior Care Coordinator",
    specialty: "Elderly Care",
    maxClients: 8,
    transportation: "Private Car",
  },
  {
    name: "Oliver Taylor",
    role: "Community Nurse",
    specialty: "Mobility Support",
    maxClients: 6,
    transportation: "Private Car",
  },
  {
    name: "Amelia Brown",
    role: "Healthcare Assistant",
    specialty: "Daily Living Support",
    maxClients: 5,
    transportation: "Public Transportation",
  },
  {
    name: "Noah Wilson",
    role: "Clinical Specialist",
    specialty: "Complex Care",
    maxClients: 4,
    transportation: "Private Car",
  },
  {
    name: "Isla Evans",
    role: "Support Worker",
    specialty: "Dementia Care",
    maxClients: 7,
    transportation: "Walking",
  },
  {
    name: "Jack Thomas",
    role: "Occupational Therapist",
    specialty: "Rehabilitation",
    maxClients: 5,
    transportation: "Private Car",
  },
  {
    name: "Ava Johnson",
    role: "Care Assistant",
    specialty: "Personal Care",
    maxClients: 6,
    transportation: "Private Car",
  },
  {
    name: "Harry Roberts",
    role: "Support Coordinator",
    specialty: "Mental Health",
    maxClients: 5,
    transportation: "Public Transportation",
  },
  {
    name: "Willow Robinson",
    role: "Healthcare Worker",
    specialty: "Palliative Care",
    maxClients: 4,
    transportation: "Private Car",
  },
  {
    name: "Freya Walker",
    role: "Care Manager",
    specialty: "Home Care",
    maxClients: 6,
    transportation: "Walking",
  },
  {
    name: "Luca Wright",
    role: "Nurse Practitioner",
    specialty: "Wound Care",
    maxClients: 5,
    transportation: "Private Car",
  },
  {
    name: "Poppy White",
    role: "Social Worker",
    specialty: "Family Support",
    maxClients: 7,
    transportation: "Public Transportation",
  },
];

const NewCluster = () => {
  const [clusters, setClusters] = useState(initialClusters);
  const [allClients, setAllClients] = useState([]);
  const [allCarers, setAllCarers] = useState([]);
  const clientIndexRef = useRef(0);
  const carerIndexRef = useRef(0);
  const [activeClusterId, setActiveClusterId] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [currentView, setCurrentView] = useState("clients");

  // Table states
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(["active", "inactive"]);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("");

  // Cluster dropdown state
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);

  // Postcode dropdown state
  const [showPostcodeDropdown, setShowPostcodeDropdown] = useState(false);
  const [selectedPostcode, setSelectedPostcode] = useState("all");

  // Modal states for create
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [clusterRegion, setClusterRegion] = useState("");
  const [clusterPostcode, setClusterPostcode] = useState("");
  const [clusterName, setClusterName] = useState("");
  const [clusterDescription, setClusterDescription] = useState("");
  const [clusterLat, setClusterLat] = useState(null);
  const [clusterLon, setClusterLon] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states for edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editClusterRegion, setEditClusterRegion] = useState("");
  const [editClusterPostcode, setEditClusterPostcode] = useState("");
  const [editClusterName, setEditClusterName] = useState("");
  const [editClusterDescription, setEditClusterDescription] = useState("");
  const [editClusterLat, setEditClusterLat] = useState(null);
  const [editClusterLon, setEditClusterLon] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modal states for delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [deleteSearchTerm, setDeleteSearchTerm] = useState("");

  // Address autocomplete hooks
  const {
    suggestions: createSuggestions,
    showSuggestions: createShowSuggestions,
    handleAddressInputChange: handleCreateAddressChange,
    handleSuggestionSelect: handleCreateSuggestionSelect,
    handleBlur: handleCreateBlur,
  } = useSearchPostcode();
  const {
    suggestions: editSuggestions,
    showSuggestions: editShowSuggestions,
    handleAddressInputChange: handleEditAddressChange,
    handleSuggestionSelect: handleEditSuggestionSelect,
    handleBlur: handleEditBlur,
  } = useSearchPostcode();

  const timeRangeDetails = useMemo(() => ({
    Morning: "6:00 AM – 12:00 PM",
    Afternoon: "12:00 PM – 5:00 PM",
    Evening: "5:00 PM – 9:00 PM",
    Night: "9:00 PM – 6:00 AM",
  }), []);

  const timeRanges = useMemo(() => ["All", "Morning", "Afternoon", "Evening", "Night"], []);

  // Unique postcodes for dropdown
  const uniquePostcodes = useMemo(() => {
    const postcodes = clusters.map(c => c.postcode);
    return ["all", ...Array.from(new Set(postcodes))].sort();
  }, [clusters]);

  // Filtered clusters based on selected postcode
  const filteredClusters = useMemo(() => {
    if (selectedPostcode === "all") {
      return clusters;
    }
    return clusters.filter(c => c.postcode === selectedPostcode);
  }, [clusters, selectedPostcode]);

  // Initialize mock data
  useEffect(() => {
    let clientIndex = 0;
    const newClients = [];
    initialClusters.forEach((cluster) => {
      for (let i = 0; i < 3; i++) {
        const first = clientFirstNames[clientIndex % clientFirstNames.length];
        const last = clientSurnames[clientIndex % clientSurnames.length];
        newClients.push({
          id: Date.now() + clientIndex * 3 + i,
          initials: first[0] + last[0],
          fullName: `${first} ${last}`,
          address: `${i + 1} Sample Street, ${cluster.region}, ${cluster.postcode}`,
          postcode: cluster.postcode,
          status: Math.random() > 0.5 ? "active" : "inactive",
          visitTime: `${Math.floor(Math.random() * 12 + 6).toString().padStart(2, '0')}:00 - ${Math.floor(Math.random() * 12 + 18).toString().padStart(2, '0')}:00`,
        });
        clientIndex++;
      }
    });
    setAllClients(newClients);
    clientIndexRef.current = clientIndex;

    let carerIndex = 0;
    const newCarers = [];
    initialClusters.forEach((cluster) => {
      for (let i = 0; i < 3; i++) {
        const baseCarer = caretakerData[carerIndex % caretakerData.length];
        newCarers.push({
          id: Date.now() + carerIndex * 3 + i,
          initials: getInitials(baseCarer.name),
          fullName: baseCarer.name,
          address: `${i + 1} Care Base, ${cluster.region}, ${cluster.postcode}`,
          postcode: cluster.postcode,
          status: Math.random() > 0.5 ? "active" : "inactive",
          shiftTime: `${Math.floor(Math.random() * 12 + 6).toString().padStart(2, '0')}:00 - ${Math.floor(Math.random() * 12 + 18).toString().padStart(2, '0')}:00`,
        });
        carerIndex++;
      }
    });
    setAllCarers(newCarers);
    carerIndexRef.current = carerIndex;
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Helper to parse time string to minutes since midnight
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [time] = timeStr.split(' - ')[0]; // Take start time
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper to check if time falls within a range
  const isTimeInRange = useCallback((timeStr, range) => {
    if (!range || range === 'All') return true;
    const timeMinutes = parseTimeToMinutes(timeStr);
    if (timeMinutes === null) return false;

    const ranges = {
      Morning: { start: 6 * 60, end: 12 * 60 },
      Afternoon: { start: 12 * 60, end: 17 * 60 },
      Evening: { start: 17 * 60, end: 21 * 60 },
      Night: { start: 21 * 60, end: 24 * 60 + 6 * 60 }, // Wraps around
    };

    const { start, end } = ranges[range];
    if (end > 24 * 60) {
      // Night wraps around
      return timeMinutes >= start || timeMinutes <= (end - 24 * 60);
    }
    return timeMinutes >= start && timeMinutes < end;
  }, []);

  const getTimeRangeDisplay = useCallback((timeRange) => {
    if (!timeRange) return "";
    return `${timeRange} (${timeRangeDetails[timeRange] || ""})`;
  }, [timeRangeDetails]);

  const selectedTimeDisplay = useMemo(() => {
    if (!selectedTimeRange) return "All Agreed times";
    return getTimeRangeDisplay(selectedTimeRange);
  }, [selectedTimeRange, getTimeRangeDisplay]);

  const getDisplayStatus = (status) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const entityName = currentView === "clients" ? "Client" : "Carer";

  const handleHeaderFilterClick = (view) => {
    setCurrentView(view);
    setHeaderDropdownOpen(false);
  };

  const handleDropdownToggle = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const handleViewAddress = (item) => {
    // Handle view address logic here
    console.log('View address for:', item);
    setOpenDropdownIndex(null);
  };

  const handleRemove = (itemId) => {
    // Handle remove logic here
    console.log('Remove item:', itemId);
    setOpenDropdownIndex(null);
  };

  const handleMoveClick = (item) => {
    // Handle move logic here
    console.log('Move item:', item);
    setOpenDropdownIndex(null);
  };

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleTimeSelect = (timeRange) => {
    setSelectedTimeRange(timeRange === "All" ? "" : timeRange);
    setShowTimeDropdown(false);
  };

  // Postcode selection handler
  const handlePostcodeSelect = (postcode) => {
    setSelectedPostcode(postcode);
    setShowPostcodeDropdown(false);
    // If selected cluster doesn't match the new filter, clear selection
    if (selectedCluster && postcode !== "all" && selectedCluster.postcode !== postcode) {
      setSelectedCluster(null);
      setActiveClusterId(null);
    }
  };

  // Cluster dropdown handlers
  const handleClusterMap = () => {
    console.log('Cluster Map clicked');
    setShowClusterDropdown(false);
  };

  const handleEditOpen = () => {
    setEditClusterName(selectedCluster.name);
    setEditClusterRegion(selectedCluster.region);
    setEditClusterPostcode(selectedCluster.postcode);
    setEditClusterDescription(selectedCluster.description || "");
    setEditClusterLat(selectedCluster.coords[1]);
    setEditClusterLon(selectedCluster.coords[0]);
    setShowEditModal(true);
    setShowClusterDropdown(false);
  };

  const handleDeleteOpen = () => {
    setClusterToDelete(selectedCluster);
    setSelectedTarget(null);
    setDeleteSearchTerm("");
    setShowDeleteModal(true);
    setShowClusterDropdown(false);
  };

  const handleClusterSelect = useCallback((cluster) => {
    setSelectedCluster(cluster);
    setActiveClusterId(cluster.id);
  }, []);

  const filteredDataList = useMemo(() => {
    const clusterPostcode = selectedCluster?.postcode;
    if (!clusterPostcode) return [];
    if (currentView === "clients") {
      return allClients.filter(c => c.postcode === clusterPostcode);
    } else {
      return allCarers.filter(c => c.postcode === clusterPostcode);
    }
  }, [currentView, selectedCluster, allClients, allCarers]);

  // Apply filters including time
  const displayedData = useMemo(() => {
    let data = [...filteredDataList];

    // Apply status filters
    if (selectedFilters.length > 0 && selectedFilters.length < 2) {
      data = data.filter((row) => selectedFilters.includes(row.status));
    }

    // Apply time filter
    if (selectedTimeRange) {
      const timeField = currentView === "clients" ? "visitTime" : "shiftTime";
      data = data.filter((row) => isTimeInRange(row[timeField], selectedTimeRange));
    }

    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (row) =>
          (row.id && row.id.toString().toLowerCase().includes(query)) ||
          (row.fullName && row.fullName.toLowerCase().includes(query)) ||
          (row.address && row.address.toLowerCase().includes(query)) ||
          (row.status && row.status.toLowerCase().includes(query))
      );
    }

    return data;
  }, [filteredDataList, selectedFilters, selectedTimeRange, searchQuery, currentView, isTimeInRange]);

  const clusterClientsCount = useMemo(() => allClients.filter(c => c.postcode === selectedCluster?.postcode).length, [selectedCluster, allClients]);
  const clusterCarersCount = useMemo(() => allCarers.filter(c => c.postcode === selectedCluster?.postcode).length, [selectedCluster, allCarers]);
  const totalAddresses = clusterClientsCount + clusterCarersCount;
  const travelDistance = `${Math.floor(Math.random() * 50)} km`;

  // Delete modal memos
  const otherClusters = useMemo(() =>
    clusters.filter(c => c.id !== clusterToDelete?.id),
    [clusters, clusterToDelete]
  );
  const filteredDeleteClusters = useMemo(() =>
    otherClusters.filter(
      (cluster) =>
        cluster.name?.toLowerCase().includes(deleteSearchTerm.toLowerCase()) ||
        cluster.region?.toLowerCase().includes(deleteSearchTerm.toLowerCase()) ||
        cluster.postcode?.toLowerCase().includes(deleteSearchTerm.toLowerCase())
    ),
    [otherClusters, deleteSearchTerm]
  );
  const dataListDeleteModal = useMemo(
    () =>
      filteredDeleteClusters.map((cluster) => ({
        id: cluster.id,
        initials: cluster.name.substring(0, 2).toUpperCase(),
        fullName: cluster.name,
        postcode: cluster.postcode,
      })),
    [filteredDeleteClusters]
  );
  const currentClientsCount = useMemo(() =>
    clusterToDelete ? allClients.filter(c => c.postcode === clusterToDelete.postcode).length : 0,
    [allClients, clusterToDelete]
  );
  const currentCarersCount = useMemo(() =>
    clusterToDelete ? allCarers.filter(c => c.postcode === clusterToDelete.postcode).length : 0,
    [allCarers, clusterToDelete]
  );

  // Reset functions
  const resetCreateForm = useCallback(() => {
    setClusterRegion("");
    setClusterPostcode("");
    setClusterName("");
    setClusterDescription("");
    setClusterLat(null);
    setClusterLon(null);
  }, []);
  const resetEditForm = useCallback(() => {
    setEditClusterRegion("");
    setEditClusterPostcode("");
    setEditClusterName("");
    setEditClusterDescription("");
    setEditClusterLat(null);
    setEditClusterLon(null);
  }, []);

  const handleCreateCluster = async (e) => {
    e.preventDefault();
    if (!clusterRegion || !clusterPostcode || !clusterName) {
      setErrorMessage("Please fill in region, postcode and name");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setIsCreating(true);
    setErrorMessage("");
    try {
      const newId = Math.max(...clusters.map(c => c.id), 0) + 1;
      const newCluster = {
        id: newId,
        name: clusterName,
        region: clusterRegion,
        postcode: clusterPostcode,
        description: clusterDescription || "",
        coords: clusterLon ? [clusterLon, clusterLat] : [-0.1278, 51.5074]
      };
      setClusters(prev => [...prev, newCluster]);

      // Generate new clients
      const numNew = 3;
      let localClientIndex = clientIndexRef.current;
      const newClients = [];
      for (let i = 0; i < numNew; i++) {
        const first = clientFirstNames[localClientIndex % clientFirstNames.length];
        const last = clientSurnames[localClientIndex % clientSurnames.length];
        const visitTime = `${Math.floor(Math.random() * 12 + 6).toString().padStart(2, '0')}:00 - ${Math.floor(Math.random() * 12 + 18).toString().padStart(2, '0')}:00`;
        newClients.push({
          id: Date.now() + localClientIndex * numNew + i,
          initials: first[0] + last[0],
          fullName: `${first} ${last}`,
          address: `${i + 1} Sample Street, ${clusterRegion}, ${clusterPostcode}`,
          postcode: clusterPostcode,
          status: Math.random() > 0.5 ? "active" : "inactive",
          visitTime,
        });
        localClientIndex++;
      }
      setAllClients(prev => [...prev, ...newClients]);
      clientIndexRef.current = localClientIndex;

      // Generate new carers
      let localCarerIndex = carerIndexRef.current;
      const newCarers = [];
      for (let i = 0; i < numNew; i++) {
        const baseCarer = caretakerData[localCarerIndex % caretakerData.length];
        const shiftTime = `${Math.floor(Math.random() * 12 + 6).toString().padStart(2, '0')}:00 - ${Math.floor(Math.random() * 12 + 18).toString().padStart(2, '0')}:00`;
        newCarers.push({
          id: Date.now() + localCarerIndex * numNew + i,
          initials: getInitials(baseCarer.name),
          fullName: baseCarer.name,
          address: `${i + 1} Care Base, ${clusterRegion}, ${clusterPostcode}`,
          postcode: clusterPostcode,
          status: Math.random() > 0.5 ? "active" : "inactive",
          shiftTime,
        });
        localCarerIndex++;
      }
      setAllCarers(prev => [...prev, ...newCarers]);
      carerIndexRef.current = localCarerIndex;

      resetCreateForm();
      setShowClusterModal(false);
      setSuccessMessage("Cluster created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(`Error creating cluster: ${error.message}`);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCluster = async (e) => {
    e.preventDefault();
    if (!editClusterRegion || !editClusterPostcode || !editClusterName) {
      setErrorMessage("Please fill in region, postcode and name");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setIsEditing(true);
    setErrorMessage("");
    try {
      const oldPostcode = selectedCluster.postcode;
      const oldRegion = selectedCluster.region;
      const newCoords = editClusterLon ? [editClusterLon, editClusterLat] : selectedCluster.coords;
      const updatedCluster = {
        ...selectedCluster,
        name: editClusterName,
        region: editClusterRegion,
        postcode: editClusterPostcode,
        description: editClusterDescription || "",
        coords: newCoords
      };
      setClusters(prev => prev.map(c => c.id === selectedCluster.id ? updatedCluster : c));
      setSelectedCluster(updatedCluster);

      // Update items if postcode or region changed
      if (oldPostcode !== editClusterPostcode || oldRegion !== editClusterRegion) {
        setAllClients(prev => prev.map(c =>
          c.postcode === oldPostcode ? {
            ...c,
            postcode: editClusterPostcode,
            address: c.address.replace(oldRegion, editClusterRegion).replace(oldPostcode, editClusterPostcode)
          } : c
        ));
        setAllCarers(prev => prev.map(c =>
          c.postcode === oldPostcode ? {
            ...c,
            postcode: editClusterPostcode,
            address: c.address.replace(oldRegion, editClusterRegion).replace(oldPostcode, editClusterPostcode)
          } : c
        ));
      }

      resetEditForm();
      setShowEditModal(false);
      setSuccessMessage("Cluster updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(`Error updating cluster: ${error.message}`);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsEditing(false);
    }
  };

  const handleMoveAssignments = () => {
    if (!selectedTarget || !clusterToDelete) return;
    const targetCluster = clusters.find(c => c.id === selectedTarget);
    if (!targetCluster) return;
    const oldPostcode = clusterToDelete.postcode;
    const oldRegion = clusterToDelete.region;
    const newPostcode = targetCluster.postcode;
    const newRegion = targetCluster.region;
    setAllClients(prev => prev.map(c =>
      c.postcode === oldPostcode ? {
        ...c,
        postcode: newPostcode,
        address: c.address.replace(oldRegion, newRegion).replace(oldPostcode, newPostcode)
      } : c
    ));
    setAllCarers(prev => prev.map(c =>
      c.postcode === oldPostcode ? {
        ...c,
        postcode: newPostcode,
        address: c.address.replace(oldRegion, newRegion).replace(oldPostcode, newPostcode)
      } : c
    ));
    setSuccessMessage("Clients and carers moved successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setDeleteSearchTerm("");
    setSelectedTarget(null);
  };

  const handleDeleteCluster = () => {
    if (!clusterToDelete) return;
    setClusters(prev => prev.filter(c => c.id !== clusterToDelete.id));
    if (selectedCluster?.id === clusterToDelete.id) {
      setSelectedCluster(null);
      setActiveClusterId(null);
    }
    setShowDeleteModal(false);
    setSuccessMessage("Cluster deleted successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowClusterDropdown(false);
        setShowFilterDropdown(false);
        setShowTimeDropdown(false);
        setShowPostcodeDropdown(false);
        setHeaderDropdownOpen(false);
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='NewCluster-PAG'>
      <div className='NewCluster-PAG-Top'>
        <div className='NewCluster-PAG-Top-1'>
          <h3>Clusters</h3>
          <div className="oIK-Search">
            <span>
              <MagnifyingGlassIcon />
            </span>
            <input
              type="text"
              placeholder="Search clusters"
            />
          </div>
        </div>
        <div className='NewCluster-PAG-Top-2'>
          {selectedCluster && (
            <div
              className="dropdown-container"
              style={{ position: "relative" }}
            >
              <span 
                className='EEliaks-Ssec'
                onClick={() => setShowClusterDropdown((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              >
                <EllipsisHorizontalIcon />
              </span>
              <AnimatePresence>
                {showClusterDropdown && (
                  <motion.ul
                    className="dropdown-menu iujs-Pollas"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                   
                    <li
                      className="dropdown-item"
                      onClick={handleEditOpen}
                    >
                      Edit Cluster
                    </li>
                    <li
                      className="dropdown-item"
                      onClick={handleDeleteOpen}
                    >
                      Delete Cluster
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}
          <span className='btn-primary-bg' onClick={() => setShowClusterModal(true)}>
            <PlusCircleIcon />
            Add a Cluster
          </span>
        </div>
      </div>
      <div className='UUUJ-PLOL-AY'>
        <div className="Left-GEn-Profile UUUJ-PLOL-AY-Left">
          <div className='Pfoll-SideNav custom-scroll-bar'>
            <div className='GGThas-YYUj-TTAOPS'>
              <h5>Total Clusters: <b>{filteredClusters.length}</b></h5>
              <div className="dropdown-container" style={{ position: "relative" }}>
                <button 
                  className="CLust-Btn"
                  onClick={() => setShowPostcodeDropdown((prev) => !prev)}
                >
                  {selectedPostcode === "all" ? "All Postcodes" : selectedPostcode}
                  <IconCaretDown stroke={0} fill="currentColor" />
                </button>
                <AnimatePresence>
                  {showPostcodeDropdown && (
                    <motion.ul
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {uniquePostcodes.map((postcode) => (
                        <li
                          key={postcode}
                          className="dropdown-item"
                          onClick={() => handlePostcodeSelect(postcode)}
                        >
                          <span>{postcode === "all" ? "All Postcodes" : postcode}</span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className='VVts-POla'>
              {filteredClusters.map((cluster) => (
                <div
                  className={`VVts-POla-Box ${activeClusterId === cluster.id ? 'active' : ''}`}
                  key={cluster.id}
                  onClick={() => {
                    setActiveClusterId(cluster.id);
                    setSelectedCluster(cluster);
                  }}
                >
                  <h3>{cluster.name}</h3>
                  <p><span>Postcode:</span> <b>{cluster.postcode}</b></p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='UUUJ-PLOL-AY-2'>
          <div className='UUUJ-PLOL-AY-2-Top'>
            <TomTomMap clusters={filteredClusters} selectedCluster={selectedCluster} onClusterSelect={handleClusterSelect} />
          </div>

          {selectedCluster ? (
            <div className='HYhj-PPL-Main'>
              <div className="YHta-POla">
                <h3>{selectedCluster.name}</h3>
              </div>
              <div className='ooilaui-Cards Oksujs-Ola'>
                <div className='ooilaui-Card Simp-Boxshadow'>
                  <h4>Total Clients</h4>
                  <h3>{clusterClientsCount}</h3>
                </div>
                <div className='ooilaui-Card Simp-Boxshadow'>
                  <h4>Total Carers</h4>
                  <h3>{clusterCarersCount}</h3>
                </div>
                <div className='ooilaui-Card Simp-Boxshadow'>
                  <h4>Total Travel Distance</h4>
                  <h3>{travelDistance}</h3>
                </div>
                <div className='ooilaui-Card Simp-Boxshadow'>
                  <h4>Total Addresses</h4>
                  <h3>{totalAddresses}</h3>
                </div>
              </div>

              {/* Inline Cluster Table */}
              <div className="GThaks-POla-Table">
                <div className="PPOlaj-SSde-TopSSUB">
                  {/* Search */}
                  <div className="oIK-Search">
                    <span>
                      <MagnifyingGlassIcon />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by Name, Address, Postcode, Status..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {/* Sort + Filter */}
                  <div className="oIK-Btns">
                    {/* Filter Dropdown */}
                    <div
                      className="dropdown-container"
                      style={{ position: "relative" }}
                    >
                      <button
                        className="LLl-BBtn-ACCt"
                        onClick={() => setShowFilterDropdown((prev) => !prev)}
                      >
                        Filters <BarsArrowDownIcon />
                      </button>
                      <AnimatePresence>
                        {showFilterDropdown && (
                          <motion.ul
                            className="dropdown-menu"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {["active", "inactive"].map((filter) => (
                              <li
                                key={filter}
                                className="dropdown-item"
                                onClick={() => toggleFilter(filter)}
                              >
                                <span>{getDisplayStatus(filter)}</span>
                                {selectedFilters.includes(filter) && (
                                  <CheckIcon className="check-icon" />
                                )}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  
                    {/* Time Dropdown */}
                    <div
                      className="dropdown-container"
                      style={{ position: "relative" }}
                    >
                      <button
                        className="CLust-Btn"
                        onClick={() => setShowTimeDropdown((prev) => !prev)}
                      >
                        {selectedTimeDisplay} <IconCaretDown stroke={0} fill="currentColor" />
                      </button>
                      <AnimatePresence>
                        {showTimeDropdown && (
                          <motion.ul
                            className="dropdown-menu"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {timeRanges.map((timeRange) => (
                              <li
                                key={timeRange}
                                className="dropdown-item"
                                onClick={() => handleTimeSelect(timeRange)}
                              >
                                <span>{timeRange === "All" ? "All Agreed times" : getTimeRangeDisplay(timeRange)}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  
                  </div>
                
                </div>
                <div className="CLusssd-Table">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th className="OIK-Thssa">
                            <div className="dropdown-container" style={{ position: "relative" }}>
                              <span
                                className="cclla-SPal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHeaderDropdownOpen(!headerDropdownOpen);
                                }}
                              >
                                {currentView === "clients" ? "Clients" : "Carers"}{" "}
                                <ChevronDownIcon />
                              </span>
                              <AnimatePresence>
                                {headerDropdownOpen && (
                                  <motion.div
                                    className="dropdown-menu Thsgtga-menu not-last-row-dropdown NNo-Spacebbatw"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <span
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleHeaderFilterClick("clients");
                                      }}
                                    >
                                      Clients
                                    </span>
                                    <span
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleHeaderFilterClick("carers");
                                      }}
                                    >
                                      Carers
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </th>
                          <th>Address</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedData.length > 0 ? (
                          displayedData.map((item, index) => {
                            const isLastRow = index === displayedData.length - 1;
                            const yOffset = isLastRow ? 10 : -10;
                            return (
                              <tr key={item.id}>
                                <td>
                                  <div className="HGh-Tabl-Gbs">
                                    <div className="HGh-Tabl-Gbs-Tit">
                                      <h3>
                                        <b>{item.initials}</b>
                                        <span className="Cree-Name">
                                          <span>{item.fullName}</span>
                                        </span>
                                      </h3>
                                    </div>
                                  </div>
                                </td>
                                <td>{item.address}</td>
                                <td>
                                  <span className={`Uyjhs-OPP TD-Status status ${item.status}`}>
                                    {getDisplayStatus(item.status)}
                                  </span>
                                </td>
                                <td>
                                  <div className="dropdown-container relative">
                                    <button
                                      className="actions-button ff-SVVgs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDropdownToggle(index);
                                      }}
                                    >
                                      <EllipsisHorizontalIcon />
                                    </button>
                                    <AnimatePresence>
                                      {openDropdownIndex === index && (
                                        <motion.div
                                          className={`dropdown-menu ${
                                            isLastRow
                                              ? "last-row-dropdown"
                                              : "not-last-row-dropdown"
                                          } NNo-Spacebbatw`}
                                          initial={{
                                            opacity: 0,
                                            y: yOffset,
                                            scale: 0.95,
                                          }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          exit={{
                                            opacity: 0,
                                            y: yOffset,
                                            scale: 0.95,
                                          }}
                                          transition={{ duration: 0.15 }}
                                        >
                                          <span
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewAddress(item);
                                            }}
                                          >
                                            <MapPinIcon /> View Address
                                          </span>
                                          {currentView === "carers" && (
                                            <span
                                              className="dropdown-item"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(item.id);
                                              }}
                                            >
                                              <TrashIcon /> Remove {entityName}
                                            </span>
                                          )}
                                          <span
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMoveClick(item);
                                            }}
                                          >
                                            <ArrowsPointingOutIcon /> Move to
                                            another cluster
                                          </span>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4}>
                              No {currentView === "clients" ? "clients" : "carers"} available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='HYhj-PPL-Main'>
              <div className='NNuajs-PPolas'>
                <img src={ClusTImg} />
                <h3>There are about {filteredClusters.length} active clusters</h3>
                <p>Select a cluster to view details</p>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Cluster Modal */}
      <AnimatePresence>
        {showClusterModal && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                resetCreateForm();
                setShowClusterModal(false);
              }}
            />
            <motion.div
              className="add-task-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="TTas-Boxxs custom-scroll-bar">
                <div className="TTas-Boxxs-Top">
                  <h4>Create New Cluster</h4>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form
                    onSubmit={handleCreateCluster}
                    className="add-task-form"
                  >
                    <div className="TTtata-Input" style={{ position: 'relative' }}>
                      <label>Region *</label>
                      <input
                        type="text"
                        value={clusterRegion}
                        onChange={(e) => handleCreateAddressChange(e.target.value, setClusterRegion)}
                        onBlur={handleCreateBlur}
                        placeholder="Enter Region/Town/City"
                        required
                      />
                      {createShowSuggestions && createSuggestions.length > 0 && (
                        <ul
                          className="suggestions-dropdown"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          {createSuggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              onClick={() => handleCreateSuggestionSelect(suggestion, setClusterRegion, setClusterPostcode, setClusterLat, setClusterLon)}
                              style={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderBottom: index < createSuggestions.length - 1 ? '1px solid #eee' : 'none',
                              }}
                            >
                              {suggestion.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="TTtata-Input">
                      <label>Postcode *</label>
                      <input
                        type="text"
                        value={clusterPostcode}
                        onChange={(e) => setClusterPostcode(e.target.value)}
                        placeholder="Enter postcode"
                        required
                      />
                    </div>
                    <div className="TTtata-Input">
                      <label>Cluster Name *</label>
                      <input
                        type="text"
                        value={clusterName}
                        onChange={(e) => setClusterName(e.target.value)}
                        placeholder="Enter cluster name"
                        required
                      />
                    </div>
                    <div className="TTtata-Input">
                      <label>Description (Optional)</label>
                      <textarea
                        value={clusterDescription}
                        onChange={(e) =>
                          setClusterDescription(e.target.value)
                        }
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={() => {
                          resetCreateForm();
                          setShowClusterModal(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                        disabled={
                          isCreating ||
                          !clusterRegion ||
                          !clusterPostcode ||
                          !clusterName
                        }
                      >
                        {isCreating ? "Creating..." : "Create Cluster"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Cluster Modal */}
      <AnimatePresence>
        {showEditModal && selectedCluster && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                resetEditForm();
                setShowEditModal(false);
              }}
            />
            <motion.div
              className="add-task-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="TTas-Boxxs custom-scroll-bar">
                <div className="TTas-Boxxs-Top">
                  <h4>Edit Cluster</h4>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form
                    onSubmit={handleEditCluster}
                    className="add-task-form"
                  >
                    <div className="TTtata-Input" style={{ position: 'relative' }}>
                      <label>Region *</label>
                      <input
                        type="text"
                        value={editClusterRegion}
                        onChange={(e) => handleEditAddressChange(e.target.value, setEditClusterRegion)}
                        onBlur={handleEditBlur}
                        placeholder="Enter Region/Town/City"
                        required
                      />
                      {editShowSuggestions && editSuggestions.length > 0 && (
                        <ul
                          className="suggestions-dropdown"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          {editSuggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              onClick={() => handleEditSuggestionSelect(suggestion, setEditClusterRegion, setEditClusterPostcode, setEditClusterLat, setEditClusterLon)}
                              style={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderBottom: index < editSuggestions.length - 1 ? '1px solid #eee' : 'none',
                              }}
                            >
                              {suggestion.display_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="TTtata-Input">
                      <label>Postcode *</label>
                      <input
                        type="text"
                        value={editClusterPostcode}
                        onChange={(e) => setEditClusterPostcode(e.target.value)}
                        placeholder="Enter postcode"
                        required
                      />
                    </div>
                    <div className="TTtata-Input">
                      <label>Cluster Name *</label>
                      <input
                        type="text"
                        value={editClusterName}
                        onChange={(e) => setEditClusterName(e.target.value)}
                        placeholder="Enter cluster name"
                        required
                      />
                    </div>
                    <div className="TTtata-Input">
                      <label>Description (Optional)</label>
                      <textarea
                        value={editClusterDescription}
                        onChange={(e) =>
                          setEditClusterDescription(e.target.value)
                        }
                        placeholder="Enter description"
                      />
                    </div>
                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={() => {
                          resetEditForm();
                          setShowEditModal(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                        disabled={
                          isEditing ||
                          !editClusterRegion ||
                          !editClusterPostcode ||
                          !editClusterName
                        }
                      >
                        {isEditing ? "Updating..." : "Update Cluster"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Cluster Modal */}
      <AnimatePresence>
        {showDeleteModal && clusterToDelete && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              className="add-task-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="TTas-Boxxs custom-scroll-bar">
                <div className="TTas-Boxxs-Top">
                  <h4>Delete Cluster</h4>
                </div>
                <div className="TTas-Boxxs-Body">
                  {currentClientsCount > 0 || currentCarersCount > 0 ? (
                    <>
                      <h4 style={{ marginBottom: '10px' }}>Move clients and carers to other cluster before deleting</h4>
                      <p style={{ marginBottom: '20px' }}>You have {currentClientsCount} client(s) and {currentCarersCount} carer(s) in this cluster. Please move them to another cluster first.</p>
                      <div className="TTtata-Input">
                        <label>Select Target Cluster *</label>
                        <div className="TTtata-Inputcc">
                          <div className="genn-Drop-Search daola-PLoa">
                            <span>
                              <MagnifyingGlassIcon />
                            </span>
                            <input
                              type="text"
                              value={deleteSearchTerm}
                              onChange={(e) =>
                                setDeleteSearchTerm(e.target.value)
                              }
                              placeholder="Search clusters by name or postcode"
                            />
                          </div>
                        </div>
                        <div className="CLusssd-Table UUYHsj-Pol">
                          <div className="table-container">
                            <table>
                              <thead>
                                <tr>
                                  <th>Select</th>
                                  <th>Cluster</th>
                                  <th>Postcode</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dataListDeleteModal.length > 0 ? (
                                  dataListDeleteModal.map((item, index) => (
                                    <tr
                                      key={item.id}
                                      onClick={(e) => {
                                        if (e.target.type !== 'radio') {
                                          setSelectedTarget(item.id);
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <td>
                                        <input
                                          type="radio"
                                          name="targetCluster"
                                          checked={selectedTarget === item.id}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            setSelectedTarget(item.id);
                                          }}
                                          className="tabbs-Inppust"
                                        />
                                      </td>
                                      <td>
                                        <div className="HGh-Tabl-Gbs">
                                          <div className="HGh-Tabl-Gbs-Tit">
                                            <h3>
                                              <b>{item.initials}</b>
                                              <span className="Cree-Name">
                                                <span>{item.fullName}</span>
                                              </span>
                                            </h3>
                                          </div>
                                        </div>
                                      </td>
                                      <td>{item.postcode}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={3}>
                                      No matching clusters found.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <p className="selected-count">
                          Selected: {selectedTarget ? clusters.find(c => c.id === selectedTarget)?.name : 'None'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 style={{ marginBottom: '10px' }}>Are you sure you want to delete "{clusterToDelete.name}"?</h4>
                      <p style={{ marginBottom: '20px', color: '#666' }}>This action cannot be undone.</p>
                    </>
                  )}
                </div>
                <div className="add-task-actions">
                  <button
                    type="button"
                    className="close-task"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  {currentClientsCount > 0 || currentCarersCount > 0 ? (
                    <button
                      type="button"
                      className="proceed-tast-btn btn-primary-bg"
                      disabled={!selectedTarget}
                      onClick={handleMoveAssignments}
                    >
                      Move Clients & Carers to {clusters.find(c => c.id === selectedTarget)?.name || 'Selected Cluster'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="proceed-tast-btn Oika-Delete"
                      onClick={handleDeleteCluster}
                    >
                      Delete Cluster
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {successMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
          <div className="toast success">{successMessage}</div>
        </div>
      )}
      {errorMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
          <div className="toast error">{errorMessage}</div>
        </div>
      )}
    </div>
  );
};

export default NewCluster;