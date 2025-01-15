const fs = require("fs");
const path = require("path");
const {ethers} = require("hardhat")


async function deployContract(factoryName,...args) {
    const ContractName = await ethers.getContractFactory(factoryName)
    const contractName = await ContractName.deploy(...args)
    await contractName.waitForDeployment()
    const address = await contractName.getAddress()
    console.log(`${factoryName} deployed at: ${address}`);
    return address;

}

async function main() {
    const pricefeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    let minDelay, proposers, executors,admin
    proposers =[]
    executors =[]
    minDelay = 7200
  
    const adminSigner = await ethers.getSigners();
    admin = adminSigner[0].address
    
    const initialSupply = ethers.parseUnits("10000",18)
    const GovernanceTokenAddress = await deployContract("GovernanceToken",pricefeed,initialSupply)
    const timeLockAddress = await deployContract("TimeLock",minDelay,proposers,executors,admin)
    const myGovernorAddress = await deployContract("MyGovernor",GovernanceTokenAddress,timeLockAddress)
    const freeLanceDAOAddress = await deployContract("FreeLanceDAO",pricefeed,timeLockAddress)


    const deploymentData = {
        GovernanceTokenAddress,
        timeLockAddress,
        myGovernorAddress,
        freeLanceDAOAddress
    }
    console.log("DeploymentData:-", JSON.stringify(deploymentData,null,2))

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error in deployment:", error);
        process.exit(1);
    });














    