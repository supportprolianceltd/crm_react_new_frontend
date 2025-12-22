import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BodyMap.css';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Object from './Object';

const BodyMap = () => {
  const navigate = useNavigate();
  const [isFrontView, setIsFrontView] = useState(true);

  // Active state for <span> indicators
  const [activeSpan, setActiveSpan] = useState(0);

  // Active state for body part buttons
  const [activeButton, setActiveButton] = useState("Full Body");

  const goBack = () => {
    try {
      sessionStorage.setItem('scrollTo', 'body-map');
    } catch (e) {
      // ignore
    }
    navigate(-1);
  };

  const bodyParts = [
    "Full Body",
    "Face",
    "Neck",
    "Chest",
    "Right Hand",
    "Left Hand",
    "Right Foot",
    "Left Foot",
    "Pelvis",
    "Hips",
    "Wrist",
    "Thigh (Front View)",
    "Thigh (Back View)"
  ];

  return (
    <div className='BBcsmp-SeC'>
      <div className='DDD-PPLso-1-Top'>
        <span
          role='button'
          tabIndex={0}
          onClick={goBack}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goBack(); }}
        >
          <ArrowLeftIcon /> Go Back
        </span>
      </div>

      <div className='BBcsmp-SeC-Main'>
        <div className='BBcsmp-SeC-Box'>
          <div className='BBMPInfo-Palt-Top'>
            <h3>Body Map</h3>
            <p>
              Tap the area of the body you wish to document, add notes or photos,
              and describe the type and severity of the mark.
            </p>
          </div>

          {/* --- Switch Button Section --- */}
          <div className='Subb-TTons'>
            <div
              className='switch-container'
              onClick={() => setIsFrontView(!isFrontView)}
            >
              <motion.div
                className='switch-slider'
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                animate={{ x: isFrontView ? 0 : '100%' }}
              />
              <span className={`switch-label ${isFrontView ? 'active' : ''}`}>Front View</span>
              <span className={`switch-label ${!isFrontView ? 'active' : ''}`}>Back View</span>
            </div>

            <div className='BBGns-IIMSh'>
              {/* SPANS group */}
              <div className='BBGns-IIMSh-Part'>
                <div className='IIMSh-HHdn-Sooa'>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={activeSpan === i ? 'active' : ''}
                      onClick={() => setActiveSpan(i)}
                    ></span>
                  ))}
                </div>
              </div>

              {/* BUTTONS group */}
              <div className='BBGns-IIMSh-Part'>
                <div className='structure-Secc'>
                   <Object isFrontView={isFrontView} />
                </div>
              </div>
              <div className='BBGns-IIMSh-Part'>
                <div className='ppaths-Btns'>
                  {bodyParts.map((part) => (
                    <button
                      key={part}
                      className={activeButton === part ? 'active' : ''}
                      onClick={() => setActiveButton(part)}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyMap;
