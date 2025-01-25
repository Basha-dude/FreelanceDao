import React from 'react'
import { Link } from 'react-router-dom'; // Import Link



const Navbar = ({connectWallet,wallet}) => {
  return (
 
 <nav style={{ display: 'flex', gap: '20px', padding: '10px', backgroundColor: '#f4f4f4' }}>
     <Link to="/create">CREATE</Link>
    <Link to="/enroll">ENROLL</Link>
    
   { wallet ? `${wallet.slice(0,6)}.....${wallet.slice(wallet.length -5)}` :
    <button onClick={connectWallet}>Connect wallet</button>}


    </nav>
    

  )
}

export default Navbar