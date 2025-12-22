import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCarGarage } from "@tabler/icons-react";
import MembImg1 from "../../Img/memberIcon1.jpg";
import MembImg2 from "../../Img/memberIcon2.jpg";
import MembImg3 from "../../Img/memberIcon3.jpg";
import MembImg4 from "../../Img/memberIcon4.jpg";
import MembImg5 from "../../Img/memberIcon5.jpg";
import MembImg6 from "../../Img/memberIcon6.jpg";
import VisitMap from "../VisitMap/VisitMap";
import {
  MapPinIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  IconUser,
  IconMapPin,
  IconRoute,
  IconClockHour2,
  IconBriefcase,
  IconCertificate,
  IconUserHeart,
  IconRoad,
  IconWalk,
  IconBus,
  IconCar,
  IconAlertCircle,
} from "@tabler/icons-react";
import { apiClient } from "../../../../../../../../config";

const AssignCarer = ({ onCarersChange, onDriversChange, assignedCarers = [], visitData = null }) => {
  const [isFrontView, setIsFrontView] = useState(true);
  const [selectedCarers, setSelectedCarers] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [error, setError] = useState(null);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [normalizedAssignedCarers, setNormalizedAssignedCarers] = useState([]);
  const [loadingAssignedCarers, setLoadingAssignedCarers] = useState(false);
  // Switch to double modal states
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchReason, setSwitchReason] = useState("");
  const [switchComments, setSwitchComments] = useState("");
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [successSwitchAlert, setSuccessSwitchAlert] = useState({
    show: false,
    message: "",
  });
  const numSlots = isFrontView ? 1 : 2;
  // Live carers list (fetched from /api/user/users). Drivers derived from carers with profile.is_driver.
  const [carers, setCarers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingCarers, setLoadingCarers] = useState(true);

  // Set initial isFrontView based on visit.careType
  useEffect(() => {
    if (visitData && visitData.careType) {
      // Set to single (true) if SINGLE_HANDED_CALL, double (false) if DOUBLE_HANDED_CALL
      const shouldBeSingle = visitData.careType === 'SINGLE_HANDED_CALL';
      setIsFrontView(shouldBeSingle);
    }
  }, [visitData]);

  // Map server user object -> UI carer object
  const mapUserToCarer = (u) => {
    const profile = u.profile || {};
    const fullName =
      `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
      u.username ||
      u.email;
    const isDriver = !!profile.is_driver;
    const availabilityObj = profile.availability || {};
    const hasAvailability = Object.keys(availabilityObj).some(
      (k) => availabilityObj[k] && availabilityObj[k].available
    );
    const skill =
      profile.skill_details && profile.skill_details.length > 0
        ? profile.skill_details[0].skill_name ||
          profile.skill_details[0].name ||
          "No skill provided"
        : "No skill provided";
    const locationParts = [
      profile.street,
      profile.city,
      profile.state,
      profile.country,
    ].filter(Boolean);
    return {
      id: u.id,
      name: fullName,
      image: profile.profile_image_url || null,
      distance: "0.0km", // static per instructions
      mobility: isDriver ? "car" : "walk",
      mobilityDisplay: isDriver ? "Driving" : "Walking",
      location: locationParts.join(", ") || "",
      availability: hasAvailability ? "Available" : "Not available",
      maxHours: "40 hours per week", // static
      specialisation: skill,
      availableTime: "8:00 am - 5:00 pm", // static for now
      raw: u,
    };
  };

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      setLoadingCarers(true);
      try {
        const res = await apiClient.get("/api/user/users");
        const data = res.data;
        const list = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        // Use all users as potential carers (no filtering)
        const carersOnly = list;
        const mapped = carersOnly.map(mapUserToCarer);
        if (!mounted) return;
        setCarers(mapped);
        const derivedDrivers = mapped
          .filter((c) => c.raw && c.raw.profile && c.raw.profile.is_driver)
          .map((d) => ({
            id: d.id,
            name: d.name,
            availability: `Available: ${d.availableTime}`,
          }));
        setDrivers(derivedDrivers);
      } catch (err) {
        console.error("Failed to load carers", err);
      } finally {
        if (mounted) setLoadingCarers(false);
      }
    };
    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch and normalize assigned carers from visit data
  useEffect(() => {
    let mounted = true;
    const loadAssignedCarers = async () => {
      if (!visitData) {
        setNormalizedAssignedCarers([]);
        return;
      }

      setLoadingAssignedCarers(true);
      try {
        const assignedCarerIds = [];
        
        // Get all carers from assignees array first (primary source)
        if (visitData.assignees && Array.isArray(visitData.assignees)) {
          visitData.assignees.forEach(assignee => {
            if (assignee.carerId && !assignedCarerIds.includes(assignee.carerId)) {
              assignedCarerIds.push(assignee.carerId);
            }
          });
        }
        
        // Also include main carerId if it's not already in the list
        if (visitData.carerId && !assignedCarerIds.includes(visitData.carerId)) {
          assignedCarerIds.push(visitData.carerId);
        }

        if (assignedCarerIds.length === 0) {
          setNormalizedAssignedCarers([]);
          return;
        }

        // Fetch user details for each assigned carer
        const carerPromises = assignedCarerIds.map(async (carerId) => {
          try {
            const res = await apiClient.get(`/api/user/users/${carerId}`);
            return res.data;
          } catch (err) {
            console.error(`Failed to fetch carer ${carerId}:`, err);
            return null;
          }
        });

        const carerUsers = await Promise.all(carerPromises);
        const validCarers = carerUsers.filter(Boolean);
        const normalizedCarers = validCarers.map(mapUserToCarer);
        
        if (mounted) {
          setNormalizedAssignedCarers(normalizedCarers);
        }
      } catch (err) {
        console.error("Failed to load assigned carers", err);
        if (mounted) {
          setNormalizedAssignedCarers([]);
        }
      } finally {
        if (mounted) {
          setLoadingAssignedCarers(false);
        }
      }
    };
    
    loadAssignedCarers();
    return () => {
      mounted = false;
    };
  }, [visitData]);

  const selectedCarerCount = selectedCarers.filter((c) => c != null).length;
  const selectedCarerIds = selectedCarers.filter((c) => c).map((c) => c.id);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (selectedDrivers.length > numSlots) {
      setSelectedDrivers((prev) => prev.slice(0, numSlots));
    }
  }, [isFrontView]);

  useEffect(() => {
    const currentLength = selectedCarers.length;
    if (currentLength > numSlots) {
      setSelectedCarers((prev) => prev.slice(0, numSlots));
    } else if (currentLength < numSlots) {
      setSelectedCarers((prev) => [
        ...prev,
        ...Array.from({ length: numSlots - currentLength }, () => null),
      ]);
    }
  }, [isFrontView]);

  // Notify parent when selectedCarers changes
  useEffect(() => {
    if (onCarersChange) {
      onCarersChange(selectedCarers);
    }
  }, [selectedCarers, onCarersChange]);

  // Notify parent when selectedDrivers changes
  useEffect(() => {
    if (onDriversChange) {
      onDriversChange(selectedDrivers);
    }
  }, [selectedDrivers, onDriversChange]);

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      setError(null);

      if (numSlots > 1) {
        const otherSlot = 1 - slotIndex;
        if (
          selectedCarers[otherSlot] &&
          selectedCarers[otherSlot].id === data.id
        ) {
          setError(
            "Cannot assign the same carer to both primary and secondary positions."
          );
          return;
        }
      }

      setSelectedCarers((prev) => {
        const newArr = [...prev];
        newArr[slotIndex] = data;
        return newArr;
      });
      setActiveSlot(slotIndex); // auto-select after drop
    } catch (err) {
      console.log("Invalid drop data");
    }
  };

  const handleRemove = (slotIndex) => {
    setSelectedCarers((prev) => {
      const newArr = [...prev];
      newArr[slotIndex] = null;
      return newArr;
    });

    if (numSlots > 1) {
      const otherSlot = 1 - slotIndex;
      if (selectedCarers[otherSlot]) {
        setActiveSlot(otherSlot);
      } else {
        setActiveSlot(null);
      }
    } else {
      setActiveSlot(null);
    }
  };

  const handleDriverSelect = (driverId) => {
    setSelectedDrivers((prev) => {
      if (prev.includes(driverId)) {
        return prev.filter((id) => id !== driverId);
      } else {
        if (prev.length >= numSlots) {
          return prev;
        } else {
          return [...prev, driverId];
        }
      }
    });
  };

  const getMobilityIcon = (mobility) => {
    if (mobility === "walk") return <IconWalk />;
    if (mobility === "bus") return <IconBus />;
    return <IconCar />;
  };

  // Helper function to get initials (similar to drivers)
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toLowerCase();
  };

  const renderCarerBox = (slotIndex) => {
    const carer = selectedCarers[slotIndex];
    return (
      <div
        key={slotIndex}
        className={`Sayhs-Box ${
          activeSlot === slotIndex ? "slelct-AcctV" : ""
        }`}
        onClick={() => setActiveSlot(slotIndex)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, slotIndex)}
      >
        {carer ? (
          <>
            <span
              className="inff-Bshna"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(slotIndex);
              }}
            >
              <XMarkIcon /> Remove
            </span>
            <div className="Sayhs-Box-Connt">
              <div className="Sayhs-Box-BBans">
                <div className="GThs-Inst-Ims">
                  {!carer.image ? (
                    <span>{getInitials(carer.name)}</span>
                  ) : (
                    <img src={carer.image} alt={carer.name} />
                  )}
                </div>
              </div>
              <div className="disiak-BBs">
                <MapPinIcon />
                <p>
                  Distance: <b>{carer.distance}</b>
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="HYhsn-Sta">
            <IconUserHeart />
            <h4>Drag and drop a carer to add them to this visit.</h4>
          </div>
        )}
      </div>
    );
  };

  const renderCarerDetails = (carer, index) => (
    <div key={index} className="carer-detail-section">
      <h4>
        {index === 0 ? "Primary Carer Details" : "Secondary Carer Details"}
      </h4>
      <ul>
        <li>
          <span>
            <b>
              <IconUser size={18} />
            </b>
            Name
          </span>
          <p>{carer.name}</p>
        </li>
        <li>
          <span>
            <b>
              <IconMapPin size={18} />
            </b>
            Location
          </span>
          <p>{carer.location}</p>
        </li>
        <li>
          <span>
            <b>
              <IconRoute size={18} />
            </b>
            Distance from Client
          </span>
          <p>{carer.distance} away</p>
        </li>
        <li>
          <span>
            <b>
              <IconClockHour2 size={18} />
            </b>
            Availability
          </span>
          <p>
            <b className="Uyha-Avina available">{carer.availability}</b>
          </p>
        </li>
        <li>
          <span>
            <b>
              <IconClockHour2 size={18} />
            </b>
            Available Time
          </span>
          <p>{carer.availableTime}</p>
        </li>
        <li>
          <span>
            <b>
              <IconBriefcase size={18} />
            </b>
            Maximum Working Hours
          </span>
          <p>{carer.maxHours}</p>
        </li>
        <li>
          <span>
            <b>
              <IconCertificate size={18} />
            </b>
            Area of Specialisation
          </span>
          <p>{carer.specialisation}</p>
        </li>
        <li>
          <span>
            <b>
              <IconRoad size={18} />
            </b>
            Mobility
          </span>
          <p>{carer.mobilityDisplay}</p>
        </li>
      </ul>
    </div>
  );

  // Switch reasons
  const switchReasons = [
    {
      value: "additional-support",
      label: "Client requires additional support",
    },
    { value: "task-complexity", label: "Complexity of task increased" },
    { value: "safety-concerns", label: "Carer safety concerns" },
    { value: "other", label: "Other" },
  ];

  const handleSwitchToggle = () => {
    // Determine the original care type from visitData
    const originalIsSingle = !visitData || !visitData.careType || visitData.careType === 'SINGLE_HANDED_CALL';
    
    // Check if we're switching away from the original care type
    const switchingAwayFromOriginal = originalIsSingle ? isFrontView : !isFrontView;
    
    if (switchingAwayFromOriginal) {
      // Switching away from original care type: show modal
      setShowSwitchModal(true);
    } else {
      // Switching back to original care type: direct switch
      setIsFrontView(!isFrontView);
    }
  };

  const handleSubmitSwitch = (e) => {
    e.preventDefault();
    if (!switchReason) {
      alert("Please select a reason for switching to double handed call");
      return;
    }
    setSavingSwitch(true);
    setTimeout(() => {
      console.log("Switch reason submitted:", {
        reason: switchReason,
        comments: switchComments,
      });
      const reasonLabel =
        switchReasons.find((r) => r.value === switchReason)?.label ||
        switchReason;
      setShowSwitchModal(false);
      setSavingSwitch(false);
      // Proceed to switch
      setIsFrontView(false);
      // Reset states
      setSwitchReason("");
      setSwitchComments("");
      // Show success alert
      setSuccessSwitchAlert({
        show: true,
        message: "Successfully switched to double handed call with reason",
      });
      setTimeout(() => {
        setSuccessSwitchAlert({ show: false, message: "" });
      }, 2200);
    }, 1500); // Simulate saving delay
  };

  const handleCancelSwitch = () => {
    setShowSwitchModal(false);
    setSwitchReason("");
    setSwitchComments("");
  };

  return (
    <div className="AssignCarer-Seccs">
      <div className="Sellc-NSpa custom-scroll-bar">
        <div className="Top-Sellc-NSpa">
          <h3>Assign Carer to this visit</h3>
          <p>
            Assign a Carer to this visit to ensure the client receives the
            appropriate support. Select from the available carers that meet the
            requirements to continue.
          </p>
        </div>
        <div className="Ssub-TTlos">
          <div className="switch-container" onClick={handleSwitchToggle}>
            <motion.div
              className="switch-slider"
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              animate={{ x: isFrontView ? 0 : "100%" }}
            />
            <span className={`switch-label ${isFrontView ? "active" : ""}`}>
              Single
            </span>
            <span className={`switch-label ${!isFrontView ? "active" : ""}`}>
              Double
            </span>
          </div>
          {!isDriverMode && (
            <span
              className="assgn-Diribs"
              onClick={() => setIsDriverMode(true)}
            >
              <IconCarGarage />{" "}
              {selectedDrivers.length > 0
                ? `${selectedDrivers.length} Driver${
                    selectedDrivers.length > 1 ? "s" : ""
                  } Selected`
                : "Assign Driver"}
            </span>
          )}
          {isDriverMode && (
            <span
              className="assgn-Diribs"
              onClick={() => setIsDriverMode(false)}
            >
              <IconUserHeart />{" "}
              {selectedCarerCount > 0
                ? `${selectedCarerCount} Carer${
                    selectedCarerCount > 1 ? "s" : ""
                  } added`
                : "Assign Carer"}
            </span>
          )}
        </div>
        {error && (
          <motion.div
            className="global-task-error-alert"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <IconAlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isDriverMode ? (
            <motion.div
              key="carer-panel"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="Ccare-PaneL"
            >
              <div className="Hyja-Suj">
                <div className="Hyja-Suj-Top">
                  <h4>
                    {isFrontView ? "Single handed call" : "Double handed call"}
                  </h4>
                </div>
                <div className="Sayhs-SeC">
                  {Array.from({ length: numSlots }).map((_, i) =>
                    renderCarerBox(i)
                  )}
                </div>
              </div>
              <div className="HYja-DLLts">
                {activeSlot !== null && selectedCarers[activeSlot] ? (
                  renderCarerDetails(selectedCarers[activeSlot], activeSlot)
                ) : (
                  <div className="no-selection">
                    <h4>No Carer Selected</h4>
                    <p>Drag and drop a carer to view details.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="driver-panel"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="Drivver-PaNel"
            >
              <div className="Cewrga-Us-Main-Top">
                <h3>Assign driver to this Visit</h3>
                <div className="Ouyjsa">
                  <div className="genn-Drop-Search">
                    <span>
                      <MagnifyingGlassIcon />
                    </span>
                    <input type="text" placeholder="Search carer.." />
                  </div>
                </div>
              </div>

              <div className="Gthsl-D">
                {drivers.map((driver) => {
                  const initials = driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toLowerCase();
                  return (
                    <div
                      key={driver.id}
                      className={`CCare-CArd ${
                        selectedDrivers.includes(driver.id) ? "selected" : ""
                      }`}
                      onClick={() => handleDriverSelect(driver.id)}
                    >
                      <span className="Check-IndiD">
                        <CheckIcon />
                      </span>
                      <div className="CCare-CArd-1">
                        <span>{initials}</span>
                      </div>
                      <div className="CCare-CArd-2">
                        <h4>{driver.name}</h4>
                        <p>{driver.availability}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="Cewrga-Us custom-scroll-bar">
        <div className="Cewrga-Us-Main">
          <div className="Cewrga-Us-Main-Top">
            <h3>Available Carers</h3>
            <div className="Ouyjsa">
              <div className="genn-Drop-Search">
                <span>
                  <MagnifyingGlassIcon />
                </span>
                <input type="text" placeholder="Search carer.." />
              </div>
              <span
                title="View Map"
                className="Ouyjsa-SPAN"
                onClick={() => setShowMap(!showMap)}
              >
                <MapPinIcon />
              </span>
            </div>
          </div>

          <AnimatePresence>
            {showMap && (
              <motion.div
                className="Yhhs-MMap"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ overflow: "hidden" }}
              >
                <div className="Yhhs-MMap-Main">
                  <VisitMap
                    carers={carers}
                    selectedCarerIds={selectedCarerIds}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="oyusj-Uj">
            <ul>
              <li>
                <span>
                  <b>
                    <ArrowsRightLeftIcon />
                  </b>
                  Closest Range:
                </span>
                <p>0.5km</p>
              </li>
              <li>
                <span>
                  <b>
                    <ArrowsRightLeftIcon />
                  </b>
                  Farthest Range:
                </span>
                <p>4.3km</p>
              </li>
              <li>
                <span>
                  <b>
                    <IconUserHeart />{" "}
                  </b>
                  Total Carers:
                </span>
                <p>{(() => {
                  const assignedIds = normalizedAssignedCarers.map((c) => String(c.id));
                  const available = carers.filter((c) => !assignedIds.includes(String(c.id)));
                  return available.length;
                })()}</p>
              </li>
            </ul>
          </div>
          <div className="CCare-Grid">
            {loadingCarers
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="CCare-CArd skeleton" aria-hidden>
                    <div className="CCare-CArd-1">
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 6,
                          background: '#e9e9e9',
                        }}
                      />
                    </div>
                    <div className="CCare-CArd-2">
                      <div style={{ height: 12, width: '60%', background: '#e9e9e9', marginBottom: 8, borderRadius: 4 }} />
                      <div style={{ height: 10, width: '40%', background: '#f0f0f0', borderRadius: 4 }} />
                    </div>
                  </div>
                ))
              : (() => {
                  // Filter available carers to exclude normalized assigned carers from visit data
                  const assignedIds = normalizedAssignedCarers.map((c) => String(c.id));
                  const available = carers.filter((c) => !assignedIds.includes(String(c.id)));
                  return available.map((carer) => (
                    <div
                      key={carer.id}
                      className="CCare-CArd"
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(carer)
                        );
                      }}
                    >
                      <div className="CCare-CArd-1">
                        {!carer.image ? (
                          <span>{getInitials(carer.name)}</span>
                        ) : (
                          <img src={carer.image} alt={carer.name} />
                        )}
                      </div>
                      <div className="CCare-CArd-2">
                        <h4>{carer.name}</h4>
                        <p>
                          <span>
                            Distance: <b>{carer.distance}</b>
                          </span>
                          <span className="Gths-ICONS">
                            {getMobilityIcon(carer.mobility)}
                            <ArrowsRightLeftIcon />
                            <MapPinIcon />
                          </span>
                        </p>
                        <p>Available time: {carer.availableTime}</p>
                      </div>
                    </div>
                  ));
                })()
            }
          </div>

          {/* Assigned carers section: show below available carers, same card layout (non-draggable) */}
          {normalizedAssignedCarers.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h4>Assigned Carers</h4>
              <div className="CCare-Grid">
                {loadingAssignedCarers
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <div key={`assigned-skeleton-${i}`} className="CCare-CArd skeleton" aria-hidden>
                        <div className="CCare-CArd-1">
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 6,
                              background: '#e9e9e9',
                            }}
                          />
                        </div>
                        <div className="CCare-CArd-2">
                          <div style={{ height: 12, width: '60%', background: '#e9e9e9', marginBottom: 8, borderRadius: 4 }} />
                          <div style={{ height: 10, width: '40%', background: '#f0f0f0', borderRadius: 4 }} />
                        </div>
                      </div>
                    ))
                  : normalizedAssignedCarers.map((carer) => (
                      <div key={`assigned-${carer.id}`} className="CCare-CArd assigned">
                        <div className="CCare-CArd-1">
                          {!carer.image ? (
                            <span>{getInitials(carer.name)}</span>
                          ) : (
                            <img src={carer.image} alt={carer.name} />
                          )}
                        </div>
                        <div className="CCare-CArd-2">
                          <h4>{carer.name}</h4>
                          <p>
                            <span>
                              Distance: <b>{carer.distance}</b>
                            </span>
                            <span className="Gths-ICONS">
                              {getMobilityIcon(carer.mobility)}
                              <ArrowsRightLeftIcon />
                              <MapPinIcon />
                            </span>
                          </p>
                          <p>Available time: {carer.availableTime}</p>
                        </div>
                      </div>
                    ))
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Alert for Switch */}
      <AnimatePresence>
        {successSwitchAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="global-task-success-alert"
          >
            <div>{successSwitchAlert.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch to Double Reason Modal */}
      <AnimatePresence>
        {showSwitchModal && (
          <>
            <motion.div
              className="add-task-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelSwitch}
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
                  <h4>Switch to Double Handed Call</h4>
                  <p>
                    Drop a reason for switching from single to double handed
                    call to ensure it is reviewed by the care coordinator.
                  </p>
                </div>
                <div className="TTas-Boxxs-Body">
                  <form onSubmit={handleSubmitSwitch} className="add-task-form">
                    <div className="TTtata-Input">
                      <label>
                        Reason for switching to double handed call *
                      </label>
                      <select
                        value={switchReason}
                        onChange={(e) => setSwitchReason(e.target.value)}
                        required
                      >
                        <option value="">Select a reason</option>
                        {switchReasons.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="TTtata-Input">
                      <label>Comments</label>
                      <textarea
                        value={switchComments}
                        onChange={(e) => setSwitchComments(e.target.value)}
                        placeholder="Provide additional details about the reason..."
                      />
                    </div>
                    <div className="add-task-actions">
                      <button
                        type="button"
                        className="close-task"
                        onClick={handleCancelSwitch}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="proceed-tast-btn btn-primary-bg"
                      >
                        {savingSwitch ? (
                          <>
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
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
                            Submit...
                          </>
                        ) : (
                          "Submit"
                        )}
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

export default AssignCarer;

