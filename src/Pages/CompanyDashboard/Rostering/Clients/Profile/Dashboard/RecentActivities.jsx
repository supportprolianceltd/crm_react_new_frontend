import React from 'react';

const recentActivities = [
  {
    title: "Medication Check",
    carer: "John Doe",
    date: "2025-10-03",
    time: "10:00 AM",
    status: "Completed",
  },
  {
    title: "Patient Visit",
    carer: "Jane Smith",
    date: "2025-10-04",
    time: "2:00 PM",
    status: "Pending",
  },
  {
    title: "Therapy Session",
    carer: "Mike Johnson",
    date: "2025-10-05",
    time: "11:00 AM",
    status: "InProgress",
  },
];

const statusProgress = {
  Completed: 100,
  InProgress: 50,
  Pending: 0,
};

const RecentActivities = () => {
  return (
    <div className="GLak-BOxsag KLP-TYTY">
      <div className='OverviewVisits-Top'>
        <div className='OverviewVisits-Top-1'>
          <h3>Recent Activities</h3>
        </div>
        <div className='OverviewVisits-Top-2'>
          <a href='#'>See all</a>
        </div>
      </div>

      <div className='EMUSED-Gen-Table-Sec'>
        <table>
          <thead>
            <tr>
              <th><i className='table-Indis'></i></th>
              <th><span>Title </span></th>
              <th><span>Carer </span></th>
              <th><span>Date</span></th>
              <th><span>Time  </span></th>
              <th><span>Status </span></th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((item, index) => (
              <tr key={index}>
                <td><i className='table-Indis'></i></td>
                <td><div className="cclk-TAG"><p>{item.title}</p></div></td>
                <td><div className="cclk-TAG"><p>{item.carer}</p></div></td>
                <td><div className="cclk-TAG"><p>{item.date}</p></div></td>
                <td><div className="cclk-TAG"><p>{item.time}</p></div></td>
                <td>
                  <div className='Prog-Ok-PPLa'>
                    <span className={`vist-pro-status ${item.status.toLowerCase()}`}>{item.status}</span>
                    <h4>{statusProgress[item.status]} / 100 (%)</h4>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivities;
