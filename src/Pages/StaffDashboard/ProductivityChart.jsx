import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

export default function ProductivityChart({ dataSets }) {
  const [filter, setFilter] = useState("today");

  const xKey =
    filter === "today"
      ? "time"
      : filter === "week"
      ? "day"
      : filter === "month"
      ? "day"
      : "month";

  return (
    <div className="oil-UUJus">
      {/* Filter buttons */}
     <div className="olkl-GG-ol">
  {["today", "week", "month", "year"].map((f) => (
    <motion.button
      key={f}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setFilter(f)}
      className={`filter-btn ${filter === f ? "active" : ""}`}
      style={{
        minWidth: "60px",
        padding: "6px 12px",
        borderRadius: "30px",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "500",
        textAlign: "center",
      }}
    >
      {f === "today"
        ? "Today"
        : f === "week"
        ? "This Week"
        : f === "month"
        ? "This Month"
        : "This Year"}
    </motion.button>
  ))}
</div>


      {/* Line Chart */}
      <div style={{ width: "100%", height: "250px" }}>
        <ResponsiveContainer>
          <LineChart
            data={dataSets[filter]}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: "12px" }} />

            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
