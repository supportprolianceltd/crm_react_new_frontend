import React from 'react';
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import MediIcon1 from '../Img/MedicationIcons/medi1.svg';
import MediIcon2 from '../Img/MedicationIcons/medi2.svg';
import MediIcon3 from '../Img/MedicationIcons/medi3.svg';
import MediIcon4 from '../Img/MedicationIcons/medi4.svg';

const base = "/company/rostering/profile/medications";

// Animation variants for sliding from right
const slideInRight = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.2, type: "spring", stiffness: 100 }
  })
};

const Home = () => {
  const links = [
    {
      to: `${base}/medication-scheduler`,
      title: "Medication Scheduler",
      desc: "View and update client medications",
      icon: MediIcon1,
      className: "Medi-1",
    },
    {
      to: `${base}/medication-monitoring`,
      title: "Medication Monitoring",
      desc: "Monitor clients MAR chart in real time",
      icon: MediIcon2,
      className: "Medi-2",
    },
    {
      to: `${base}/personal-details`,
      title: "Personal Details",
      desc: "Update Clients medical information including allergies",
      icon: MediIcon3,
      className: "Medi-3",
    },
    {
      to: `${base}/help-and-support`,
      title: "Help and Support",
      desc: "Learn how to use medication manager",
      icon: MediIcon4,
      className: "Medi-4",
    },
  ];

  return (
    <div className='Medications-Page'>
      <div className='Medications-Box'>
        <div className='Medications-Box-Top'>
          <p>View and manage the client’s current and past medications to support accurate and timely administration</p>
        </div>
        <div className='Medications-Box-Main'>
          {links.map((link, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              whileHover={{ scale: 1.01 }} // subtle zoom on hover
            >
              <Link to={link.to} className={`Medi-Link ${link.className}`}>
                <div className='Medi-Link-1'>
                  <div><img src={link.icon} alt={link.title} /></div>
                </div>
                <div className='Medi-Link-2'>
                  <div>
                    <h4>{link.title}</h4>
                    <p>{link.desc}</p>
                  </div>
                </div>
                <div className='Medi-Link-3'>
                  <div><ChevronRightIcon /></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
