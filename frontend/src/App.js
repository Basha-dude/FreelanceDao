import './App.css';
import Navbar from './components/Navbar';  
import { ethers } from "ethers";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes and Route
import  Create  from "./components/Create";
import Enroll from './components/Enroll';
//config.json file is exporting an object as the default export, not named exports.
import config from "./abi/config.json"; // Import the entire config object
import FreeLanceDao from "./abi/contracts/FreeLanceDAO.sol/FreeLanceDAO.json"

const { GovernanceTokenAddress, timeLockAddress, myGovernorAddress, freeLanceDAOAddress } = config; 



/* Enroll has nice but need to make it advanced one*/
function App() {
  const [wallet, setwallet] = useState("")
  const [contract, setContract] = useState("")
  const [freelancerDetails, setfreelancerDetails] = useState({
    name:'',
    skills:'',
    bio:'',
    amount:'',
    isUsd:''

  })

  const FreelanceAddress = freeLanceDAOAddress
  const FreelanceAddressAbi = FreeLanceDao.abi

  const connectWallet = async() => {
    console.log("wallet");
    try {
      if (window.ethereum) {
     const accounts =   await window.ethereum.request({
      "method": "eth_requestAccounts",
      "params": [],
     });
     const provider = new ethers.BrowserProvider(window.ethereum)
     const signer = await provider.getSigner()
     const contractInstance =  new ethers.Contract(FreelanceAddress,FreelanceAddressAbi,signer)
     setContract(contractInstance)

     setwallet(accounts[0])
     console.log(accounts[0]);
     
    
         }    
    } catch (error) {
       console.log(error);
       
    }   
  }


  const enrollFreelancer = async() => {
     console.log("contract",contract); 
     setfreelancerDetails(freelancerDetails)
     if (freelancerDetails) {
      console.log("freelancerDetails",freelancerDetails);
      
     }

  }
  return (
    <Router>
    <div className="App">
    <h2>FreeLance DAO world </h2>
    </div>
      <Navbar connectWallet={connectWallet} wallet={wallet} />
    <Routes>
    
     
     <Route path='/create' element={<Create />} ></Route>
     <Route path='/enroll' element={<Enroll enrollFreelancer={enrollFreelancer} 
     setfreelancerDetails={setfreelancerDetails} 
     freelancerDetails={freelancerDetails} />}></Route>
  
   

    
    </Routes>
   
    </Router>
  );
}

export default App;
