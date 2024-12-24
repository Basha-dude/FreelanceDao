const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreeLanceDAO", function () {
  let freeLanceDAO, freelancer1, myGovernor, governanceToken, owner, PROPOSERS1, PROPOSERS2, PROPOSERS3, EXECUTORS1, EXECUTORS2, EXECUTORS3, timeLock;
  
  const ETHUSDPriceFeed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const PROPOSERS = [];
  const EXECUTORS = [];
  const VotingDelay = 7200; // 1 day
  const VotingPeriod = 50400; // 1 week
  
  before(async function () {
    [owner, PROPOSERS1, PROPOSERS2, PROPOSERS3, EXECUTORS1, EXECUTORS2, EXECUTORS3,freelancer1] = await ethers.getSigners();
    
    // Deploy Governance Token
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy(ETHUSDPriceFeed, 100);
    
    // Mint tokens for proposers
    await governanceToken.connect(PROPOSERS1).mint(4, false, { value: ethers.parseEther("4") });
    await governanceToken.connect(PROPOSERS2).mint(4, false, { value: ethers.parseEther("4") });
    await governanceToken.connect(PROPOSERS3).mint(4, false, { value: ethers.parseEther("4") });
    
    PROPOSERS.push(PROPOSERS1.address);
    PROPOSERS.push(PROPOSERS2.address);
    PROPOSERS.push(PROPOSERS3.address);
    
    // Mint tokens for executors
    await governanceToken.connect(EXECUTORS1).mint(10, false, { value: ethers.parseEther("10") });
    await governanceToken.connect(EXECUTORS2).mint(10, false, { value: ethers.parseEther("10") });
    await governanceToken.connect(EXECUTORS3).mint(10, false, { value: ethers.parseEther("10") });
    
    EXECUTORS.push(EXECUTORS1.address);
    EXECUTORS.push(EXECUTORS2.address);
    EXECUTORS.push(EXECUTORS3.address);
    
    // Check balance
    const balance = await governanceToken.balanceOf(PROPOSERS1.address);
    const PROPOSERS2balance = await governanceToken.balanceOf(PROPOSERS2.address);
    const PROPOSERS3balance = await governanceToken.balanceOf(PROPOSERS3.address);

    console.log("Balance of PROPOSERS1:", balance.toString());
    console.log("Balance of PROPOSERS2balance:", PROPOSERS2balance.toString());
    console.log("Balance of PROPOSERS3balance:", PROPOSERS3balance.toString());

    const EXECUTORS1Balance = await governanceToken.balanceOf(EXECUTORS1.address);
    const EXECUTORS2Balance = await governanceToken.balanceOf(EXECUTORS2.address);
    const EXECUTORS3balance = await governanceToken.balanceOf(EXECUTORS3.address);

    console.log("Balance of EXECUTORS1Balance:", EXECUTORS1Balance.toString());
    console.log("Balance of EXECUTORS2Balance:", EXECUTORS2Balance.toString());
    console.log("Balance of EXECUTORS3balance:", EXECUTORS3balance.toString());
    
    // Deploy TimeLock with corrected admin address
    const TimeLock = await ethers.getContractFactory("TimeLock");
    timeLock = await TimeLock.deploy(
      VotingDelay,
      PROPOSERS,
      EXECUTORS,
      ethers.ZeroAddress  // Using ZeroAddress instead of "address(0)"
    );
    
    // Deploy Governor
    const MyGovernor = await ethers.getContractFactory("MyGovernor");
    myGovernor = await MyGovernor.deploy(governanceToken.target, timeLock.target);
    
    // Deploy FreeLanceDAO
    const FreeLanceDAO = await ethers.getContractFactory("FreeLanceDAO");
    freeLanceDAO = await FreeLanceDAO.deploy(ETHUSDPriceFeed, myGovernor.target);
  });

  describe("Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await governanceToken.target).to.be.properAddress;
      expect(await timeLock.target).to.be.properAddress;
      expect(await myGovernor.target).to.be.properAddress;
      expect(await freeLanceDAO.target).to.be.properAddress;
    });

    it("Should set correct initial balances", async function () {
      const proposer1Balance = await governanceToken.balanceOf(PROPOSERS1.address);
      expect(proposer1Balance).to.equal(4);
      
      const executor1Balance = await governanceToken.balanceOf(EXECUTORS1.address);
      expect(executor1Balance).to.equal(10);
    });
    it("Should set correct initial voting delay", async function () {
      const VotingDelayH = await myGovernor.votingDelay();
      console.log("VotingDelayH",VotingDelayH);
      
      expect(VotingDelayH).to.equal(VotingDelay);
    });
    it("Should set correct initial voting delay", async function () {
      const votingPeriodH = await myGovernor.votingPeriod();
      console.log("votingPeriodH",votingPeriodH);
      expect(votingPeriodH).to.equal(VotingPeriod);
    });
    it("Should set correct  pricefeed ", async function () {
      const priceFeedH = await freeLanceDAO.getPriceFeedAddress();
      console.log("votingPeriodH",priceFeedH);
      expect(priceFeedH).to.equal(ETHUSDPriceFeed);
    });
    it("Enrolling free lancer ", async function () {
         await freeLanceDAO.connect(freelancer1).enrollFreelancer();         
         const freelancerCount = await freeLanceDAO.getFreelancerCount();  
         expect(freelancerCount).to.equal(1);
    });
  });
});