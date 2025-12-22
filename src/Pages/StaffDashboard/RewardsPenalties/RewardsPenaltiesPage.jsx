import { useEffect, useState, useMemo, useCallback } from "react";
import { TbMoodEmpty } from "react-icons/tb";
import { motion } from "framer-motion";
import { Gift, Frown } from "lucide-react";

import StatusBadge from "../../../components/StatusBadge";
import Table from "../../../components/Table/Table";
import AnimatedCounter from "../../../components/AnimatedCounter";
import "./RewardsPenaltiesPage.css";

import RewardsPenaltiesDetailsModal from "./modals/RewardsPenaltiesDetailsModal";

import { fetchUserRewards, fetchUserPenalties } from "./config/apiConfig";
import { capitalizeFirstLetter, normalizeText } from "../../../utils/helpers";

const RewardsPenaltiesPage = () => {
  const [activeTab, setActiveTab] = useState("rewards");
  const [rewards, setRewards] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemsPerPage = 10;

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

    return { total, commonType };
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

    return { total, commonType };
  }, []);

  const mapItemData = useCallback((items) => {
    return items.map((item) => ({
      ...item,
      date: item.effective_date,
      reason: item.reason || "",
      type: capitalizeFirstLetter(item.type || ""),
      status: capitalizeFirstLetter(item.status || ""),
    }));
  }, []);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "rewards") {
        const response = await fetchUserRewards();
        const mappedRewards = mapItemData(response?.results || []);
        setRewards(mappedRewards);
        setFilteredData(mappedRewards);
      } else {
        const response = await fetchUserPenalties();
        const mappedPenalties = mapItemData(response?.results || []);
        setPenalties(mappedPenalties);
        setFilteredData(mappedPenalties);
      }
    } catch (error) {
      activeTab === "rewards" ? setRewards([]) : setPenalties([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, mapItemData]);

  // Table columns
  const tableColumns = useMemo(() => {
    const baseColumns = [
      { key: "date", header: "Date" },
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
  }, [activeTab]);

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
        { title: "Total rewards", count: stats.total },
        {
          title: "Common reward type",
          count:
            stats.commonType !== "N/A"
              ? normalizeText(stats.commonType)
              : stats.commonType,
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
        </motion.div>
      ));
    } else {
      const stats = computePenaltiesStats(penalties);
      return [
        { title: "Total penalties", count: stats.total },
        {
          title: "Common penalty type",
          count:
            stats.commonType !== "N/A"
              ? normalizeText(stats.commonType)
              : stats.commonType,
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="rewards-penalties-page">
      {/* Header */}
      <div className="rewards-penalties-header">
        <div>
          <h1 className="rewards-penalties-title">Rewards & Penalties</h1>
          <p className="rewards-penalties-description">
            View your personal rewards and penalties. Track your achievements
            and disciplinary actions.
          </p>
        </div>
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
          emptyStateDescription="No records available at this time"
          onRowClick={(item) => setSelectedItem(item)}
        />
      </div>

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
