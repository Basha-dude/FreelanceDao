import './App.css';
import Navbar from './components/Navbar';  
import { ethers } from "ethers";
import { useState,useEffect } from "react";
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
     /*PROVIDER: The provider is responsible for reading data from the blockchain, 
        such as fetching account balances, contract state, or block information.
      ROLE:Role:
            The provider is your read-only connection to the Ethereum network. However,
             it cannot sign transactions or execute contract functions that require payment or permission 
             (e.g., enrollFreelancer).Think of the provider as a "window" to view blockchain data.
      IMP:The provider sends the signed transaction to the Ethereum network, 
            and the blockchain executes the enrollFreelancer function.
      */
     const provider = new ethers.BrowserProvider(window.ethereum)
      /*SIGNER:
         A Signer is an abstraction that allows signing transactions on behalf of a specific Ethereum account.
         provider.getSigner() fetches the active account (the account currently selected in MetaMask)
          and creates a signer tied to that account. 
      */
     const signer = await provider.getSigner()
     /*  * 1)ethers.Contract creates a JavaScript object that represents your smart contract.

         * 2)signer is used here to connect this contract instance to the user's wallet.
           This allows the contract instance to call functions that require user authorization.
       */
     const contractInstance =  new ethers.Contract(FreelanceAddress,FreelanceAddressAbi,signer)
     setContract(contractInstance)
     setwallet(accounts[0])
     console.log(accounts[0]);
    
    
         }    
    } catch (error) {
       console.log(error);
       
    }   
  }

  /* 
  * SOLVED ERROR: Already enrolled
  * REASON:When you change accounts in MetaMask,
      the wallet itself (MetaMask) updates its internal state to reflect the new account. 
     However, the ethers.Contract instance you created earlier does not automatically update its signer.
     1)Contract Instances Are Immutable
      The ethers.Contract instance is a lightweight object that connects the contract's ABI, address, and signer. 
      Once you create a contract instance, it doesn't dynamically update its signer or provider.
     2)MetaMask Doesn't Automatically Notify the Contract Instance
     3)State Updates ≠ Contract Updates
  * ikkada enduku malli contract instance use chesaam antey paina vachina error,
     so new signer tho new contract instance, previous em raledhu anukuntaa,
     but ikkada metamask update cheyyatledha mari code aa telidhu so new instance with new signer
  */
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // Handle account disconnection
      setwallet("");
      setContract(null);
    } else {
      try {
        const newAccount = accounts[0];
        setwallet(newAccount);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(FreelanceAddress, FreelanceAddressAbi, signer);
        setContract(newContract);
      } catch (error) {
        console.error("Error updating contract with new account:", error);
      }
    }
  };

  const enrollFreelancerDetails = async() => {
    try {

      console.log("contract",contract); 
      setfreelancerDetails(freelancerDetails)
      if (freelancerDetails) {

        //giving error for the usd code
        /** 
        ikkada error because sepolia pricefeed ni use chesam kabatti so
        manam mock use chesaam so ippudu no error giving correct 👍

        *BUT IKKADA OKA FREELANCER ENROLL AYYINATHARVATHA REFRESH CHEYYALSI VASTHUNDI EDHI CHUDAALI
        */
        if (freelancerDetails.isUsd) {
          console.log("logged into usd");
          
          const AmountToPayForUsd = await contract.calculatingUsdForEnroll(freelancerDetails.amount)
          console.log("USD Amount to Pay:", AmountToPayForUsd.toString());

          const TxUsd =  await contract.enrollFreelancer(freelancerDetails.name,freelancerDetails.skills,
           
            freelancerDetails.bio,freelancerDetails.amount,freelancerDetails.isUsd,{value:AmountToPayForUsd})
            await TxUsd.wait()
        alert("enroll successful for usd")
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
  

  /* 
  FLOW DIAGRAM:
              Component Mounts
                   ↓
  Is `window.ethereum` available?
           /           \
      Yes                  No
       ↓                    ↓
 Attach `accountsChanged`   Do nothing
     listener        

       ↓
   User changes 
   MetaMask account
       ↓
 Trigger `accountsChanged`
     event
       ↓
Handle Event (`handleAccountsChanged`)
     ↓
 ┌───────────────────────────┐
 │ Is the accounts array empty? │
 └───────────────────────────┘
        ↓                      ↓
      Yes                     No
       ↓                      ↓
 Handle account            Get the new
   disconnection          account details
   (reset app state)       and signer
                             ↓
                      Update the contract
                       instance and app
                             state
                              ↓
             Component Unmounts (cleanup)
                       ↓
Remove `accountsChanged` event listener

  */

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged",handleAccountsChanged)
    }

    /* ikkada enduku eee remove listener use chesaamu antey,
     eee component dom nundi remove aythay eee listener kuda remove avthadhi kabatti */
    return () => {
      window.ethereum.removeListener("accountsChanged",handleAccountsChanged)
    }

  }, [])
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
