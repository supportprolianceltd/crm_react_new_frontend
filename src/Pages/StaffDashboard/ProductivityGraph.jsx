import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductivityDashboard = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [animationComplete, setAnimationComplete] = useState(false);

  // Sample task data
  const taskData = {
    week: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      total: [42, 48, 51, 57, 60, 65, 62],
      completed: [18, 25, 32, 38, 45, 52, 58],
      pending: [24, 23, 19, 19, 15, 13, 4],
    },
    month: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      total: [175, 190, 210, 225],
      completed: [80, 95, 125, 150],
      pending: [95, 95, 85, 75],
    },
  };

  const data = taskData[timeRange];

  // Calculate summary statistics
  const totalTasks = data.total.reduce((a, b) => a + b, 0);
  const completedTasks = data.completed.reduce((a, b) => a + b, 0);
  const pendingTasks = data.pending.reduce((a, b) => a + b, 0);
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  // Chart configuration
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Total Tasks",
        data: data.total,
        backgroundColor: "rgba(114, 38, 255, 0.85)",
        borderColor: "rgba(114, 38, 255, 1)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Completed",
        data: data.completed,
        backgroundColor: "rgba(0, 201, 167, 0.85)",
        borderColor: "rgba(0, 201, 167, 1)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Pending",
        data: data.pending,
        backgroundColor: "rgba(240, 66, 255, 0.85)",
        borderColor: "rgba(240, 66, 255, 1)",
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 13,
          },
          usePointStyle: true,
          padding: 20,
          boxWidth: 10,
        },
      },
      title: {
        display: true,
        text: "Task Productivity Overview",
        font: {
          size: 15,
          weight: "600",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
        color: "#372580",
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#333",
        bodyColor: "#333",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        boxPadding: 8,
        usePointStyle: true,
        displayColors: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
          title: function (tooltipItems) {
            return `Day ${tooltipItems[0].label}`;
          },
        },
        bodyFont: {
          size: 13,
        },
        titleFont: {
          size: 14,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        title: {
          display: true,
          text: "Time Period",
          font: {
            size: 14,
            weight: "500",
          },
          padding: {
            top: 10,
          },
          color: "#666",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(237, 242, 247, 0.8)",
          drawBorder: false,
          tickLength: 0,
        },
        title: {
          display: true,
          text: "Number of Tasks",
          font: {
            size: 14,
            weight: "500",
          },
          padding: {
            bottom: 10,
          },
          color: "#666",
        },
        ticks: {
          font: {
            size: 12,
          },
          padding: 8,
        },
      },
    },
    animation: {
      onComplete: () => {
        setAnimationComplete(true);
      },
      delay: (context) => {
        if (context.type === "data" && context.mode === "default") {
          return context.dataIndex * 100 + context.datasetIndex * 200;
        }
      },
      duration: 800,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  // Reset animation state when time range changes
  useEffect(() => {
    setAnimationComplete(false);
  }, [timeRange]);

  return (
    <div className="Produbbsna-Sec Simp-Boxshadow">
      <div className="lolkik-CCOnua">
        <div className="OOOkchart-container">
          <div className="GHGb-MMIn-DDahs-Top ooko-Chht-Tha">
            <div className="olikk-IOkiks">
              <h3>Productivity Dashboard</h3>
            </div>
            <div className="time-range-selector">
              <button
                className={timeRange === "week" ? "active" : ""}
                onClick={() => setTimeRange("week")}
              >
                Weekly
              </button>
              <button
                className={timeRange === "month" ? "active" : ""}
                onClick={() => setTimeRange("month")}
              >
                Monthly
              </button>
            </div>
          </div>

          <Bar data={chartData} options={options} />
        </div>

        <div className="OOOainsights-container">
          <h3>Weekly Insights</h3>
          <div className="insights-content">
            <div className="insight">
              <div className="dot" style={{ backgroundColor: "#00C9A7" }}></div>
              <div>
                <h4>Peak Productivity</h4>
                <p>
                  Your highest task completion was on{" "}
                  {
                    data.labels[
                      data.completed.indexOf(Math.max(...data.completed))
                    ]
                  }
                </p>
              </div>
            </div>
            <div className="insight">
              <div className="dot" style={{ backgroundColor: "#F042FF" }}></div>
              <div>
                <h4>Pending Tasks</h4>
                <p>
                  You have an average of{" "}
                  {Math.round(pendingTasks / data.labels.length)} pending tasks
                  per day
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityDashboard;
