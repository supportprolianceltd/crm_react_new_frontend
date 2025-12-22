import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllUsers, createDirectChat, sendMessageToUser } from '../../Pages/CompanyDashboard/Recruitment/ApiService'; // <-- adjust path if needed
import Pagination from '../../components/Table/Pagination';




import Messaging from './Messaging';

import NoTeamMember from './Img/no-team-member.png';


const TeamMembers = ({ onMessageClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showMessaging, setShowMessaging] = useState(false);
    const [selectedSender, setSelectedSender] = useState(null);
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

  const messagingVariants = {
    hidden: { y: 100, opacity: 0, scale: 0.9 },
    visible: { y: 0, opacity: 1, scale: 1 },
    exit: { y: 100, opacity: 0, scale: 0.9 },
  };

const updateMessageCounts = () => {
   const updatedTeamData = teamData.map((member) => {
     const storageKey = `chatMessages_${member.name.replace(/\s+/g, '_')}`;
     const messages = JSON.parse(localStorage.getItem(storageKey) || '[]');

     // Count only unread messages
     const unreadCount = messages.filter(
       msg => msg.direction === 'received' && !msg.read
     ).length;

     return { ...member, messages: unreadCount };
   });
   setTeamData(updatedTeamData);
 };

  // Fetch users on component mount and when page changes
   useEffect(() => {
     const fetchUsers = async () => {
       try {
         setLoading(true);
         const params = { page: currentPage };
         if (searchTerm) {
           params.search = searchTerm;
         }
         const response = await fetchAllUsers();
         const users = response.results || [];

         // Transform user data to match component's expected format
         const transformedUsers = users.map((user) => ({
           id: user.id,
           staffId: user.profile?.employee_id || user.id || 'N/A',
           initials: user.first_name && user.last_name
             ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
             : user.username ? user.username.slice(0, 2).toUpperCase() : 'U',
           name: user.first_name && user.last_name
             ? `${user.first_name} ${user.last_name}`
             : user.username || 'Unknown User',
           active: user.status === 'active',
           messages: 0, // Will be updated by updateMessageCounts
           img: user.profile?.profile_image_url || null,
           email: user.email,
           jobRole: user.job_role || '',
           department: user.profile?.department || '',
         }));

         setTeamData(transformedUsers);
         setTotalCount(response.count || 0);
         setTotalPages(Math.ceil((response.count || 0) / 10));
         setError(null);
       } catch (err) {
         console.error('Error fetching users:', err);
         setError('Failed to load team members');
         setTeamData([]);
       } finally {
         setLoading(false);
       }
     };

     fetchUsers();
   }, [currentPage, searchTerm]);

  // Initial load and listen for storage changes
  useEffect(() => {
    if (teamData.length > 0) {
      // Initial update
      updateMessageCounts();

      // Listen for storage changes (e.g., when a new message is added)
      const handleStorageChange = (e) => {
        if (e.key && e.key.startsWith('chatMessages_')) {
          updateMessageCounts();
        }
      };

      window.addEventListener('storage', handleStorageChange);

      // Poll for changes in the same tab (since 'storage' event doesn't fire in the same window)
      const interval = setInterval(() => {
        updateMessageCounts();
      }, 1000);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [teamData.length]); // Changed dependency to avoid infinite re-renders

const handleMessageClick = async (member) => {
  try {
    // Create or get direct chat with the selected user
    const chat = await createDirectChat(member.id);

    // Update the member with chat information
    const updatedMember = {
      ...member,
      chatId: chat.id,
    };

    setSelectedSender(updatedMember);
    setShowMessaging(true);
  } catch (error) {
    console.error('Error creating chat:', error);
    // Fallback to localStorage messaging if API fails
    setSelectedSender(member);
    setShowMessaging(true);
  }
};
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

   const toggleSearch = () => {
     setShowSearch((prev) => {
       if (prev) {
         setSearchTerm('');
         setCurrentPage(1); // Reset to first page when closing search
       }
       return !prev;
     });
   };

   const handlePageChange = (page) => {
     setCurrentPage(page);
   };

  const filteredTeam = teamData.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.staffId && typeof member.staffId === 'string' && member.staffId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="OverViewGraphs-Card Gen-Boxshadow">
      <div className="OVG-Header">
        <div className="OVG-Header-L">
          <h3>Team Members</h3>
        </div>
        <div
          className="ssstgaj"
          onClick={toggleSearch}
          style={{ cursor: 'pointer' }}
        >
          <p>{totalCount > 10 ? '10+' : totalCount}</p>
          <span>
            <MagnifyingGlassIcon />
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            className="Seachh-EcM"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="Seachh-EcM-Main">
              <span>
                <MagnifyingGlassIcon />
              </span>
              <input
                type="text"
                placeholder="Search for a team member"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <span
                className="searhc-CloSee"
                onClick={toggleSearch}
                style={{ cursor: 'pointer' }}
              >
                <XMarkIcon />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="TeamMembers custom-scroll-bar">
        {loading ? (
          <div className='Nol-HHSM'>
            <p>Loading team members...</p>
          </div>
        ) : error ? (
          <div className='Nol-HHSM'>
            <p>{error}</p>
          </div>
        ) : filteredTeam.length > 0 ? (
          filteredTeam.map((member, index) => (
            <div key={member.staffId || index} className="TeamMembers-Card">
              <div className="TeamMembers-Card-Part1">
                <div className="TeamMembers-Card-Part11">
                  {member.img ? (
                    <img src={member.img} alt={member.name} />
                  ) : (
                    <span>{member.initials}</span>
                  )}
                </div>
                <div className="TeamMembers-Card-Part12">
                  <p>{member.name}</p>
                  <span>Staff id: {member.staffId}</span>
                  {/* {member.jobRole && <span>{member.jobRole}</span>}
                  {member.department && <span>{member.department}</span>} */}
                </div>
              </div>
              <div className="TeamMembers-Card-Part2">
                <ul>
                  <li className="Avil-Status">
                    <i className={member.active ? 'active' : ''}></i>
                    {member.active ? 'Active' : 'Offline'}
                  </li>
                  <li>
                    {/* <span
                      onClick={() => handleMessageClick(member)}
                      style={{ cursor: 'pointer' }}
                    >
                      <ChatBubbleLeftRightIcon />
                      {member.messages > 0 && (
                        <b>{member.messages > 5 ? '5+' : member.messages}</b>
                      )}
                    </span> */}
                  </li>
                </ul>
              </div>
            </div>
          ))
        ) : (
          <div className='Nol-HHSM'>
            <img src={NoTeamMember} />
            <p>No team member found.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}


      <AnimatePresence>
        {showMessaging && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowMessaging(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                zIndex: 2000,
              }}
            />

            {/* Messaging Panel */}
            <motion.div
              key="messaging-panel"
              variants={messagingVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="ppol-Messaging-Section"
            >
              <Messaging
                closeMessaging={() => setShowMessaging(false)}
                sender={selectedSender}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMembers;