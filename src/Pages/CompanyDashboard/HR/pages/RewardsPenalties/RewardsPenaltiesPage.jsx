import React, { useEffect, useState, useMemo, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Gift, Frown } from "lucide-react";

import StatusBadge from "../../../../../components/StatusBadge";
import Table from "../../../../../components/Table/Table";
import { AnimatedCounter } from "../../../../../components/AnimatedCounter/AnimatedCounter";
import ToastNotification from "../../../../../components/ToastNotification";
import Modal from "../../../../../components/Modal";
import "./RewardsPenaltiesPage.css";

import AddRewardModal from "./modals/AddRewardModal";
import AddPenaltyModal from "./modals/AddPenaltyModal";
import ConfirmationModal from "./modals/ConfirmationModal";
import RewardsPenaltiesDetailsModal from "./modals/RewardsPenaltiesDetailsModal";

import {
  fetchRewards,
  createReward,
  fetchPenalties,
  createPenalty,
} from "./config/apiConfig";
import {
  capitalizeFirstLetter,
  normalizeText,
} from "../../../../../utils/helpers";

const RewardsPenaltiesPage = () => {
  const [activeTab, setActiveTab] = useState("rewards");
  const [rewards, setRewards] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [isAddPenaltyOpen, setIsAddPenaltyOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const itemsPerPage = 10;

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    handleFetchData();
  }, [activeTab]);

  const computeRewardsStats = useCallback((rewardsData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthRewards = rewardsData.filter((r) => {
      const d = new Date(r.effective_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const total = thisMonthRewards.length;

    const deptCount = {};
    thisMonthRewards.forEach((r) => {
      const dept = r?.department || r.employee_details?.department || "Unknown";
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    const mostDept =
      Object.keys(deptCount).length > 0
        ? Object.keys(deptCount).reduce((a, b) =>
            deptCount[a] > deptCount[b] ? a : b
          )
        : "N/A";

    const typeCount = {};
    thisMonthRewards.forEach((r) => {
      const t = capitalizeFirstLetter(r.type || "Unknown");
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    const commonType =
      Object.keys(typeCount).length > 0
        ? Object.keys(typeCount).reduce((a, b) =>
            typeCount[a] > typeCount[b] ? a : b
          )
        : "N/A";

    return { total, mostDept, commonType };
  }, []);

  const computePenaltiesStats = useCallback((penaltiesData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthPenalties = penaltiesData.filter((p) => {
      const d = new Date(p.effective_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const total = thisMonthPenalties.length;

    const deptCount = {};
    thisMonthPenalties.forEach((p) => {
      const dept = p.employee_details?.department || "Unknown";
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });
    const mostDept =
      Object.keys(deptCount).length > 0
        ? Object.keys(deptCount).reduce((a, b) =>
            deptCount[a] > deptCount[b] ? a : b
          )
        : "N/A";

    const typeCount = {};
    thisMonthPenalties.forEach((p) => {
      const t = capitalizeFirstLetter(p.type || "Unknown");
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    const commonType =
      Object.keys(typeCount).length > 0
        ? Object.keys(typeCount).reduce((a, b) =>
            typeCount[a] > typeCount[b] ? a : b
          )
        : "N/A";

    return { total, mostDept, commonType };
  }, []);

  const mapItemData = useCallback((items) => {
    return items.map((item) => ({
      ...item,
      date: item.effective_date,
      employee_name: `${item.employee_details?.first_name || ""} ${
        item.employee_details?.last_name || ""
      }`.trim(),
      department: item.employee_details?.department || "",
      reason: item.reason || "",
      type: capitalizeFirstLetter(item.type || ""),
      status: capitalizeFirstLetter(item.status || ""),
    }));
  }, []);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "rewards") {
        const response = await fetchRewards();
        const mappedRewards = mapItemData(response?.results || []);
        setRewards(mappedRewards);
        setFilteredData(mappedRewards);
      } else {
        const response = await fetchPenalties();
        const mappedPenalties = mapItemData(response?.results || []);
        setPenalties(mappedPenalties);
        setFilteredData(mappedPenalties);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      activeTab === "rewards" ? setRewards([]) : setPenalties([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, mapItemData]);

  const handleSaveReward = (rewardData) => {
    setPendingAction({ type: "reward", data: rewardData });
    setIsConfirmOpen(true);
  };

  const handleSavePenalty = (penaltyData) => {
    setPendingAction({ type: "penalty", data: penaltyData });
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (pendingAction?.type === "reward") {
      try {
        setIsConfirming(true);
        await createReward(pendingAction.data);
        await handleFetchData();
        setIsAddRewardOpen(false);
        setToast({
          show: true,
          message: "Reward created successfully!",
          type: "success",
        });
      } catch (error) {
        console.error("Error creating reward:", error);
        setToast({
          show: true,
          message: error.message || "Failed to create reward",
          type: "error",
        });
      } finally {
        setIsConfirming(false);
      }
    } else if (pendingAction?.type === "penalty") {
      try {
        setIsConfirming(true);
        await createPenalty(pendingAction.data);
        await handleFetchData();
        setIsAddPenaltyOpen(false);
        setToast({
          show: true,
          message: "Penalty created successfully!",
          type: "success",
        });
      } catch (error) {
        console.error("Error creating penalty:", error);
        setToast({
          show: true,
          message: error.message || "Failed to create penalty",
          type: "error",
        });
      } finally {
        setIsConfirming(false);
      }
    }
    setPendingAction(null);
    setIsConfirmOpen(false);
  };

  // Table columns
  const tableColumns = useMemo(() => {
    const baseColumns = [
      { key: "date", header: "Date" },
      { key: "employee_name", header: "Employee Name" },
      { key: "department", header: "Department" },
      { key: "reason", header: "Reason" },
      {
        key: "type",
        header: "Type",
        render: (item) => <p>{normalizeText(item.type)}</p>,
      },
      {
        key: "status",
        header: "Status",
        render: (item) => <StatusBadge status={item.status.toLowerCase()} />,
      },
    ];

    return baseColumns;
  }, [activePopup, activeTab]);

  const togglePopup = (id, e) => {
    e.stopPropagation();
    setActivePopup(activePopup === id ? null : id);
  };

  const closePopups = () => setActivePopup(null);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Stats Cards - Real values based on API data
  const statisticsCards = useMemo(() => {
    if (activeTab === "rewards") {
      const stats = computeRewardsStats(rewards);
      return [
        { title: "Total rewards", count: stats.total, change: 9 },
        { title: "Most rewarded department", count: stats.mostDept, change: 9 },
        {
          title: "Common reward type",
          count:
            stats.commonType !== "N/A"
              ? normalizeText(stats.commonType)
              : stats.commonType,
          change: 9,
        },
      ].map((card, idx) => (
        <motion.div
          key={idx}
          className="rewards-penalties-statistics-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="rewards-penalties-statistics-title">{card.title}</h3>
          <p className="rewards-penalties-statistics-count">
            {typeof card.count === "number" ? (
              <AnimatedCounter value={card.count} />
            ) : (
              card.count
            )}
          </p>
          <div className="requests-status-percentage positive">
            ▲ {card.change}% this week
          </div>
        </motion.div>
      ));
    } else {
      const stats = computePenaltiesStats(penalties);
      return [
        { title: "Total penalties", count: stats.total, change: -5 },
        {
          title: "Most penalized department",
          count: stats.mostDept,
          change: 3,
        },
        {
          title: "Common penalty type",
          count:
            stats.commonType !== "N/A"
              ? normalizeText(stats.commonType)
              : stats.commonType,
          change: -2,
        },
      ].map((card, idx) => (
        <motion.div
          key={idx}
          className="rewards-penalties-statistics-card"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="rewards-penalties-statistics-title">{card.title}</h3>
          <p className="rewards-penalties-statistics-count">
            {typeof card.count === "number" ? (
              <AnimatedCounter value={card.count} />
            ) : (
              card.count
            )}
          </p>
          <div
            className={`requests-status-percentage ${
              card.change >= 0 ? "negative" : "positive"
            }`}
          >
            {card.change >= 0 ? "▲" : "▼"} {Math.abs(card.change)}% this week
          </div>
        </motion.div>
      ));
    }
  }, [
    activeTab,
    rewards,
    penalties,
    computeRewardsStats,
    computePenaltiesStats,
  ]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const dataSource = activeTab === "rewards" ? rewards : penalties;
    const filtered = dataSource.filter(
      (item) =>
        item.employee_name?.toLowerCase().includes(term.toLowerCase()) ||
        item.department?.toLowerCase().includes(term.toLowerCase()) ||
        item.reason?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  return (
    <div className="rewards-penalties-page">
      <ToastNotification
        successMessage={
          toast.type === "success" && toast.show ? toast.message : null
        }
        errorMessage={
          toast.type === "error" && toast.show ? toast.message : null
        }
      />
      {/* Header */}
      <div className="rewards-penalties-header">
        <div>
          <h1 className="rewards-penalties-title">Rewards & Penalties</h1>
          <p className="rewards-penalties-description">
            Track and manage employee recognition and disciplinary actions in
            one place. Issue rewards to celebrate achievements and apply
            penalties where necessary to maintain standards and accountability.
          </p>
        </div>
        <motion.button
          className="add-reward-penalty-button"
          onClick={() =>
            activeTab === "rewards"
              ? setIsAddRewardOpen(true)
              : setIsAddPenaltyOpen(true)
          }
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusCircleIcon />
          <p>Add {activeTab === "rewards" ? "Reward" : "Penalty"}</p>
        </motion.button>
      </div>

      <div className="tabs-container">
        {/* Rewards Button */}
        <button
          onClick={() => handleTabChange("rewards")}
          className={`tab-button ${activeTab === "rewards" ? "active" : ""}`}
        >
          <Gift size={18} />
          Rewards
        </button>

        {/* Penalties Button */}
        <button
          onClick={() => handleTabChange("penalties")}
          className={`tab-button ${activeTab === "penalties" ? "active" : ""}`}
        >
          <Frown size={18} />
          Penalties
        </button>
      </div>

      {/* Stats Cards */}
      <div className="rewards-penalties-statistics-cards-container">
        {statisticsCards}
      </div>

      {/* Search */}
      {/* <div className="rewards-penalties-options">
        <div className="search-input-container">
          <CiSearch />
          <input
            type="search"
            placeholder={`Search ${activeTab}`}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div> */}

      {/* Table */}
      <div className="rewards-penalties-table">
        <Table
          columns={tableColumns}
          data={currentItems}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          rowClickMode="item"
          emptyStateIcon={<TbMoodEmpty />}
          emptyStateMessage={`No ${activeTab} found`}
          emptyStateDescription="Try adjusting your search criteria"
          onRowClick={(item) => setSelectedItem(item)}
        />
      </div>

      <AddRewardModal
        isOpen={isAddRewardOpen}
        onClose={() => setIsAddRewardOpen(false)}
        onSave={handleSaveReward}
      />

      <AddPenaltyModal
        isOpen={isAddPenaltyOpen}
        onClose={() => setIsAddPenaltyOpen(false)}
        onSave={handleSavePenalty}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`Confirm Save ${capitalizeFirstLetter(pendingAction?.type)}`}
        message={`Are you sure you want to save this ${pendingAction?.type}?`}
        onConfirm={handleConfirmAction}
        isLoading={isConfirming}
      />

      <RewardsPenaltiesDetailsModal
        isOpen={!!selectedItem}
        item={selectedItem}
        activeTab={activeTab}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default RewardsPenaltiesPage;
