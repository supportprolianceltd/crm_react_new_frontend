import React from 'react';
import './CoverageMap.css';

import MapObject from './MapObject';

const CoverageMap = () => {
  return (
<div className='CoverageMap'>
    <div className='CovG-1'>
        <div className='CovG-1-Main'></div>
    </div>
    <div className='CovG-2'>
        <MapObject />
    </div>
</div>
  );
};


export default CoverageMap;
