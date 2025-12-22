import { useState } from 'react'
import { Link } from 'react-router-dom';


function DashFooter() {

  return (
    <footer className='dash-footer OOK-Footer'>
     <p>© {new Date().getFullYear()} <Link to="/">E3OS</Link>. All rights reserved.</p>
    </footer>
  )
}

export default DashFooter

