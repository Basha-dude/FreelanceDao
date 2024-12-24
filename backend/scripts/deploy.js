const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreeLanceDAO", function () {
  let freeLanceDAO, myGovernor, governanceToken, owner, signer1, signer2, signer3;
  const ETHUSDPriceFeed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Example address

  before(async function () {
    [owner, signer1, signer2, signer3] = await ethers.getSigners();

    // Deploy GovernanceToken contract
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy(ethers.utils.parseEther("1000000")); // 1M tokens
    await governanceToken.deployed();
    console.log("GovernanceToken deployed at:", governanceToken.address);

    // Deploy MyGovernor contract
    const MyGovernor = await ethers.getContractFactory("MyGovernor");
    myGovernor = await MyGovernor.deploy(governanceToken.address, owner.address);
    await myGovernor.deployed();
    console.log("MyGovernor deployed at:", myGovernor.address);

    // Deploy FreeLanceDAO contract
    const FreeLanceDAO = await ethers.getContractFactory("FreeLanceDAO");
    freeLanceDAO = await FreeLanceDAO.deploy(ETHUSDPriceFeed, myGovernor.address);
    await freeLanceDAO.deployed();
    console.log("FreeLanceDAO deployed at:", freeLanceDAO.address);
  });

  describe("Deployment", function () {
    it("Should deploy GovernanceToken with the correct total supply", async function () {
      const totalSupply = await governanceToken.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("1000000")); // 1M tokens
    });

    it("Should set the correct owner for GovernanceToken", async function () {
      const tokenOwner = await governanceToken.owner();
      expect(tokenOwner).to.equal(owner.address);
    });

    it("Should deploy MyGovernor with correct initial parameters", async function () {
      const tokenAddress = await myGovernor.token();
      const timelockAddress = await myGovernor.timelock();
      expect(tokenAddress).to.equal(governanceToken.address);
      expect(timelockAddress).to.equal(owner.address);
    });

    it("Should deploy FreeLanceDAO with correct parameters", async function () {
      const priceFeed = await freeLanceDAO.priceFeed();
      const governorAddress = await freeLanceDAO.governor();
      expect(priceFeed).to.equal(ETHUSDPriceFeed);
      expect(governorAddress).to.equal(myGovernor.address);
    });
  });

  describe("Governance Functionality", function () {
    it("Should allow token holders to delegate votes", async function () {
      await governanceToken.connect(owner).delegate(signer1.address);
      const votes = await governanceToken.getVotes(signer1.address);
      expect(votes).to.equal(ethers.utils.parseEther("1000000")); // All votes delegated to signer1
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
