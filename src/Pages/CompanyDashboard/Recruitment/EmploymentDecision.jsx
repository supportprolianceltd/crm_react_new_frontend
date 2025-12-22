import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CheckIcon,
  ArrowTrendingUpIcon,
  PencilIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

import SampleCV from '../../../assets/resume.pdf';

/* -------------------------------------------------------------------------- */
/*  SAMPLE DATA                                                               */
/* -------------------------------------------------------------------------- */
const initialApplicants = [
  { initials: 'JS', name: 'James Smith',  position: 'Software Engineer', appliedDate: '2023‑06‑15', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '5 years', education: 'MSc CS' },
  { initials: 'OJ', name: 'Olivia Johnson',position: 'UX Designer',       appliedDate: '2023‑06‑18', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '4 years', education: 'BFA Design' },
  { initials: 'WB', name: 'William Brown',  position: 'Product Manager',  appliedDate: '2023‑06‑12', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '6 years', education: 'MBA' },
  { initials: 'EJ', name: 'Emma Jones',     position: 'Data Analyst',     appliedDate: '2023‑06‑20', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '3 years', education: 'BSc Statistics' },
  { initials: 'BG', name: 'Benjamin Garcia',position: 'DevOps Engineer',  appliedDate: '2023‑06‑14', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '4 years', education: 'BSc CS' },
  { initials: 'AM', name: 'Ava Miller',     position: 'Frontend Dev',     appliedDate: '2023‑06‑16', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '2 years', education: 'BSc Web Dev' },
  { initials: 'MD', name: 'Michael Davis',  position: 'Backend Engineer', appliedDate: '2023‑06‑11', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '5 years', education: 'MSc SE' },
  { initials: 'SW', name: 'Sophia Wilson',  position: 'QA Engineer',      appliedDate: '2023‑06‑19', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '3 years', education: 'BSc CS' },
  { initials: 'EM', name: 'Elijah Moore',   position: 'Full‑stack Dev',   appliedDate: '2023‑06‑13', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '4 years', education: 'BSc IT' },
  { initials: 'IT', name: 'Isabella Taylor',position: 'Project Manager',  appliedDate: '2023‑06‑17', status: 'Pending', decision: 'Pending', note: '', confirmedBy: '', experience: '7 years', education: 'MBA' }
];

/* -------------------------------------------------------------------------- */
/*  PERFORMANCE GRAPH                                                         */
/* -------------------------------------------------------------------------- */
const PerformanceGraph = ({ data }) => {
  const maxScore = 100;
  const height   = 250;
  const padding  = 40;
  const [width, setWidth] = useState(800);

  /* responsive width ------------------------------------------------------ */
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.performance-graph-container');
      if (container) setWidth(container.clientWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  /* average score for legend --------------------------------------------- */
  const averageScore = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(data.reduce((acc, cur) => acc + cur.score, 0) / data.length);
  }, [data]);

  /* coordinates for each point ------------------------------------------- */
  const points = useMemo(() => {
    if (!width) return [];
    return data.map((item, i) => {
      const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (item.score / maxScore) * (height - 2 * padding);
      return { ...item, x, y };
    });
  }, [width, data]);

  /* SVG path string ------------------------------------------------------- */
  const linePath = useMemo(
    () =>
      points.reduce(
        (acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`),
        ''
      ),
    [points]
  );

  if (!width) return null;

  /* render ---------------------------------------------------------------- */
  return (
    <div className="performance-graph-container" style={{ width: '100%' }}>
      <div className="graph-header">
        <h3>
          Process Metrics <ArrowTrendingUpIcon className="inline h-5 w-5" />
        </h3>
        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#7226FF' }} />
            <span>Performance Score – {averageScore}%</span>
          </div>
        </div>
      </div>

      <svg width={width} height={height} className="performance-graph">
        {/* horizontal grid lines */}
        {[0, 25, 50, 75, 100].map(score => {
          const y = height - padding - (score / maxScore) * (height - 2 * padding);
          return (
            <g key={score}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fill="#5d5677"
                fontSize={12}
              >
                {score}%
              </text>
            </g>
          );
        })}

        {/* x‑axis labels */}
        {points.map(p => (
          <text
            key={p.stage}
            x={p.x}
            y={height - padding + 20}
            textAnchor="middle"
            fill="#5d5677"
            fontSize={12}
          >
            {p.stage}
          </text>
        ))}

        {/* animated line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#7226FF"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* data points */}
        <AnimatePresence>
          {points.map(p => (
            <motion.circle
              key={p.stage}
              cx={p.x}
              cy={p.y}
              r={0}
              fill="#7226FF"
              initial={{ r: 0 }}
              animate={{ r: 6 }}
              transition={{ delay: 0.5 + points.indexOf(p) * 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
            />
          ))}
        </AnimatePresence>

        {/* score labels */}
        {points.map(p => (
          <motion.text
            key={`${p.stage}-score`}
            x={p.x}
            y={p.y - 15}
            textAnchor="middle"
            fill="#372580"
            fontWeight={600}
            fontSize={10}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + points.indexOf(p) * 0.2 }}
          >
            {p.score}%
          </motion.text>
        ))}

        {/* axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e2e8f0"
          strokeWidth={1.5}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#e2e8f0"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  EMPLOYMENT‑DECISION COMPONENT                                            */
/* -------------------------------------------------------------------------- */
const EmploymentDecision = ({ onClose }) => {
  /* state ---------------------------------------------------------------- */
  const [searchValue,       setSearchValue]   = useState('');
  const [selectedInitials,  setSelected]      = useState('JS');
  const [applicants,        setApplicants]    = useState(initialApplicants);
  const [notification,      setNotification]  = useState(null);

  const [isModalOpen,       setIsModalOpen]   = useState(false);
  const [modalMode,         setModalMode]     = useState('add');
  const [modalInit,         setModalInit]     = useState(null);
  const [noteDraft,         setNoteDraft]     = useState('');
  const [confirmerName,     setConfirmerName] = useState('');
  const [modalError,        setModalError]    = useState(null);
  const [saving,            setSaving]        = useState(false);

  /* pre‑fill modal when opened ------------------------------------------ */
  useEffect(() => {
    if (!isModalOpen) return;
    const current = applicants.find(a => a.initials === modalInit);
    setNoteDraft(current?.note || '');
    setConfirmerName(current?.confirmedBy || '');
    setModalError(null);
  }, [isModalOpen, modalInit, applicants]);

  /* filtered list for sidebar ------------------------------------------- */
  const filteredApplicants = useMemo(() => {
    if (!searchValue.trim()) return applicants;
    const q = searchValue.toLowerCase();
    return applicants.filter(
      ({ name, initials }) =>
        name.toLowerCase().includes(q) ||
        initials.toLowerCase().includes(q)
    );
  }, [searchValue, applicants]);

  /* currently selected applicant ---------------------------------------- */
  const selectedApplicant = useMemo(
    () => applicants.find(app => app.initials === selectedInitials),
    [applicants, selectedInitials]
  );

  /* performance‑graph data ---------------------------------------------- */
  const performanceData = useMemo(() => {
    const confirmed = selectedApplicant?.note && selectedApplicant?.confirmedBy;
    return [
      { stage: 'Application', score: 100 },
      { stage: 'Interview',   score: 100 },
      { stage: 'Compliance',  score: 100 },
      { stage: 'Decision',    score: confirmed ? 100 : 50 }
    ];
  }, [selectedApplicant]);

  /* change decision select ---------------------------------------------- */
  const changeDecision = (init, decision) => {
    setApplicants(prev =>
      prev.map(app =>
        app.initials === init ? { ...app, decision } : app
      )
    );
  };

  /* open modal helpers --------------------------------------------------- */
  const openAddNoteModal  = () => {
    if (!selectedApplicant || selectedApplicant.decision === 'Pending') return;
    setModalMode('add');
    setModalInit(selectedApplicant.initials);
    setIsModalOpen(true);
  };
  const openEditNoteModal = () => {
    if (!selectedApplicant) return;
    setModalMode('edit');
    setModalInit(selectedApplicant.initials);
    setIsModalOpen(true);
  };

  /* save note with 3‑second delay --------------------------------------- */
  const saveNote = () => {
    if (!confirmerName.trim()) {
      setModalError('Please enter the name of the person confirming the decision.');
      return;
    }
    setSaving(true);

    setTimeout(() => {
      setApplicants(prev =>
        prev.map(app =>
          app.initials === modalInit
            ? {
                ...app,
                status: app.decision,   // status takes chosen decision (Hired/Rejected)
                note: noteDraft.trim(),
                confirmedBy: confirmerName.trim()
              }
            : app
        )
      );
      setSaving(false);
      setIsModalOpen(false);

      const appName = applicants.find(a => a.initials === modalInit)?.name || '';
      setNotification({
        type: 'success',
        message: `Note ${modalMode === 'add' ? 'saved' : 'updated'} for ${appName}`
      });
      setTimeout(() => setNotification(null), 3000);
    }, 3000);
  };

  /* ---------------------------------------------------------------------- */
  /*  RENDER                                                                */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="EmploymentDecision">
      {/* close button */}
      <button className="EmploymentDecision-btn" onClick={onClose}>
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* blurred backdrop behind panel */}
      <div className="EmploymentDecision-Body" onClick={onClose} />

      {/* sliding main panel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="EmploymentDecision-Main"
      >
        {/* LEFT SIDEBAR – applicant list */}
        <div className="DocComplianceCheck-Part">
          <div className="DocComplianceCheck-Part-Top">
            <h3 className="ool-HHUha">Applicants <span>Total: {filteredApplicants.length}</span></h3>
          </div>

          <div className="paoli-UJao">
            {/* search box */}
            <div className="paoli-UJao-TOp">
              <div className="genn-Drop-Search">
                <span><MagnifyingGlassIcon className="h-5 w-5 text-gray-500" /></span>
                <input
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Search for applicant"
                />
              </div>
            </div>

            {/* list */}
            <ul className="custom-scroll-bar">
              {filteredApplicants.map(({ initials, name }) => (
                <li
                  key={initials}
                  className={selectedInitials === initials ? 'active-LLOK' : undefined}
                  onClick={() => setSelected(initials)}
                >
                  <span>{initials}</span>
                  <p>{name}</p>
                </li>
              ))}

              {filteredApplicants.length === 0 && (
                <div className="empty-state-li">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  >
                    <ExclamationTriangleIcon />
                  </motion.div>
                  <span>No applicant matches “{searchValue}”</span>
                </div>
              )}
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL – details */}
        <div className="DocComplianceCheck-Part">
          <div className="DocComplianceCheck-Part-Top"><h3>Employment Decision</h3></div>

          {/* applicant card */}
          <div className="ssen-regs">
            <div className="ssen-regs-1"><span>{selectedApplicant?.initials}</span></div>
            <div className="ssen-regs-2">
              <div>
                <h4>{selectedApplicant?.name}</h4>
                <p className="olik-PPO">
                  Status:{' '}
                  <span className={`All-status-badge ${selectedApplicant?.status.toLowerCase()}`}>
                    {selectedApplicant?.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* main table & graph ------------------------------------------------ */}
          <div className="OOlaols-POpp custom-scroll-bar">
            <div className="Dash-OO-Boas dOikpO-PPol oluja-PPPl olika-ola">
              <div className="table-container">
                <table className="Gen-Sys-table">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Application</th>
                      <th>Interview</th>
                      <th>Compliance</th>
                      <th>Status</th>
                      <th>Decision</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedApplicant && (
                      <tr key={selectedApplicant.initials}>
                        <td>{selectedApplicant.position}</td>
                        <td>
                          <div className="HHH-DDGha checkedd-ppo">
                            Checked <CheckIcon />
                          </div>
                        </td>
                        <td>
                          <div className="HHH-DDGha olik-TTTDRF">
                            Completed <span>100%</span>
                          </div>
                        </td>
                        <td>
                          <div className="gen-td-btns">
                            <a
                              href={SampleCV}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-btn"
                            >
                              <DocumentTextIcon className="h-5 w-5 mr-1" />
                              View Report
                            </a>
                          </div>
                        </td>
                        <td>
                          <span className={`All-status-badge ${selectedApplicant.status.toLowerCase()}`}>
                            {selectedApplicant.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={selectedApplicant.decision}
                            onChange={e => changeDecision(selectedApplicant.initials, e.target.value)}
                            className="decision-select"
                          >
                            <option value="Pending" disabled>Select</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="confirm-btn"
                            disabled={selectedApplicant.decision === 'Pending'}
                            onClick={openAddNoteModal}
                          >
                            <CheckBadgeIcon className="h-5 w-5" />Confirm
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* existing note block --------------------------------------- */}
              {selectedApplicant?.note && (
                <div className="applicant-note">
                  <div className="applicant-note-Box">
                    <h4>
                      Decision Note
                      <button onClick={openEditNoteModal}>
                        <PencilIcon className="inline-block h-5 w-5" />
                        Edit Note
                      </button>
                    </h4>
                    <p>{selectedApplicant.note}</p>
                    {selectedApplicant.confirmedBy && (
                      <p className="coool-Pla">
                        Confirmed by: <span>{selectedApplicant.confirmedBy}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* performance graph */}
              <div className="performance-Grapph">
                <PerformanceGraph data={performanceData} />
              </div>

              {/* toast notification */}
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`notification ${notification.type}`}
                >
                  {notification.message}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/*  NOTE MODAL                                                        */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="noteModal"
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => {
              if (e.target.classList.contains('modal-overlay')) setIsModalOpen(false);
            }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3000
            }}
          >
            <motion.div
              className="modal-content custom-scroll-bar okauj-MOadad"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                padding: '1.5rem',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
            >
              <h3 className="oll-paolsl" style={{ marginBottom: '1rem' }}>
                {modalMode === 'add' ? 'Add' : 'Edit'} Decision Note for&nbsp;
                <span className="oouk-SPOPol">{selectedApplicant?.name}</span>
              </h3>

              {/* confirmer name */}
              <label>Name of person confirming the decision</label>
              <input
                type="text"
                value={confirmerName}
                onChange={e => {
                  setConfirmerName(e.target.value);
                  setModalError(null);
                }}
                placeholder="Enter your name"
                className="oujka-Inpuauy"
              />

              {/* validation error */}
              <AnimatePresence>
                {modalError && (
                  <motion.div
                    key="modal-error"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="modal-error-message oials-ola"
                    style={{
                      color: '#ff4d4f',
                      background: '#fff2f0',
                      padding: '0.5rem',
                      borderRadius: 4,
                      border: '1px solid #ffccc7',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="olail-PPOla">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 10 }}
                      >
                        <ExclamationTriangleIcon />
                      </motion.div>
                      <span>{modalError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* textarea */}
              <div className="GGtg-DDDVa">
                <label>Add Note</label>
                <textarea
                  rows={5}
                  value={noteDraft}
                  onChange={e => setNoteDraft(e.target.value)}
                  placeholder="Add your note here..."
                  className="oujka-Inpuauy OIUja-Tettxa"
                  style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* buttons */}
              <div
                className="oioak-POldj-BTn"
                style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}
              >
                <button onClick={() => setIsModalOpen(false)} className="CLCLCjm-BNtn">
                  Cancel
                </button>

                <button
                  onClick={saveNote}
                  className="btn-primary-bg"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {saving && (
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        border: '3px solid #fff',
                        borderTopColor: 'transparent',
                        marginRight: 5
                      }}
                    />
                  )}
                  {saving ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmploymentDecision;
