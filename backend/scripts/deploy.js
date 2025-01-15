const fs = require("fs");
const path = require("path");
const {ethers} = require("hardhat")
async function main() {
    console.log("Starting deployment...");
    let minDelay, proposers, executors,admin
    proposers =[]
    executors =[]
    minDelay = 7200


    const adminSigner = await ethers.getSigners();
    admin = adminSigner[0].address
    
    // Deploy SustainabilityCoin
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    const initialSupply = ethers.parseUnits("1000000", 18); // 1,000,000 SUS tokens with 18 decimals
    const pricefeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"

   
  
    const governanceToken = await GovernanceToken.deploy(pricefeed,initialSupply);
    await governanceToken.waitForDeployment();
    
    const GovernanceTokenAddress = await governanceToken.getAddress();
   
    // OR Option 2: Using provider (if you want ETH balance)
    const ethBalance = await ethers.provider.getBalance(admin);
    console.log("TOKEN BALANCE OF DEPLOYER(ADMIN)", ethers.formatEther(ethBalance));

 
//TIMELOCK
 const TimeLock = await ethers.getContractFactory("TimeLock")
 const timeLock = await TimeLock.deploy(minDelay,proposers,executors,admin)
 await timeLock.waitForDeployment();
 const timeLockAddress = await timeLock.getAddress();



    const MyGovernor = await ethers.getContractFactory("MyGovernor")
    const myGovernor = await MyGovernor.deploy(GovernanceTokenAddress,timeLock)
    await myGovernor.waitForDeployment();
    const myGovernorAddress = await myGovernor.getAddress();



    // Deploy EcoLedger as an upgradeable contract
    const FreeLanceDAO = await ethers.getContractFactory("FreeLanceDAO");
    const freeLanceDAO = await FreeLanceDAO.deploy(pricefeed,timeLock);
    await freeLanceDAO.waitForDeployment();
    const freeLanceDAOAddress = await freeLanceDAO.getAddress();

    // Output the addresses for further usage
    console.log("Deployment completed successfully!");
    console.log(`GovernanceTokenAddress Address: ${GovernanceTokenAddress}`);
    console.log(`freeLanceDAOAddress Address${freeLanceDAOAddress}`);
    console.log(`timeLockAddress Adress${timeLockAddress}`);
    console.log(`myGoverner${myGovernorAddress}`);
    
    
    

    // Prepare the deployment data
    const deploymentData = {
        GovernanceTokenAddress: GovernanceTokenAddress,
        freeLanceDAOAddress:freeLanceDAOAddress,
        timeLockAddress:timeLockAddress,
        myGovernorAddress:myGovernorAddress
    };

    // // Define the path to the frontend src/abi folder
    // const dirPath = path.join(__dirname, "..", "..", "frontend", "src", "abi");
    
    // // Create the directory if it doesn't exist
    // if (!fs.existsSync(dirPath)) {
    //     fs.mkdirSync(dirPath, { recursive: true });
    // }

    // // Write the deployment data to a JSON file
    // fs.writeFileSync(path.join(dirPath, "deployment-config.json"), JSON.stringify(deploymentData, null, 2));
    // console.log("Deployment configuration saved to frontend/src/abi/deployment-config.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in deployment:", error);
        process.exit(1);
    });