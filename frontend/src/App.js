import './App.css';
import Navbar from './components/Navbar';  
import { ethers } from "ethers";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import  Create  from "./components/Create";
import Enroll from './components/Enroll';
//config.json file is exporting an object as the default export, not named exports.
import config from "./abi/config.json"; // Import the entire config object
import FreeLanceDao from "./abi/contracts/FreeLanceDAO.sol/FreeLanceDAO.json"

const { GovernanceTokenAddress, timeLockAddress, myGovernorAddress, freeLanceDAOAddress } = config; 



/* eth completed need to write for the usd */
function App() {
  const [wallet, setwallet] = useState("")
  const [contract, setContract] = useState("")
  const [freelancerDetails, setfreelancerDetails] = useState({
    name:'',
    skills:'',
    bio:'',
    amount:'',
    isUsd:false

  })

  const FreelanceAddress = freeLanceDAOAddress
  const FreelanceAddressAbi = FreeLanceDao.abi



  const connectWallet = async() => {
    /* i did not know why its happening need to remove the clear activity
 tab of every account in metamask every time when i re-run the node */
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
     

     const handleAccountsChanged = async(accounts) => {
      setwallet(accounts[0]) 
       }
    
    window.ethereum.on("accountsChanged", handleAccountsChanged)
    
         }    
    } catch (error) {
       console.log(error);
       
    }   
  }


  const enrollFreelancerDetails = async() => {
    try {

      console.log("contract",contract); 
      setfreelancerDetails(freelancerDetails)
      if (freelancerDetails) {

        //giving error for the usd code
        if (freelancerDetails.isUsd) {
        //   console.log("logged into usd");
          
        //   const AmountToPayForUsd = await contract.calculatingUsdForEnroll(freelancerDetails.amount)
        //   console.log("USD Amount to Pay:", AmountToPayForUsd.toString());

        //   const TxUsd =  await contract.enrollFreelancer(freelancerDetails.name,freelancerDetails.skills,
           
        //     freelancerDetails.bio,freelancerDetails.amount,freelancerDetails.isUsd,{value:AmountToPayForUsd})
        //     await TxUsd.wait()
        // alert("enroll successful for usd")
        }
        else{
          console.log("freelancerDetails",freelancerDetails);
          const amount =  freelancerDetails.amount
          console.log("amount",amount); 
     
          const Tx =  await contract.enrollFreelancer(freelancerDetails.name,freelancerDetails.skills,
           
              freelancerDetails.bio,amount,freelancerDetails.isUsd,{value:ethers.parseEther(amount)})
              await Tx.wait()
          alert("enroll successful")
        }
     
       
      }
      
    } catch (error) {
      console.log(error);
      
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
     <Route path='/enroll' element={<Enroll enrollFreelancerDetails={enrollFreelancerDetails} 
     setfreelancerDetails={setfreelancerDetails} 
     freelancerDetails={freelancerDetails} />}></Route>
  
   

    
    </Routes>
   
    </Router>
  );
}

export default App;
