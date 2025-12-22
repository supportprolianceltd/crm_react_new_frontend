import React from 'react';
import { motion } from 'framer-motion';
import FrontSVG from './FrontSVG';
import BackSVG from './BackSVG';

const Object = ({ isFrontView }) => {
  return (
     <motion.div
      className='Object-Secs'
      initial={false}
      animate={{ rotateY: isFrontView ? 0 : 180 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {isFrontView ? <FrontSVG /> : <BackSVG />}
    </motion.div>
  );
};

export default Object;
