const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreeLanceDAO", function () {
  let freeLanceDAO,timeLock, myGovernor, governanceToken, owner, signer1, signer2, signer3;
  const ETHUSDPriceFeed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Example address
  const VotingDelay = 7200;
  let PROPOSERS =[];
  let EXECUTORS =[];
  

  before(async function () {
    [owner, signer1, signer2, signer3] = await ethers.getSigners();


    const TimeLock = await ethers.getContractFactory("TimeLock");
    timeLock = await TimeLock.deploy(
      VotingDelay,
      PROPOSERS,
      EXECUTORS,
      owner
    );
    // Deploy GovernanceToken contract
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy(ethers.parseEther("1000000")); // 1M tokens
    await governanceToken.deployed();
    console.log("GovernanceToken deployed at:", governanceToken.target);

    // Deploy MyGovernor contract
    const MyGovernor = await ethers.getContractFactory("MyGovernor");
    myGovernor = await MyGovernor.deploy(governanceToken.address, timeLock.target);
    await myGovernor.deployed();
    console.log("MyGovernor deployed at:", myGovernor.target);

    // Deploy FreeLanceDAO contract
    const FreeLanceDAO = await ethers.getContractFactory("FreeLanceDAO");
    freeLanceDAO = await FreeLanceDAO.deploy(ETHUSDPriceFeed, timeLock.target);
    await freeLanceDAO.deployed();
    console.log("FreeLanceDAO deployed at:", freeLanceDAO.target);
  });



  describe("Governance Functionality", function () {
    it("Should allow token holders to delegate votes", async function () {
      await governanceToken.connect(owner).delegate(signer1.address);
      const votes = await governanceToken.getVotes(signer1.address);
      expect(votes).to.equal(ethers.parseEther("1000000")); // All votes delegated to signer1
    });

    it("Should allow proposing and voting on proposals", async function () {
      const targets = [signer2.address];
      const values = [0];
      const calldatas = [ethers.utils.hexlify([])];
      const description = "Proposal #1";

      // Propose
      const tx = await myGovernor.connect(signer1).propose(targets, values, calldatas, description);
      const receipt = await tx.wait();
      const proposalId = receipt.events.find((e) => e.event === "ProposalCreated").args.proposalId;

      // Vote
      await myGovernor.connect(signer1).castVote(proposalId, 1); // 1 = For

      const proposalState = await myGovernor.state(proposalId);
      expect(proposalState).to.equal(1); // Active
    });
  });
});
