import { useState } from 'react'
import { Link } from 'react-router-dom';


function DashFooter() {

  return (
    <footer className='dash-footer'>
      <div className="ggg-Main-DB-Envt">
     <p>© {new Date().getFullYear()} <Link to="/">E3OS</Link>. All rights reserved.</p>
     </div>
    </footer>
  )
}

export default DashFooter

