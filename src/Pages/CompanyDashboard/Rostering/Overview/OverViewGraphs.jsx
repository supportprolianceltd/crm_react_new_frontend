import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { apiClient } from '../../../../config';
import '../css/OverViewGraphs-Seec.css';

// Utility to format date labels
const formatDate = (date, format) => {
  const options = { month: 'short' };
  if (format === 'month') return date.toLocaleString('en-US', options);
  if (format === 'weekday') return date.toLocaleDateString('en-US', { weekday: 'short' });
  if (format === 'hour') return `${date.getHours()}:00`;
  if (format === 'day') return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  return '';
};

const timeRanges = ['12 months', '3 months', '30 days', '7 days', '24 hours'];

const getDataByRange = (range) => {
  const now = new Date();
  let result = [];

  switch (range) {
    case '12 months':
      const calendarMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      result = calendarMonths.map(month => ({
        month,
        value: 200 + Math.floor(Math.random() * 300),
      }));
      break;

    case '3 months':
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push({
          month: d.toLocaleString('en-US', { month: 'short' }),
          value: 200 + Math.floor(Math.random() * 300),
        });
      }
      break;

    case '30 days':
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        result.push({
          month: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          value: 150 + Math.floor(Math.random() * 200),
        });
      }
      break;

    case '7 days':
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        result.push({
          month: d.toLocaleDateString('en-US', { weekday: 'short' }),
          value: 100 + Math.floor(Math.random() * 150),
        });
      }
      break;

    case '24 hours':
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(now.getHours() - i);
        result.push({
          month: `${d.getHours()}:00`,
          value: 80 + Math.floor(Math.random() * 60),
        });
      }
      break;

    default:
      return [];
  }

  return result;
};

const calculateRealVisitData = (visits, range) => {
  const now = new Date();
  let result = [];
  let timePoints = [];

  // Generate time points based on range
  if (range === '12 months') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    timePoints = months.map((month, index) => ({
      label: month,
      start: new Date(now.getFullYear(), index, 1),
      end: new Date(now.getFullYear(), index + 1, 0, 23, 59, 59)
    }));
  } else if (range === '3 months') {
    for (let i = 2; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      timePoints.push({
        label: start.toLocaleString('en-US', { month: 'short' }),
        start,
        end
      });
    }
  } else if (range === '30 days') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      timePoints.push({
        label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        start,
        end
      });
    }
  } else if (range === '7 days') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      timePoints.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        start,
        end
      });
    }
  } else if (range === '24 hours') {
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(now.getHours() - i, 0, 0, 0);
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(date.getHours(), 59, 59, 999);
      timePoints.push({
        label: `${date.getHours()}:00`,
        start,
        end
      });
    }
  }

  // Calculate visit metrics for each time point
  result = timePoints.map(({ label, start, end }) => {
    const timeVisits = visits.filter(visit => {
      const visitDate = new Date(visit.startDate);
      return visitDate >= start && visitDate <= end;
    });

    const totalVisits = timeVisits.length;
    const completedVisits = timeVisits.filter(visit => visit.status === 'COMPLETED').length;
    const remainingVisits = totalVisits - completedVisits;
    const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

    return {
      month: label,
      Completed: completedVisits,
      Assigned: remainingVisits,
      completionRate
    };
  });

  return result;
};

const OverViewGraphs = ({ selectedDate, visits = [], allVisits = [] }) => {
  // Separate state for each graph
  const [selectedRequestRange, setSelectedRequestRange] = useState('24 hours');
  const [selectedVisitRange, setSelectedVisitRange] = useState('24 hours');

  // Memoized data for each graph
  const filteredRequestData = useMemo(() => 
    getDataByRange(selectedRequestRange), 
    [selectedRequestRange]
  );
  
  const visitBarData = useMemo(() => {
    // Use passed visits for current day 24h view, allVisits for historical ranges
    const dataSource = selectedVisitRange === '24 hours' ? visits : allVisits;
    return calculateRealVisitData(dataSource, selectedVisitRange);
  }, [visits, allVisits, selectedVisitRange]);

  // Get current time for last updated display
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getLastUpdated = () => {
    const dataToCheck = visits.length > 0 ? visits : allVisits;
    if (dataToCheck.length === 0) return 'Never';
    
    const lastVisit = dataToCheck.reduce((latest, visit) => {
      const visitUpdated = new Date(visit.updatedAt || visit.startDate);
      const latestUpdated = new Date(latest.updatedAt || latest.startDate);
      return visitUpdated > latestUpdated ? visit : latest;
    });
    
    const updatedTime = new Date(lastVisit.updatedAt || lastVisit.startDate);
    const now = new Date();
    const diffMs = now - updatedTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className='OverViewGraphs-Seec'>
      {/* Request Over Time Card */}
      <motion.div
        className='OverViewGraphs-Card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className='OVG-Header'>
          <div className='OVG-Header-L'>
            <h3>Request Over Time</h3>
          </div>
        </div>

        <div className='OVG-Tabs'>
          {timeRanges.map(range => (
            <motion.button
              key={`request-${range}`}
              onClick={() => setSelectedRequestRange(range)}
              className={`OVG-Tab ${selectedRequestRange === range ? 'active' : ''}`}
              whileTap={{ scale: 0.95 }}
            >
              {range}
            </motion.button>
          ))}
        </div>

        <div className='OVG-Chart'>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart
              data={filteredRequestData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#f3f4f6" />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />

              <YAxis hide />

              <Tooltip
                formatter={(value) => [`${value}`, 'Request']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                fill="url(#colorPurple)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Visit Over Time Card */}
      <motion.div
        className='OverViewGraphs-Card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
          <div className='OVG-Header'>
          <div className='OVG-Header-L'>
            <h3>Visit Over Time</h3>
          </div>
          {/* <div className='OVG-Header-R'>
            <p>
              <span>{getCurrentTime()}</span>
              <span>{getLastUpdated()}</span>
            </p>
            <a href='#'>View report</a>
          </div> */}
        </div>

        <div className='OVG-Tabs'>
          {timeRanges.map(range => (
            <motion.button
              key={`visit-${range}`}
              onClick={() => setSelectedVisitRange(range)}
              className={`OVG-Tab ${selectedVisitRange === range ? 'active' : ''}`}
              whileTap={{ scale: 0.95 }}
            >
              {range}
            </motion.button>
          ))}
        </div>

        <div className='OVG-Chart'>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={visitBarData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              barCategoryGap={12}
            >
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis hide />
              <Tooltip
                formatter={(value, name) => [`${value}`, name]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: 12 }}
              />

              <Bar
                dataKey="Completed"
                stackId="a"
                fill="#7226FF"
                shape={(props) => {
                  const { x, y, width, height, payload } = props;
                  const color = payload.completionRate >= 50 ? '#7226FF' : '#F042FF';
                  return <rect x={x} y={y} width={width} height={height} fill={color} />;
                }}
              />

              <Bar
                dataKey="Assigned"
                stackId="a"
                fill="#A574FF"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default OverViewGraphs;