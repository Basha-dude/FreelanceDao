const fs = require("fs");
const path = require("path");
const {ethers} = require("hardhat");
const { execFileSync } = require("child_process");


async function deployContract(factoryName,...args) {
    const ContractName = await ethers.getContractFactory(factoryName)
    const contractName = await ContractName.deploy(...args)
    await contractName.waitForDeployment()
    const address = await contractName.getAddress()
    console.log("Starting Deployment...");
    console.log(`${factoryName} deployed at: ${address}`);
    return address;

}

async function main() {
    // const pricefeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    let minDelay, proposers, executors,admin
    proposers =[]
    executors =[]
    minDelay = 7200
  
    const adminSigner = await ethers.getSigners();
    admin = adminSigner[0].address
    
    const initialSupply = ethers.parseUnits("10000",18)
    const PricefeedAddress = await deployContract("MockV3Aggregator",8,2000 * 10**8) // $2000/ETH price
    const GovernanceTokenAddress = await deployContract("GovernanceToken",PricefeedAddress,initialSupply)
    const timeLockAddress = await deployContract("TimeLock",minDelay,proposers,executors,admin)
    const myGovernorAddress = await deployContract("MyGovernor",GovernanceTokenAddress,timeLockAddress)
    const freeLanceDAOAddress = await deployContract("FreeLanceDAO",PricefeedAddress,timeLockAddress)


    const deploymentData = {
        GovernanceTokenAddress:GovernanceTokenAddress,
        timeLockAddress:timeLockAddress,
        myGovernorAddress:myGovernorAddress,
        freeLanceDAOAddress:freeLanceDAOAddress,
        PricefeedAddress:PricefeedAddress
    }
    
    console.log("DeploymentData:-", JSON.stringify(deploymentData,null,2))

    
    const dirPath = path.join(__dirname,"..","..","frontend","src","abi")
      if (!fs.existsSync(dirPath)) {
           fs.mkdirSync(dirPath,{recursive:true})
        
      }

      fs.writeFileSync(path.join(dirPath,"config.json"),JSON.stringify(deploymentData,null,2))
          console.log("Deployment configuration saved to frontend/src/abi/config.json");

      // Define the path to the frontend src/abi folder
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














    