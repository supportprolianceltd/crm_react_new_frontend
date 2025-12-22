import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Cluster.css";
import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  ArrowsPointingOutIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import CareerImg1 from "../Img/Careers/1.jpg";
import CareerImg2 from "../Img/Careers/2.jpg";
import CareerImg3 from "../Img/Careers/3.jpg";
import CareerImg4 from "../Img/Careers/4.jpg";
import CareerImg5 from "../Img/Careers/5.jpg";

import ClusterMap from "./ClusterMap/ClusterMap";
import EmptyState from "../../../../components/EmptyState";
import {
  createCluster,
  fetchAllClusters,
  updateCluster,
  deleteCluster,
} from "./config/apiConfig";
import {
  fetchClients,
  assignClientToCluster,
  fetchClusterClients,
} from "../config/apiConfig";
import DeleteClusterModal from "./modals/DeleteClusterModal";
import useSearchPostcode from "../../../../hooks/useSearchPostcode";
import ToastNotification from "../../../../components/ToastNotification";
import LoadingState from "../../../../components/LoadingState";

const Cluster = () => {
  const careerImages = [
    CareerImg1,
    CareerImg2,
    CareerImg3,
    CareerImg4,
    CareerImg5,
  ];

  const generateAvatar = (index) => careerImages[index % careerImages.length];

  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allClients, setAllClients] = useState([]); // Added missing state
  const [isLoadingClients, setIsLoadingClients] = useState(false); // Added missing state
  const [currentClusterClients, setCurrentClusterClients] = useState([]); // Clients for the selected cluster

  // Default active cluster (first one)
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [currentView, setCurrentView] = useState("clients");
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New state for delete modal
  const [editingClusterIndex, setEditingClusterIndex] = useState(-1);
  const [clusterToDelete, setClusterToDelete] = useState(null); // New state for cluster to delete
  const [clusterPostcode, setClusterPostcode] = useState("");
  const [clusterName, setClusterName] = useState("");
  const [clusterDescription, setClusterDescription] = useState("");
  const [clusterAddress, setClusterAddress] = useState("");
  const [clusterLat, setClusterLat] = useState("");
  const [clusterLon, setClusterLon] = useState("");
  const [editClusterPostcode, setEditClusterPostcode] = useState("");
  const [editClusterName, setEditClusterName] = useState("");
  const [editClusterDescription, setEditClusterDescription] = useState("");
  const [editClusterAddress, setEditClusterAddress] = useState("");
  const [editClusterLat, setEditClusterLat] = useState("");
  const [editClusterLon, setEditClusterLon] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [editClientSearchTerm, setEditClientSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [editSelectedClients, setEditSelectedClients] = useState([]);
  const [clusterSearchTerm, setClusterSearchTerm] = useState("");
  const [postcodeFilter, setPostcodeFilter] = useState("All Postcodes");

  // Create modal specific states
  const [hasAddressSearched, setHasAddressSearched] = useState(false);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Search hooks
  const createSearch = useSearchPostcode();
  const editSearch = useSearchPostcode();

  // Modal states
  const [modalHeaderDropdownOpen, setModalHeaderDropdownOpen] = useState(false);

  const activeCluster = clusters[activeIndex];

  // Mock clients for search
  const mockClients = [
    {
      id: 1,
      name: "Oliver Johnson",
      postcode: "SW1A 1AA",
      visitTime: "09:00 - 09:30",
    },
    {
      id: 2,
      name: "Sarah Mitchell",
      postcode: "SW1A 2BB",
      visitTime: "09:30 - 10:00",
    },
    {
      id: 3,
      name: "James Davis",
      postcode: "SW1A 3CC",
      visitTime: "10:00 - 10:30",
    },
    {
      id: 4,
      name: "Emma Wilson",
      postcode: "SW1A 4DD",
      visitTime: "10:30 - 11:00",
    },
    {
      id: 5,
      name: "Thomas Roberts",
      postcode: "SW1A 5EE",
      visitTime: "11:00 - 11:30",
    },
    {
      id: 6,
      name: "Anna Kowalski",
      postcode: "NW10 5FF",
      visitTime: "07:00 - 07:30",
    },
    {
      id: 7,
      name: "Benjamin Lee",
      postcode: "NW10 6GG",
      visitTime: "07:30 - 08:00",
    },
    // Add more mock clients as needed
  ];

  // Moved filteredClients declarations before useMemos that depend on them
  // For real clients (assuming allClients is populated via useEffect)
  const filteredClients = useMemo(
    () =>
      allClients.filter(
        (client) =>
          client.name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
          client.id?.toString().includes(clientSearchTerm)
      ),
    [allClients, clientSearchTerm]
  );

  const filteredEditClients = useMemo(
    () =>
      allClients.filter(
        (client) =>
          client.name
            ?.toLowerCase()
            .includes(editClientSearchTerm.toLowerCase()) ||
          client.id?.toString().includes(editClientSearchTerm)
      ),
    [allClients, editClientSearchTerm]
  );

  // For mock clients
  const filteredMockClients = useMemo(
    () =>
      mockClients.filter(
        (mockClient) =>
          mockClient.name
            .toLowerCase()
            .includes(clientSearchTerm.toLowerCase()) ||
          mockClient.id.toString().includes(clientSearchTerm)
      ),
    [clientSearchTerm]
  );

  const filteredEditMockClients = useMemo(
    () =>
      mockClients.filter(
        (mockClient) =>
          mockClient.name
            .toLowerCase()
            .includes(editClientSearchTerm.toLowerCase()) ||
          mockClient.id.toString().includes(editClientSearchTerm)
      ),
    [editClientSearchTerm]
  );

  // Fixed useMemos: correct dependencies, variable names, and typos (Mockclient -> mockClient)
  const mockDataListModal = useMemo(
    () =>
      filteredMockClients.map((mockClient) => ({
        id: mockClient.id,
        initials: mockClient.name.substring(0, 2).toUpperCase(),
        fullName: mockClient.name,
        postcode: mockClient.postcode,
        visitTime: mockClient.visitTime,
        avatar: generateAvatar(mockClient.id % careerImages.length),
      })),
    [filteredMockClients]
  );

  const mockDataListEditModal = useMemo(
    () =>
      filteredEditMockClients.map((client) => ({
        id: client.id,
        initials: client.name.substring(0, 2).toUpperCase(),
        fullName: client.name,
        postcode: client.postcode,
        visitTime: client.visitTime,
        avatar: generateAvatar(client.id % careerImages.length),
      })),
    [filteredEditMockClients]
  );

  const dataListModal = useMemo(
    () =>
      filteredClients.map((client) => ({
        id: client.id,
        initials: client.name.substring(0, 2).toUpperCase(),
        fullName: client.name,
        postcode: client.postcode,
        visitTime: client.visitTime,
        avatar: generateAvatar(client.id % careerImages.length),
      })),
    [filteredClients]
  );

  const dataListEditModal = useMemo(
    () =>
      filteredEditClients.map((client) => ({
        id: client.id,
        initials: client.name.substring(0, 2).toUpperCase(),
        fullName: client.name,
        postcode: client.postcode,
        visitTime: client.visitTime,
        avatar: generateAvatar(client.id % careerImages.length),
      })),
    [filteredEditClients]
  );

  // Filter clusters based on search term and postcode filter
  const filteredClusters = useMemo(() => {
    let filtered = clusters;

    // Apply postcode filter first
    if (postcodeFilter !== "All Postcodes") {
      filtered = filtered.filter(
        (cluster) => cluster.postcode === postcodeFilter
      );
    }

    // Then apply search term filter
    if (clusterSearchTerm.trim()) {
      filtered = filtered.filter(
        (cluster) =>
          cluster.name
            .toLowerCase()
            .includes(clusterSearchTerm.toLowerCase()) ||
          cluster.postcode
            .toLowerCase()
            .includes(clusterSearchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [clusters, clusterSearchTerm, postcodeFilter]);

  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true);
      try {
        const data = await fetchClients();
        console.log("Fetched data:", data);
        if (data && data.results) {
          const processed = data.results.map((result, index) => ({
            id: result.id,
            client_id: result.profile.client_id, // Assuming API returns 'id' as client_id
            firstName: result.first_name,
            lastName: result.last_name,
            name: `${result.first_name} ${result.last_name}`, // Added for filtering
            profilePicture: result.profile.photo_url,
            title: result.profile.title,
            dateOfBirth: result.profile.date_of_birth,
            genderIdentity: result.profile.gender_identity,
            preferredName: result.profile.preferred_name,
            contactNumber: result.profile.contact_number,
            altContactNumber: result.profile.alt_contact_number,
            email: result.email,
            maritalStatus: result.profile.marital_status,
            nhisNumber: result.profile.nhis_number,
            primaryContactName: result.profile.primary_contact_name,
            primaryContactPhone: result.profile.primary_contact_phone,
            primaryContactEmail: result.profile.primary_contact_email,
            secondaryContactName: result.profile.secondary_contact_name || "",
            secondaryContactPhone: result.profile.secondary_contact_phone || "",
            secondaryContactEmail: result.profile.secondary_contact_email || "",
            nextOfKinFullName: result.profile.next_of_kin_full_name || "",
            nextOfKinRelationship:
              result.profile.next_of_kin_relationship || "",
            nextOfKinContactNumber:
              result.profile.next_of_kin_contact_number || "",
            nextOfKinAltContactNumber:
              result.profile.next_of_kin_alt_contact_number || "",
            nextOfKinEmail: result.profile.next_of_kin_email || "",
            addressLine: result.profile.address_line || "",
            town: result.profile.town || "",
            county: result.profile.county || "",
            postcode: result.profile.postcode || "",
            typeOfResidence: result.profile.type_of_residence || "",
            livesAlone: result.profile.lives_alone,
            initials:
              result.first_name[0].toUpperCase() +
              result.last_name[0].toUpperCase(),
            risk: ["low", "medium", "high"][index % 3], // Dummy variation
            assignments: 1, // Dummy
            status: result.profile.status,
            cluster: `Cluster ${String.fromCharCode(65 + (index % 5))}`, // Dummy variation
            users: 5 + index * 5, // Dummy variation
            currentCare: result.profile.status === "Active", // Based on status
            visitTime: "TBD", // Default visit time
          }));
          console.log("Processed clients:", processed);
          setAllClients(processed); // Fixed: setAllClients instead of setClientsData
        }
      } catch (error) {
        console.error("Error loading clients:", error);
        // Optionally handle error state, e.g., setError(error.message);
      } finally {
        setIsLoadingClients(false);
      }
    };
    loadClients();
  }, []);

  // Fetch clusters on mount
  const loadClusters = useCallback(async () => {
    try {
      const data = await fetchAllClusters();
      const processedClusters = (data.clusters || []).map((cluster) => ({
        ...cluster,
        clients: cluster.totalRequestCount || 0,
        carers: cluster.totalCarerCount || 0,
        travelTime: cluster.averageMatchTime
          ? `${cluster.averageMatchTime} min`
          : "N/A",
        clientsList: [],
        carersList: [],
        address: cluster.location || "",
      }));
      setClusters(processedClusters);
      if (processedClusters.length > 0) {
        setActiveIndex(0);
      }
      return processedClusters; // Return for use in create/delete
    } catch (error) {
      const errMsg = error.message || "Please try again.";
      setErrorMessage(`Error creating cluster: ${errMsg}`);
      setTimeout(() => setErrorMessage(""), 3000);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClusters();
  }, [loadClusters]);

  // Fetch clients for the selected cluster
  useEffect(() => {
    const loadClusterClients = async () => {
      if (activeCluster) {
        try {
          const data = await fetchClusterClients(activeCluster.id);
          if (data && data.results) {
            const processed = data.results.map((result, index) => ({
              id: result.id,
              client_id: result.profile.client_id,
              firstName: result.first_name,
              lastName: result.last_name,
              name: `${result.first_name} ${result.last_name}`,
              fullName: `${result.first_name} ${result.last_name}`,
              profilePicture: result.profile.photo_url,
              title: result.profile.title,
              dateOfBirth: result.profile.date_of_birth,
              genderIdentity: result.profile.gender_identity,
              preferredName: result.profile.preferred_name,
              contactNumber: result.profile.contact_number,
              altContactNumber: result.profile.alt_contact_number,
              email: result.email,
              maritalStatus: result.profile.marital_status,
              nhisNumber: result.profile.nhis_number,
              primaryContactName: result.profile.primary_contact_name,
              primaryContactPhone: result.profile.primary_contact_phone,
              primaryContactEmail: result.profile.primary_contact_email,
              secondaryContactName: result.profile.secondary_contact_name || "",
              secondaryContactPhone:
                result.profile.secondary_contact_phone || "",
              secondaryContactEmail:
                result.profile.secondary_contact_email || "",
              nextOfKinFullName: result.profile.next_of_kin_full_name || "",
              nextOfKinRelationship:
                result.profile.next_of_kin_relationship || "",
              nextOfKinContactNumber:
                result.profile.next_of_kin_contact_number || "",
              nextOfKinAltContactNumber:
                result.profile.next_of_kin_alt_contact_number || "",
              nextOfKinEmail: result.profile.next_of_kin_email || "",
              addressLine: result.profile.address_line || "",
              town: result.profile.town || "",
              county: result.profile.county || "",
              postcode: result.profile.postcode || "",
              typeOfResidence: result.profile.type_of_residence || "",
              livesAlone: result.profile.lives_alone,
              initials:
                result.first_name[0].toUpperCase() +
                result.last_name[0].toUpperCase(),
              risk: ["low", "medium", "high"][index % 3],
              assignments: 1,
              status: result.profile.status,
              cluster: activeCluster.name,
              users: 5 + index * 5,
              currentCare: result.profile.status === "Active",
              visitTime: "TBD",
            }));
            setCurrentClusterClients(processed);
          }
        } catch (error) {
          console.error("Error loading cluster clients:", error);
          setCurrentClusterClients([]);
        }
      } else {
        setCurrentClusterClients([]);
      }
    };
    loadClusterClients();
  }, [activeCluster]);

  // Reset create form
  const resetCreateForm = useCallback(() => {
    setClusterAddress("");
    setClusterPostcode("");
    setClusterLat("");
    setClusterLon("");
    setClusterName("");
    setClusterDescription("");
    setClientSearchTerm("");
    setSelectedClients([]);
    setHasAddressSearched(false);
  }, []);

  const handleCreateAddressChange = useCallback(
    (e) => {
      const value = e.target.value;
      createSearch.handleAddressInputChange(value, setClusterAddress);
      if (value.length >= 3) {
        setHasAddressSearched(true);
      }
      if (value === "") {
        setHasAddressSearched(false);
        setClusterPostcode("");
      }
    },
    [createSearch]
  );

  const handleCreateCluster = async (e) => {
    e.preventDefault();
    if (!clusterPostcode || !clusterName) {
      setErrorMessage("Please fill in postcode and name");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    setIsCreating(true);
    setErrorMessage("");
    try {
      const clusterData = {
        name: clusterName,
        postcode: clusterPostcode,
        latitude: Number(clusterLat),
        longitude: Number(clusterLon),
        location: clusterAddress,
        description: clusterDescription,
        clientIds: selectedClients,
      };
      const response = await createCluster(clusterData);

      // Assign selected clients to the cluster
      if (selectedClients.length > 0) {
        for (const clientId of selectedClients) {
          await assignClientToCluster(response.id, clientId);
        }
      }

      // Refetch clusters after creation
      const processedClusters = await loadClusters();
      const newIndex = processedClusters.findIndex((c) => c.id === response.id);
      if (newIndex !== -1) {
        setActiveIndex(newIndex);
      }

      resetCreateForm();
      setShowClusterModal(false);
      setSuccessMessage("Cluster created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Please try again.";
      setErrorMessage(`Error creating cluster: ${errMsg}`);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClientToggle = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleEditOpen = (index) => {
    const cluster = clusters[index];
    setEditingClusterIndex(index);
    setEditClusterName(cluster.name);
    setEditClusterPostcode(cluster.postcode);
    setEditClusterAddress(cluster.address || ""); // Populate address from cluster data
    setEditClusterLat(cluster.latitude || "");
    setEditClusterLon(cluster.longitude || "");
    setEditClusterDescription(cluster.description || "");
    setEditClientSearchTerm("");
    const currentClientIds =
      cluster.clientsList
        ?.map((item) => allClients.find((c) => c.name === item.fullName))
        ?.filter(Boolean)
        ?.map((c) => c.id) || [];
    setEditSelectedClients(currentClientIds);
    setShowEditModal(true);
  };

  const handleEditClientToggle = (clientId) => {
    setEditSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleEditCluster = async (e) => {
    e.preventDefault();
    if (!editClusterPostcode || !editClusterName) {
      setErrorMessage("Please fill in postcode and name");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    try {
      const clusterData = {
        id: clusters[editingClusterIndex].id,
        name: editClusterName,
        postcode: editClusterPostcode,
        latitude: Number(editClusterLat),
        longitude: Number(editClusterLon),
        location: editClusterAddress,
        description: editClusterDescription,
        clientIds: editSelectedClients,
      };
      const response = await updateCluster(clusterData);

      // Update local state after successful API call
      const newClientsList = editSelectedClients
        .map((clientId) => {
          const client = allClients.find((c) => c.id === clientId);
          if (!client) return null;
          return {
            initials: client.name.substring(0, 2).toUpperCase(),
            fullName: client.name,
            postcode: client.postcode,
            visitTime: client.visitTime,
            avatar: generateAvatar(clientId % careerImages.length),
          };
        })
        .filter(Boolean);

      setClusters((prev) => {
        const updated = [...prev];
        updated[editingClusterIndex] = {
          ...updated[editingClusterIndex],
          name: editClusterName,
          postcode: editClusterPostcode,
          latitude: Number(editClusterLat),
          longitude: Number(editClusterLon),
          location: editClusterAddress,
          address: editClusterAddress,
          description: editClusterDescription,
          clients: editSelectedClients.length,
          clientsList: newClientsList,
        };
        return updated;
      });

      setShowEditModal(false);
      setEditingClusterIndex(-1);
      setEditClusterPostcode("");
      setEditClusterName("");
      setEditClusterDescription("");
      setEditClusterAddress("");
      setEditClusterLat("");
      setEditClusterLon("");
      setEditClientSearchTerm("");
      setEditSelectedClients([]);
      setSuccessMessage("Cluster updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const errMsg = error.message || "Please try again.";
      setErrorMessage(`Error updating cluster: ${errMsg}`);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // New handler for delete open
  const handleDeleteOpen = (index) => {
    const cluster = clusters[index];
    setClusterToDelete(cluster);
    setShowDeleteModal(true);
  };

  // New handler for delete confirm (called from modal)
  const handleDeleteConfirm = async () => {
    if (clusterToDelete) {
      try {
        setIsDeleting(true);
        await deleteCluster(clusterToDelete.id);

        // Refetch clusters after deletion
        await loadClusters();
        setActiveIndex(0); // Reset to first cluster after deletion

        setSuccessMessage("Cluster deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        setErrorMessage("Error deleting cluster. Please try again.");
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setIsDeleting(false);
        setShowDeleteModal(false);
        setClusterToDelete(null);
      }
    }
  };

  // For demo, hardcode some values for cards (in real app, compute from clientsList)
  const totalClients = activeCluster?.clients || 0;
  const totalCarers = activeCluster?.carers || 0;
  const totalTravelDistance = activeCluster?.travelTime || "0 km"; // Reuse for demo
  const assignedCarers = totalCarers;
  const assignedClients = totalClients;

  const isClientsView = currentView === "clients";
  const dataList = isClientsView
    ? currentClusterClients
    : activeCluster?.carersList;
  const totalCount = isClientsView ? currentClusterClients.length : totalCarers;
  const timeField = isClientsView ? "visitTime" : "shiftTime";

  const handleDropdownToggle = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const handleDropdownItemClick = () => {
    setOpenDropdownIndex(null);
  };

  const handleHeaderFilterClick = (view) => {
    setOpenDropdownIndex(null);
    setCurrentView(view);
    setHeaderDropdownOpen(false);
  };

  const handleModalHeaderFilterClick = (view) => {
    setModalHeaderDropdownOpen(false);
    // Since modal is only for clients, no view change needed
  };

  // Handle outside clicks for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownIndex !== null) {
        if (
          !event.target.closest(".actions-button") &&
          !event.target.closest(".dropdown-menu")
        ) {
          setOpenDropdownIndex(null);
        }
      }
      if (headerDropdownOpen) {
        if (
          !event.target.closest(".cclla-SPal") &&
          !event.target.closest(".dropdown-menu")
        ) {
          setHeaderDropdownOpen(false);
        }
      }
      if (modalHeaderDropdownOpen) {
        if (
          !event.target.closest(".cclla-SPal") &&
          !event.target.closest(".dropdown-menu")
        ) {
          setModalHeaderDropdownOpen(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdownIndex, headerDropdownOpen, modalHeaderDropdownOpen]);

  const renderAvatar = (item, isClient) => {
    if (isClient) {
      return <b>{item.initials}</b>;
    }
    const avatar = item.avatar;
    if (avatar) {
      return <img src={avatar} alt="" className="avatar-img" />;
    }
    return <b>{item.initials}</b>;
  };

  if (loading || isLoadingClients) {
    return <LoadingState text="Loading clusters..." />;
  }

  return (
    <div className="Cluster-PPag">
      <div className="Cluster-PPag-1">
        <div className="Cluster-PPag-1-Main">
          <div className="Cluster-PPag-1-Main-Top">
            <div className="DDD-PPLso-1-Top">
              <span
                role="button"
                tabIndex={0}
                onClick={() => window.history.back()}
              >
                <ArrowLeftIcon /> Go Back
              </span>
            </div>
            <h3>Cluster</h3>

            <select
              value={postcodeFilter}
              onChange={(e) => setPostcodeFilter(e.target.value)}
            >
              <option>All Postcodes</option>
              {[...new Set(clusters.map((cluster) => cluster.postcode))].map(
                (postcode, index) => (
                  <option key={index}>{postcode}</option>
                )
              )}
            </select>

            <select>
              <option>All Agreed times</option>
              <option>07:00 - 08:00 am</option>
              <option>09:00 - 10:00 am</option>
              <option>12:00 - 13:00 pm</option>
            </select>
          </div>

          <div className="Cluster-PPag-1-Main-BDDY custom-scroll-bar">
            {filteredClusters.map((cluster, filteredIndex) => {
              const originalIndex = clusters.findIndex(
                (c) => c.id === cluster.id
              );
              return (
                <div
                  key={cluster.id}
                  className={`Cluster-Box ${
                    activeIndex === originalIndex ? "active" : ""
                  }`}
                  onClick={() => setActiveIndex(originalIndex)}
                >
                  <h3>
                    {cluster.name}
                    <b>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOpen(originalIndex);
                        }}
                      >
                        <PencilSquareIcon className="icon-edit" />
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOpen(originalIndex);
                        }}
                      >
                        <TrashIcon className="icon-delete" />
                      </span>
                    </b>
                  </h3>

                  <p>
                    <span>Post code</span>
                    <span>{cluster.postcode}</span>
                  </p>

                  <p>
                    <span>Clients</span>
                    <span>{cluster.clients}</span>
                  </p>

                  <p>
                    <span>Carers</span>
                    <span>{cluster.carers}</span>
                  </p>

                  <p>
                    <span>Total travel Time</span>
                    <span>{cluster.travelTime}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="Cluster-PPag-2">
        {clusters.length === 0 ? (
          <div style={{ marginTop: "5rem" }}>
            <EmptyState
              message="No clusters available. Create your first cluster to get started."
              cta={{
                text: "Create Cluster",
                onClick: () => setShowClusterModal(true),
              }}
            />
          </div>
        ) : (
          <>
            <div className="GLak-BOxsag-Top">
              <div className="GLak-BOxsag-Top-1">
                <div className="Searchh-Sec">
                  <span>
                    <MagnifyingGlassIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Search cluster name or postcode"
                    value={clusterSearchTerm}
                    onChange={(e) => setClusterSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="GLak-BOxsag-Top-2">
                <button
                  className="CLust-Btn btn-primary-bg"
                  onClick={() => setShowClusterModal(true)}
                >
                  <PlusCircleIcon /> Create Cluster
                </button>
              </div>
            </div>

            <div className="Alls-CLudder">
              <div className="GHGb-MMIn-DDahs-Top New_MainTt_Header">
                <h3>
                  {activeCluster?.name} ({activeCluster?.postcode})
                </h3>
              </div>
              <div className="ooilaui-Cards Oksujs-Ola">
                <div
                  className="ooilaui-Card Simp-Boxshadow"
                  onClick={() => {
                    setClusterSearchTerm("");
                    setPostcodeFilter("All Postcodes");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <h4>Total Clusters</h4>
                  <h3>{clusters.length}</h3>
                </div>

                <div className="ooilaui-Card Simp-Boxshadow">
                  <h4>{isClientsView ? "Total Clients" : "Total Carers"}</h4>
                  <h3>{totalCount}</h3>
                </div>

                <div className="ooilaui-Card Simp-Boxshadow">
                  <h4>Total Travel Distance</h4>
                  <h3>{totalTravelDistance}</h3>
                </div>

                <div className="ooilaui-Card Simp-Boxshadow">
                  <h4>
                    {isClientsView
                      ? "Total Assigned Carers"
                      : "Total Assigned Clients"}
                  </h4>
                  <h3>{isClientsView ? assignedCarers : assignedClients}</h3>
                </div>
              </div>

              <div className="Map-Box">
                <ClusterMap
                  clusters={clusters}
                  selectedCluster={activeCluster}
                />
              </div>

              <div className="CLusssd-Table">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th className="OIK-Thssa">
                          <span
                            className="cclla-SPal"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHeaderDropdownOpen(!headerDropdownOpen);
                            }}
                          >
                            {isClientsView ? "Clients" : "Carers"}{" "}
                            <ChevronDownIcon />
                          </span>
                          <AnimatePresence>
                            {headerDropdownOpen && (
                              <motion.div
                                className="Thsgtga-menu not-last-row-dropdown NNo-Spacebbatw"
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
                        </th>
                        <th>Postcode</th>
                        <th>{isClientsView ? "Visit time" : "Shift Time"}</th>
                        <th>Action qwerty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataList?.map((item, index) => {
                        const globalIndex = isClientsView
                          ? index
                          : index + (activeCluster?.clients || 0);
                        const isLastRow = index === dataList.length - 1;
                        const yOffset = isLastRow ? 10 : -10;
                        return (
                          <tr key={index}>
                            <td>
                              <div className="HGh-Tabl-Gbs">
                                <div className="HGh-Tabl-Gbs-Tit">
                                  <h3>
                                    {renderAvatar(item, isClientsView)}
                                    <span className="Cree-Name">
                                      <span>{item.fullName}</span>
                                    </span>
                                  </h3>
                                </div>
                              </div>
                            </td>
                            <td>{item.postcode}</td>
                            <td>{item[timeField]}</td>
                            <td>
                              <div className="relative">
                                <button
                                  className="actions-button ff-SVVgs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDropdownToggle(globalIndex);
                                  }}
                                >
                                  <EllipsisHorizontalIcon />
                                </button>
                                <AnimatePresence>
                                  {openDropdownIndex === globalIndex && (
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
                                          handleDropdownItemClick();
                                          // Add remove logic here
                                        }}
                                      >
                                        <TrashIcon /> Remove{" "}
                                        {isClientsView ? "Client" : "Carer"}
                                      </span>
                                      <span
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDropdownItemClick();
                                          // Add move logic here
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
                      }) || (
                        <tr>
                          <td colSpan={4}>
                            No {isClientsView ? "clients" : "carers"} available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

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
                      <div className="TTtata-Input">
                        <label>Address *</label>
                        <input
                          type="text"
                          value={clusterAddress}
                          onChange={handleCreateAddressChange}
                          onBlur={createSearch.handleBlur}
                          placeholder="e.g., 10 Downing Street, London"
                          required
                        />
                        {createSearch.showSuggestions &&
                          createSearch.suggestions.length > 0 && (
                            <div
                              className="suggestions-dropdown"
                              style={{ position: "relative", zIndex: 10 }}
                            >
                              {createSearch.suggestions.map((sug, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onClick={async () => {
                                    const res =
                                      await createSearch.handleSuggestionSelect(
                                        sug,
                                        setClusterAddress,
                                        setClusterPostcode
                                      );
                                    setClusterLat(res.lat);
                                    setClusterLon(res.lon);
                                  }}
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    marginBottom: "1px",
                                  }}
                                >
                                  {sug.display_name}
                                </div>
                              ))}
                            </div>
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
                        <label>Description</label>
                        <textarea
                          value={clusterDescription}
                          onChange={(e) =>
                            setClusterDescription(e.target.value)
                          }
                          placeholder="Enter description"
                        />
                      </div>

                      <div className="TTtata-Input ">
                        <label>Add Clients to Cluster</label>
                        <div className="TTtata-Inputcc">
                          <div className="genn-Drop-Search daola-PLoa">
                            <span>
                              <MagnifyingGlassIcon />
                            </span>
                            <input
                              type="text"
                              value={clientSearchTerm}
                              onChange={(e) =>
                                setClientSearchTerm(e.target.value)
                              }
                              placeholder="Search clients by name or ID"
                            />
                          </div>
                        </div>
                        <div className="CLusssd-Table UUYHsj-Pol">
                          <div className="table-container">
                            <table>
                              <thead>
                                <tr>
                                  <th>Select</th>
                                  <th className="OIK-Thssa">
                                    <span
                                      className="cclla-SPal"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModalHeaderDropdownOpen(
                                          !modalHeaderDropdownOpen
                                        );
                                      }}
                                    >
                                      Clients <ChevronDownIcon />
                                    </span>
                                    <AnimatePresence>
                                      {modalHeaderDropdownOpen && (
                                        <motion.div
                                          className="Thsgtga-menu not-last-row-dropdown NNo-Spacebbatw"
                                          initial={{
                                            opacity: 0,
                                            y: -10,
                                            scale: 0.95,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            y: -10,
                                            scale: 0.95,
                                          }}
                                          transition={{ duration: 0.15 }}
                                        >
                                          <span
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleModalHeaderFilterClick(
                                                "clients"
                                              );
                                            }}
                                          >
                                            Clients
                                          </span>
                                          <span
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleModalHeaderFilterClick(
                                                "carers"
                                              );
                                            }}
                                          >
                                            Carers
                                          </span>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </th>
                                  <th>Postcode</th>
                                  <th>Visit time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(dataListModal || mockDataListModal)?.map(
                                  (item, index) => {
                                    return (
                                      <tr key={item.id}>
                                        <td>
                                          <input
                                            type="checkbox"
                                            checked={selectedClients.includes(
                                              item.id
                                            )}
                                            onChange={() =>
                                              handleClientToggle(item.id)
                                            }
                                            className="tabbs-Inppust"
                                          />
                                        </td>
                                        <td>
                                          <div className="HGh-Tabl-Gbs">
                                            <div className="HGh-Tabl-Gbs-Tit">
                                              <h3>
                                                {renderAvatar(item, true)}
                                                <span className="Cree-Name">
                                                  <span>{item.fullName}</span>
                                                </span>
                                              </h3>
                                            </div>
                                          </div>
                                        </td>
                                        <td>{item.postcode}</td>
                                        <td>{item.visitTime}</td>
                                      </tr>
                                    );
                                  }
                                ) || (
                                  <tr>
                                    <td colSpan={4}>
                                      No matching clients found.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <p className="selected-count">
                          Selected: {selectedClients.length} clients
                        </p>
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
                            !clusterAddress ||
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
          {showEditModal && (
            <>
              <motion.div
                className="add-task-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
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
                    <p>Edit the cluster details and clients.</p>
                  </div>

                  <div className="TTas-Boxxs-Body">
                    <form
                      onSubmit={handleEditCluster}
                      className="add-task-form"
                    >
                      <div className="TTtata-Input">
                        <label>Address</label>
                        <input
                          type="text"
                          value={editClusterAddress}
                          onChange={(e) =>
                            editSearch.handleAddressInputChange(
                              e.target.value,
                              setEditClusterAddress
                            )
                          }
                          onBlur={editSearch.handleBlur}
                          placeholder="e.g., 10 Downing Street, London"
                        />
                        {editSearch.showSuggestions &&
                          editSearch.suggestions.length > 0 && (
                            <div
                              className="suggestions-dropdown"
                              style={{ position: "relative", zIndex: 10 }}
                            >
                              {editSearch.suggestions.map((sug, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onClick={async () => {
                                    const res =
                                      await editSearch.handleSuggestionSelect(
                                        sug,
                                        setEditClusterAddress,
                                        setEditClusterPostcode
                                      );
                                    setEditClusterLat(res.lat);
                                    setEditClusterLon(res.lon);
                                  }}
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "#fff",
                                    cursor: "pointer",
                                    marginBottom: "1px",
                                  }}
                                >
                                  {sug.display_name}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="TTtata-Input">
                        <label>Postcode *</label>
                        <input
                          type="text"
                          value={editClusterPostcode}
                          onChange={(e) =>
                            setEditClusterPostcode(e.target.value)
                          }
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
                        <label>Description</label>
                        <textarea
                          value={editClusterDescription}
                          onChange={(e) =>
                            setEditClusterDescription(e.target.value)
                          }
                          placeholder="Enter description"
                        />
                      </div>

                      <div className="TTtata-Input ">
                        <label>Add Clients to Cluster</label>
                        <div className="TTtata-Inputcc">
                          <div className="genn-Drop-Search daola-PLoa">
                            <span>
                              <MagnifyingGlassIcon />
                            </span>
                            <input
                              type="text"
                              value={editClientSearchTerm}
                              onChange={(e) =>
                                setEditClientSearchTerm(e.target.value)
                              }
                              placeholder="Search clients by name or ID"
                            />
                          </div>
                        </div>
                        <div className="CLusssd-Table UUYHsj-Pol">
                          <div className="table-container">
                            <table>
                              <thead>
                                <tr>
                                  <th>Select</th>
                                  <th className="OIK-Thssa">
                                    <span
                                      className="cclla-SPal"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModalHeaderDropdownOpen(
                                          !modalHeaderDropdownOpen
                                        );
                                      }}
                                    >
                                      Clients <ChevronDownIcon />
                                    </span>
                                    <AnimatePresence>
                                      {modalHeaderDropdownOpen && (
                                        <motion.div
                                          className="Thsgtga-menu not-last-row-dropdown NNo-Spacebbatw"
                                          initial={{
                                            opacity: 0,
                                            y: -10,
                                            scale: 0.95,
                                          }}
                                          animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                          }}
                                          exit={{
                                            opacity: 0,
                                            y: -10,
                                            scale: 0.95,
                                          }}
                                          transition={{ duration: 0.15 }}
                                        >
                                          <span
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleModalHeaderFilterClick(
                                                "clients"
                                              );
                                            }}
                                          >
                                            Clients
                                          </span>
                                          <span
                                            className="dropdown-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleModalHeaderFilterClick(
                                                "carers"
                                              );
                                            }}
                                          >
                                            Carers
                                          </span>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </th>
                                  <th>Postcode</th>
                                  <th>Visit time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(
                                  dataListEditModal || mockDataListEditModal
                                )?.map((item, index) => {
                                  return (
                                    <tr key={item.id}>
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={editSelectedClients.includes(
                                            item.id
                                          )}
                                          onChange={() =>
                                            handleEditClientToggle(item.id)
                                          }
                                          className="tabbs-Inppust"
                                        />
                                      </td>
                                      <td>
                                        <div className="HGh-Tabl-Gbs">
                                          <div className="HGh-Tabl-Gbs-Tit">
                                            <h3>
                                              {renderAvatar(item, true)}
                                              <span className="Cree-Name">
                                                <span>{item.fullName}</span>
                                              </span>
                                            </h3>
                                          </div>
                                        </div>
                                      </td>
                                      <td>{item.postcode}</td>
                                      <td>{item.visitTime}</td>
                                    </tr>
                                  );
                                }) || (
                                  <tr>
                                    <td colSpan={4}>
                                      No matching clients found.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <p className="selected-count">
                          Selected: {editSelectedClients.length} clients
                        </p>
                      </div>

                      <div className="add-task-actions">
                        <button
                          type="button"
                          className="close-task"
                          onClick={() => setShowEditModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="proceed-tast-btn btn-primary-bg"
                        >
                          Update Cluster
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* New Delete Cluster Modal */}
        <DeleteClusterModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setClusterToDelete(null);
          }}
          clusterName={clusterToDelete?.name}
          onDelete={handleDeleteConfirm}
          isDeleting={isDeleting}
        />

        <ToastNotification
          successMessage={successMessage}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
};

export default Cluster;
