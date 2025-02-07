const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { BigNumber } = ethers;
/* 

HAS SAMO ISSUE  WHEN THE CREATOR CALLS THE WITHDRAW THE PROJECT FUNCTION,
 HE IS GETTING MONEY BACK
*/

describe("FreeLanceDAO", function () {
  let freeLanceDAO, freelancer1,
   client1,myGovernor, governanceToken,
    owner, PROPOSERS1, PROPOSERS2, PROPOSERS3,
     EXECUTORS1, EXECUTORS2, EXECUTORS3,
      timeLock,creator,ETHUSDPrice,mockV3Aggregator
      ,freelancer2,freelancer3, newCreator,voter,proposalId,PROPOSERS4,
      voter1,voter2,voter3

      const freelancer1Name = "freelancer1";
      const freelancer2Name = "freelancer2";
      const freelancer3Name = "freelancer2";

        let skills = "react.js,solidity";
        let bio = "'m a passionate Web3 freelancer.";
        let rating = 1;
    

       const DECIMALS = 8;
      const ETH_USD_PRICE = 300000000000;
      const ProjectName = "firstProject"; 
      const Project2Name = "secondProject";
      const Project3Name = "thirdProject";
      const Project4Name = "fourthProject";
      const creatorOrOwner = creator;
      const description = "it is first project";
      const description2 = "it is second project";
      const ProjectType = "blockchain"
      const deadline = Math.floor(Date.now() / 1000) + 7200;
      const amount = ethers.parseEther("9")
      const amount2 = 5
      const amount3 = 3000
      
      const isPaidToContract = false;
      const isPaidToFreelancer = false
      const isCanceled = false
      const completed = false
      const PRECISION = 1000000000000000000


  const ETHUSDPriceFeed = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const PROPOSERS = [];
  let EXECUTORS = [];
  const VotingDelay = 7200;//(in blocks)  1 day
  const VotingPeriod = 50400; //(in blocks)// 1 week
  const address1 ='0x0000000000000000000000000000000000000001'
  let amountInUsd = 6000 
  let amountInUsd2 = 9000
  let amountInUsd3 = 7500

  before(async function () {
    [deployer,owner,client1, PROPOSERS1,creator,newCreator, PROPOSERS2, PROPOSERS3,PROPOSERS4,
      voter1,voter2,voter3 , freelancer1,freelancer2,freelancer3,voter] = await ethers.getSigners();
    

    // let blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("MockV3Aggregator before mining:", blockNumBefore);

    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      mockV3Aggregator = await MockV3Aggregator.connect(deployer).deploy(DECIMALS,ETH_USD_PRICE);

    //   blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("MockV3Aggregator after mining:", blockNumBefore);

    // Deploy Governance Token
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.connect(deployer).deploy(mockV3Aggregator.target, 100);

    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("GovernanceToken after mining:", blockNumBefore);
    
    // Mint tokens for proposers
    await governanceToken.connect(PROPOSERS1).mint(4, false, { value: ethers.parseEther("4") });

    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("1 governanceToken after mining to proposer:", blockNumBefore);

    await governanceToken.connect(PROPOSERS2).mint(4, false, { value: ethers.parseEther("4") });

    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("2 governanceToken after mining to proposer:", blockNumBefore);

    await governanceToken.connect(PROPOSERS3).mint(4, false, { value: ethers.parseEther("4") });

    
    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("3 governanceToken after mining to proposer:", blockNumBefore);

    await governanceToken.connect(voter).mint(4,false,{ value: ethers.parseEther("4") })

    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("4 governanceToken after mining to proposer:", blockNumBefore);
    
    PROPOSERS.push(PROPOSERS1.address);
    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("1 PUSH TO PROPOSERS:", blockNumBefore);
    
    PROPOSERS.push(PROPOSERS2.address);
    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("2 PUSH TO PROPOSERS:", blockNumBefore);

    PROPOSERS.push(PROPOSERS3.address);
    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log("3 PUSH TO PROPOSERS:", blockNumBefore);
    
    // Deploy TimeLock with corrected admin address
    const TimeLock = await ethers.getContractFactory("TimeLock");
    timeLock = await TimeLock.connect(deployer).deploy(
      VotingDelay,
      PROPOSERS,
      EXECUTORS,
      deployer
    );

  
    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log(" TimeLock after mining to proposer:", blockNumBefore);
    
    // Deploy Governor
    const MyGovernor = await ethers.getContractFactory("MyGovernor");
    myGovernor = await MyGovernor.connect(deployer).deploy(governanceToken.target, timeLock.target);
    
    // blockNumBefore = await ethers.provider.getBlockNumber();
    // console.log(" MyGovernor after mining to proposer:", blockNumBefore);

    // Deploy FreeLanceDAO
    const FreeLanceDAO = await ethers.getContractFactory("FreeLanceDAO");
    freeLanceDAO = await FreeLanceDAO.connect(deployer).deploy(mockV3Aggregator, timeLock.target);
    
 
});

  describe("Deployment", function () {

    it("Should deploy all contracts successfully", async function () {
      expect(await governanceToken.target).to.be.properAddress;
      expect(await timeLock.target).to.be.properAddress;
      expect(await myGovernor.target).to.be.properAddress;
      expect(await freeLanceDAO.target).to.be.properAddress;
    });

    it("Should set correct initial voting delay", async function () {
      const VotingDelayH = await myGovernor.votingDelay();
      // console.log("VotingDelayH",VotingDelayH);
      
      expect(VotingDelayH).to.equal(VotingDelay);
    });
  
    it("Should set correct  pricefeed ", async function () {
      const priceFeedH = await freeLanceDAO.getPriceFeedAddress();
      // console.log("votingPeriodH",priceFeedH);
      expect(priceFeedH).to.equal(mockV3Aggregator.target);
    });
  
    it("should be reverted when non-governance tries to update governance", async function () {
      // Using owner (non-governance) should revert
      await expect(
        freeLanceDAO.connect(owner).updateGovernance(ethers.ZeroAddress)
      ).to.be.revertedWith("Caller is not the governance contract");
    });
  
    it("should be reverted when governance tries to update with zero address", async function () {
      // Verify the TimeLock contract address
      const timeLocksAddress = await timeLock.target;
      // console.log("TimeLock Address:", timeLocksAddress);

    
      // Verify the current governance address
      const currentGovernance = await freeLanceDAO.getGovernanceAddress();
      // console.log("Current Governance Address:", currentGovernance);
    
      // Ensure TimeLock is set as governance
      expect(currentGovernance).to.equal(timeLocksAddress);
    
      // Fund the TimeLock contract address with Ether to cover gas fees
      await owner.sendTransaction({
        to: timeLocksAddress,
        value: ethers.parseEther("1"), // Send 1 Ether to cover gas fees
      });
    
      // Impersonate the TimeLock contract
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [timeLocksAddress],
      });
    
      // Get a signer for the TimeLock contract
      const timeLockSigner = await ethers.getSigner(timeLocksAddress);
    
      // Attempt to update governance with a zero address
      await expect(
        freeLanceDAO.connect(timeLockSigner).updateGovernance(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid governance contract address");
    
      // Stop impersonating the account
      await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [timeLocksAddress],
      });
    });

    //getClients
    it("should enroll clients", async function () {
      const clients = await freeLanceDAO.getClients();
      // console.log("clients",clients);
      expect(clients.length).to.equal(0);    
    });

    it("should enroll clients", async function () {
       await freeLanceDAO.connect(client1).enrollClient();
       const clients =  await freeLanceDAO.getClients();
      // console.log("clients",clients);
      expect(clients.length).to.equal(1);    
    });
  });
  describe('CREATE PROJECT',  () => { 
    it("should give correct name", async function () {
      let getTotalProjects = await freeLanceDAO.getTotalProjects()
      // console.log("getTotalProjects",getTotalProjects);
      //1
      await freeLanceDAO.connect(creator).createProject(
          ProjectName, 
          ProjectType, 
          description, 
          deadline, 
          amount2, 
          false, 
          { value: (ethers.parseEther("5")) + (ethers.parseEther("0.1")) }
      );
      getTotalProjects = await freeLanceDAO.getTotalProjects()
      // console.log("getTotalProjects first create Project",getTotalProjects);
     
      //2
      await freeLanceDAO.connect(creator).createProject(
        Project2Name, 
        ProjectType, 
        description2, 
        deadline, 
        amount2, //(ethers.parseEther("9")
        false, //eth
        { value: (ethers.parseEther("5")) + (ethers.parseEther("0.1"))  }
    );
     getTotalProjects = await freeLanceDAO.getTotalProjects()
      // console.log("getTotalProjects second create Project",getTotalProjects);

      let PROJECT = await freeLanceDAO.idToProject(1);
      // console.log("Project Details:", PROJECT);

      expect(PROJECT.name).to.equal(ProjectName);
      expect(PROJECT.projectId).to.equal(1);
      expect(PROJECT.creatorOrOwner).to.equal(creator.address);
      expect(PROJECT.description).to.equal(description);
      expect(PROJECT.projectType).to.equal(ProjectType);
      expect(PROJECT.isPaidToContract).to.equal(true);
      expect(PROJECT.isPaidToFreelancer).to.equal(false);
      expect(PROJECT.isCanceled).to.equal(false);

       PROJECT = await freeLanceDAO.idToProject(2);
      //  console.log("Project Details:", PROJECT);
       expect(PROJECT.name).to.equal(Project2Name);
      expect(PROJECT.projectId).to.equal(2);
      expect(PROJECT.creatorOrOwner).to.equal(creator.address);
      expect(PROJECT.description).to.equal(description2);
      expect(PROJECT.projectType).to.equal(ProjectType);
      expect(PROJECT.isPaidToContract).to.equal(true);
      expect(PROJECT.isPaidToFreelancer).to.equal(false);
      expect(PROJECT.isCanceled).to.equal(false);
  });

  it("should revert  Platform Fee not the governance", async function () {
    await expect(freeLanceDAO.connect(owner).setPlatformFee(10)).to.be.revertedWith("Caller is not the governance contract")
    });

  it("should set Platform Fee", async function () {
    const timeLocksAddress = timeLock.target
    await hre.network.provider.request({
      method:"hardhat_impersonateAccount",
      params: [timeLocksAddress],
    })
    let PlatformFee = await freeLanceDAO.getPlatformFee()
    // console.log("before PlatformFee",PlatformFee);
    const timeLockSigner = await ethers.getSigner(timeLocksAddress);
    await freeLanceDAO.connect(timeLockSigner).setPlatformFee(2)

     PlatformFee = await freeLanceDAO.getPlatformFee()
    // console.log("after PlatformFee",PlatformFee);
    await hre.network.provider.request({
      method:"hardhat_impersonateAccount",
      params: [timeLocksAddress],
    });
 });

 it("should create a project with usd", async () =>{
  // console.log("into usd calculation");
 
//   const precision = ethers.parseUnits("1", 18); // This is equivalent to 1e18
// const amountAfterMultilyingPrecesion = ethers.parseUnits("7000", 18); // Convert 7500 to wei

const precision = ethers.getBigInt("1000000000000000000");
const amountAfterMultilyingPrecesion = ethers.getBigInt("7000") * precision; // Use * instead of .mul()

  const [roundId, answer] = await mockV3Aggregator.latestRoundData();
// console.log("Mock Price Feed Answer from test:", answer.toString()); //300_000_000_000
              // console.log("amountAfterMultilyingPrecesion from test",amountAfterMultilyingPrecesion);
              
     const price = await freeLanceDAO.price(amountAfterMultilyingPrecesion);
        // console.log("Price from test:", price.toString());
  //3
  await freeLanceDAO.connect(creator).createProject(
    Project3Name, 
    ProjectType, 
    description, 
    deadline, 
    amount2, 
    false, 
    { value: (ethers.parseEther("5")) + (ethers.parseEther("0.1"))}
);
let getTotalProjects = await freeLanceDAO.getTotalProjects()
  // console.log("getTotalProjects",getTotalProjects);
let PROJECT = await freeLanceDAO.idToProject(3);
// console.log("Project Details:", PROJECT);
     expect(PROJECT.name).to.be.equal(Project3Name)
 })
 it("Enrolling free lancer ", async function () {
        
await freeLanceDAO.connect(freelancer1).enrollFreelancer(freelancer1Name,skills,bio,1,false,{value:ethers.parseEther("1")});   
await freeLanceDAO.connect(freelancer2).enrollFreelancer(freelancer2Name,skills,bio,4500,true,{value:ethers.parseEther("1.5")});   
await freeLanceDAO.connect(freelancer3).enrollFreelancer(freelancer3Name,skills,bio,4500,false,{value:ethers.parseEther("1")});   
const profile = await freeLanceDAO.freelancerProfiles(freelancer1);
// console.log("Rating after enrollment:", profile.rating.toString());



const freelancers = await freeLanceDAO.getFreelancers();
expect(freelancers.length).to.be.greaterThan(0)
const freelancerCount = await freeLanceDAO.getFreelancerCount();  
expect(freelancerCount).to.equal(3);
});

 it("should apply For The Project ", async function () {
     
 await freeLanceDAO.connect(freelancer1).applyForTheProject(1);
  await freeLanceDAO.connect(freelancer2).applyForTheProject(1);



  const project = await freeLanceDAO.idToProject(1);
// console.log("Current Block Timestamp:", (await ethers.provider.getBlock("latest")).timestamp);
// console.log("Project Deadline:", project.deadline.toString());

 let appliedFreelancers =  await freeLanceDAO.getFreelancersForProject(1)
 expect(appliedFreelancers.length).to.be.greaterThan(0)
});


  
it("should selectingFreelancer",async function () {
  let appliedFreelancers =  await freeLanceDAO.getFreelancersForProject(1)
  expect(appliedFreelancers.length).to.be.greaterThan(0)
   let returnedAddress
    returnedAddress = await freeLanceDAO.connect(creator).selectingFreelancer(1); 
   const selectedFreelancer =  await freeLanceDAO.getSelectedFreelancer(1)
  const allfreelancerforAppliedProject =await freeLanceDAO.getFreelancersForProject(1);
 
  expect(selectedFreelancer).to.be.equal(freelancer1)

})
it("cancel the project", async () => {

  await freeLanceDAO.connect(freelancer3).applyForTheProject(3);
  await freeLanceDAO.connect(freelancer2).applyForTheProject(3);
  await freeLanceDAO.connect(creator).selectingFreelancer(3);

  let appliedFreelancers =  await freeLanceDAO.getFreelancersForProject(3)

 const selectedFreelancer =  await freeLanceDAO.getSelectedFreelancer(3)

const balanceBefore = await ethers.provider.getBalance(creator.address)
 const cancelledOrNot = await freeLanceDAO.connect(creator).cancelTheProject(3);
 let PROJECT = await freeLanceDAO.idToProject(3);
  expect(PROJECT.isCanceled).to.equal(true);

  const balanceAfter = await ethers.provider.getBalance(creator.address);

});
it("should revert apply For The Project", async function () {    
  await expect( freeLanceDAO.connect(freelancer1).applyForTheProject(10)).to.be.revertedWith("applied Invalid project ID")
 });

 it("raise disputes",async() => {
  await freeLanceDAO.connect(freelancer3).applyForTheProject(2);
  await freeLanceDAO.connect(freelancer2).applyForTheProject(2);
  
  await freeLanceDAO.connect(creator).selectingFreelancer(2);
  const selectedFreelancer =  await freeLanceDAO.getSelectedFreelancer(3)
  await freeLanceDAO.connect(creator).raiseDisputes(2)
  const treuOrFalse =await freeLanceDAO.hasDispute(2)
  expect(treuOrFalse).to.equal(true);

 })

 it("resolve the dispute",async ()=> {
      await freeLanceDAO.connect(freelancer3).resolveDispute(2)
      const treuOrFalse =await freeLanceDAO.hasDispute(2)
        expect(treuOrFalse).to.equal(false);

 })
 it("submitTheProject",async () => {
  await freeLanceDAO.connect(freelancer3).submitTheProject(2)
  const PROJECT = await freeLanceDAO.getProjectById(2)
    expect(PROJECT.completed).to.equal(true);
 })

 it("validateTheProject",async() => {
         const balanceBefore = await ethers.provider.getBalance(freelancer3.address)
        //  console.log("balanceBefore",balanceBefore);

  await freeLanceDAO.connect(creator).validateTheProject(2)
  const balanceafter = await ethers.provider.getBalance(freelancer3.address)
        //  console.log("balanceafter",balanceafter);
  const PROJECT = await freeLanceDAO.getProjectById(2)
    expect(PROJECT.isPaidToFreelancer).to.equal(true);
 })
 
 it("rateFreelancer",async() => {
    await freeLanceDAO.connect(creator).rateFreelancer(2,4)
    const selectedFreelancer = await freeLanceDAO.getSelectedFreelancer(2)
    const ratingOfFreelancer = await freeLanceDAO.getFreelancerRating(selectedFreelancer)
    // console.log("ratingOfFreelancer",ratingOfFreelancer);
    expect(ratingOfFreelancer).to.be.equal(4)
 })

 it("extendDeadline",async () => {
  let PROJECT = await freeLanceDAO.getProjectById(1)
    // console.log("project dealine",PROJECT.deadline)
    const deadline = Math.floor(Date.now() / 1000) + 7200 + 7200;
   await freeLanceDAO.connect(creator).extendDeadline(1,deadline)
     PROJECT = await freeLanceDAO.getProjectById(1)
  //  console.log("project dealine",PROJECT.deadline)
 })

 it("updatefreelancerProfile", async() => {
  const BeforeupdatedRating = await freeLanceDAO.getFreelancerRating(freelancer1.address)
  // console.log("BeforeupdatedRating",BeforeupdatedRating);
  
  const timeLocksAddress = timeLock.target
  await hre.network.provider.request({
    method:"hardhat_impersonateAccount",
    params:[timeLocksAddress],
  }) 

   const timeLockSigner = await ethers.getSigner(timeLocksAddress)
   await freeLanceDAO.connect(timeLockSigner).updatefreelancerProfile(freelancer1.address,"alice","updated bio","good at coding",5)

   await hre.network.provider.request({
    method:"hardhat_impersonateAccount",
    params:[timeLocksAddress],
   })

   const AfterupdatedRating = await freeLanceDAO.getFreelancerRating(freelancer1.address)
  //  console.log("AfterupdatedRating",AfterupdatedRating);
   
 })

 it("should withdrawTheProject",async () => {

  const balanceBefore = await ethers.provider.getBalance(creator.address)
   const createTx = await freeLanceDAO.connect(creator).createProject(
    Project4Name, 
    ProjectType, 
    description2, 
    deadline, 
    amount2, //
    false, //eth
    { value: (ethers.parseEther("5.1")) }
);


const afterCreatingProject = await ethers.provider.getBalance(creator.address)
await ethers.provider.send("evm_increaseTime",[7300])

const tx = await freeLanceDAO.connect(creator).withdrawTheProject(4);
const receipt = await tx.wait();
const balanceAfter = await ethers.provider.getBalance(creator.address)


// Calculate gas used
const gasUsed = receipt.gasUsed * receipt.gasPrice;

let PROJECT = await freeLanceDAO.getProjectById(4)
  expect(PROJECT.isCanceled).to.be.equal(true)
 })
   })

   describe('TESTING GOVERNANCE CONTRACT NOT TOKEN', () => { 
    it(" GOVERNANCE checking timeLock address",async ()=>{
      // console.log("timeLock.target",timeLock.target);
      // console.log("myGovernor.target",myGovernor.target);

    const timeLocksAddress =  await myGovernor.timelock()
    expect(timeLocksAddress).to.be.equal(timeLock.target)
    })

    it("GOVERNANCE executor should be timelock", async()=> {
      const executor  = await myGovernor.getExecutor()
      expect(executor).to.be.equal(timeLock.target)
    })
    
    it("GOVERNANCE checking name for governance ",async ()=>{
      const name =  await myGovernor.name()
      expect(name).to.be.equal("FreelanceGovernance")
     
      })

    it("GOVERNANCE checking votingDelay for governance ",async ()=>{
        const votingDelay =  await myGovernor.votingDelay()
        expect(votingDelay).to.be.equal(VotingDelay)
        // console.log("votingDelay",votingDelay);
        
        })
    it("GOVERNANCE checking votingPeriod for governance ",async ()=>{
          const votingPeriod =  await myGovernor.votingPeriod()
          expect(votingPeriod).to.be.equal(VotingPeriod)
          // console.log("VotingPeriod",VotingPeriod);
          })

    it("GOVERNANCE Should set correct initial voting delay", async function () {
            const votingPeriodH = await myGovernor.votingPeriod();
            // console.log("votingPeriodH",votingPeriodH);
            expect(votingPeriodH).to.equal(VotingPeriod);
          });

    it("GOVERNANCE should return timelock as daoGovernance",async () => {
        const TimeLock = await freeLanceDAO.daoGovernance()
        expect(TimeLock).to.be.equal(timeLock.target)
    })
  
    it(" GOVERNANCE:- proposing ", async () => {



      const targets = []
      const values = [0]
      const calldatas = [];
      
      const encodedFunctionCall = freeLanceDAO.interface.encodeFunctionData("setPlatformFee", [5])
      calldatas.push(encodedFunctionCall)
      const descriptionOfProposal = "Proposal #1";
      targets.push(freeLanceDAO.target)

      // await governanceToken.connect(PROPOSERS1).delegate(PROPOSERS1.address);
      // await ethers.provider.send("evm_mine"); // Mine a block to update state
      
    //////////////
   //PROPOSAL   ///
   /////////////
      const proposeTx = await myGovernor.connect(PROPOSERS1).propose(targets, values, calldatas, descriptionOfProposal);
      
      const proposeReceipt = await proposeTx.wait(1);
      
      const proposalCreatedEvent = proposeReceipt.logs[0];
     proposalId = proposalCreatedEvent.args[0]; // The first argument is the proposalId
    console.log("Proposal ID first :", proposalId);

    let proposalState = await myGovernor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)
    // Mine enough blocks to move past voting delay

    
    // console.log("before mining VOTING DELAY the  checking the  BlockNumber",await ethers.provider.getBlockNumber());
    
    await governanceToken.connect(PROPOSERS1).delegate(PROPOSERS1.address);
    await governanceToken.connect(PROPOSERS2).delegate(PROPOSERS2.address)
    await governanceToken.connect(PROPOSERS3).delegate(PROPOSERS3.address)


    await ethers.provider.send("evm_mine");
    await ethers.provider.send("evm_mine");
    // await network.provider.send("hardhat_mine", ["0x1c20"]); // Mine ~7200 blocks
    await network.provider.send("hardhat_mine", [`0x${(7200 + 1).toString(16)}`]);

// console.log("after mining  the VOTING DELAY the  checking the  BlockNumber",await ethers.provider.getBlockNumber());

let newProposalState = await myGovernor.state(proposalId);
console.log(`New Proposal State: ${newProposalState}`); // Should be 1 (Active)

//getting the snapshot of the proposal means which block

/* 
 need to ask AI that why it gives 7242 as snapshot  

*/

// console.log("after getting   the state  the  checking the  BlockNumber",await ethers.provider.getBlockNumber());

let proposalSnapshot = await myGovernor.proposalSnapshot(proposalId)
// console.log("proposalSnapshot:",proposalSnapshot);

// console.log("after getting   the snapshot  the  checking the  BlockNumber",await ethers.provider.getBlockNumber());

let votingPower = await myGovernor.getVotes( PROPOSERS1,await ethers.provider.getBlockNumber() - 1)
console.log("votingPower",votingPower);
// console.log("after checking the  BlockNumber",await ethers.provider.getBlockNumber());
expect(VotingDelay).to.be.lessThan(await ethers.provider.getBlockNumber())
 await governanceToken.connect(PROPOSERS1).delegates(PROPOSERS1.address) 
//  console.log("last before checking the  BlockNumber",await ethers.provider.getBlockNumber());


 // Before casting the vote, ensure the delegation is effective


// const voteReceipt = await voteTx.wait();
const votesOfproposal = await myGovernor.proposalVotes(proposalId);
console.log("Immediate Vote Count after voting:", votesOfproposal);

const votes = await governanceToken.getVotes(PROPOSERS1.address);
console.log("After delegating the votes, votingPower:", votes.toString());

const votesOf = await governanceToken.getVotes(PROPOSERS4.address);
console.log("After delegating the votes, PROPOSER4:", votesOf.toString());

let delegatee = await governanceToken.delegates(PROPOSERS1.address);
// console.log("Delegated to:", delegatee);

//
let  votesfor = await myGovernor.proposalVotes(proposalId)
console.log("votesfor",votesfor);
let votingofProposer = await governanceToken.getVotes(PROPOSERS1.address);
console.log("votingofProposer1",votingofProposer);

//////////////
//VOTING   ///
/////////////
const voteTx = await myGovernor.connect(PROPOSERS1).castVoteWithReason(proposalId, 1, "voted for the ");
const voteReceipt = await voteTx.wait();

const voteSecondTx = await myGovernor.connect(PROPOSERS2).castVoteWithReason(proposalId, 1, "Proposer2 voted for the ");
const voteSecondTxReceipt = await voteSecondTx.wait();

const voteThirdTx = await myGovernor.connect(PROPOSERS4).castVoteWithReason(proposalId, 1, "Proposer4 voted for the ");
const voteThirdTxReceipt = await voteThirdTx.wait();

const votesOfPROPOSER1 = await governanceToken.getVotes(PROPOSERS1.address);
console.log("After delegating the votes, votesOfPROPOSER1:",  votesOfPROPOSER1.toString());

const votesOfPROPOSER2 = await governanceToken.getVotes(PROPOSERS2.address);
console.log("After delegating the votes, votesOfPROPOSER2:",  votesOfPROPOSER2.toString());

const votesOfPROPOSER3 = await governanceToken.getVotes(PROPOSERS3.address);
console.log("After delegating the votes, votesOfPROPOSER3:",  votesOfPROPOSER3.toString());

  votesfor = await myGovernor.proposalVotes(proposalId)
// console.log("votesfor",votesfor);

 delegatee = await governanceToken.delegates(PROPOSERS2.address);
// console.log("Delegated to2:", delegatee);
 delegatee = await governanceToken.delegates(PROPOSERS3.address);
// console.log("Delegated to3:", delegatee);
 delegatee = await governanceToken.delegates(PROPOSERS1.address);
// console.log("Delegated to1:", delegatee);

proposalState = await myGovernor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    await network.provider.send("hardhat_mine", [`0x${(50400 + 1).toString(16)}`]);
    proposalState = await myGovernor.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)


//////////////
//QUEUE   ///
/////////////
const bytes = ethers.toUtf8Bytes(descriptionOfProposal);
console.log(bytes);

const descriptionHash = ethers.keccak256(bytes)
console.log("descriptionHash First",descriptionHash);

// console.log(freeLanceDAO.target);
// console.log(timeLock.target);
// console.log(myGovernor.target);
// console.log(governanceToken.target);
// console.log(PROPOSERS1.address);
// console.log(deployer.address);


//PROPOSER_ROLE should be myGoverner contract
const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE();
await timeLock.connect(deployer).grantRole(PROPOSER_ROLE, myGovernor.target);

const QueueTx = await myGovernor.queue(targets,values,calldatas,descriptionHash)
 const QueueTxReceipt = await QueueTx.wait()

 //should give false
 const hasRole = await timeLock.hasRole(PROPOSER_ROLE, deployer.address);

 proposalState = await myGovernor.state(proposalId)
await network.provider.send("hardhat_mine", [`0x${(7200 + 1).toString(16)}`]);

// Advance time
await network.provider.send("evm_mine"); 

//////////////
//EXECUTE  ///
/////////////
 const  EXECUTOR_ROLE =  await timeLock.EXECUTOR_ROLE();
  await timeLock.connect(deployer).grantRole(EXECUTOR_ROLE,ethers.ZeroAddress) 

 const ExecuteTx = await myGovernor.execute(targets,values,calldatas,descriptionHash)
  const ExecuteTxReciept = await ExecuteTx.wait()

  // Get the timelock delay (assuming it is accessible from the timelock contract)
// Mine a block to apply the time change


  proposalState = await myGovernor.state(proposalId)
 
const fee = await freeLanceDAO.getPlatformFee()


  });

    it.skip("it should cancel the proposal",async () => {
    const targets = []
    targets.push(freeLanceDAO.target)
    const values =[0]
    const calldatas = []
    const encodedFunctionCall = freeLanceDAO.interface.encodeFunctionData("withdraw")
    calldatas.push(encodedFunctionCall)
    const description2 = "#proposal 2"

     ///////////////////
    // PROPOSAL      //
    ///////////////////
   const ProposeTx = await myGovernor.connect(PROPOSERS1).propose(targets,values,calldatas,description2)
   const ProposeReciept = await ProposeTx.wait(1) 

   const proposalCreatedEvent = ProposeReciept.logs[0];
  let proposalId = proposalCreatedEvent.args[0];
  console.log("Proposal ID:", proposalId);
   
  //  console.log("proposalId",proposalId);

   let state = await myGovernor.state(proposalId)
      console.log("state",state);

      await network.provider.send("hardhat_mine", [`0x${(7200 + 1).toString(16)}`]);

      state = await myGovernor.state(proposalId)
      console.log("state",state);

   ///////////////////
    // VOTING      //
    ///////////////////  

  const voteFirstTx =  await myGovernor.connect(PROPOSERS1).castVote(proposalId,1)
  const voteReceipt = await voteFirstTx.wait()

  const voteSecondTx =  await myGovernor.connect(PROPOSERS2).castVote(proposalId,1)
  const voteSecondReceipt = await voteSecondTx.wait()

  const voteThirdTx =  await myGovernor.connect(PROPOSERS3).castVote(proposalId,1)
  const voteThirdReceipt= await voteThirdTx.wait()

  let  votesfor = await myGovernor.proposalVotes(proposalId)
console.log("votesfor",votesfor);
         
await network.provider.send("hardhat_mine",[`0x${(50400 + 1).toString(16)}`])

 state = await myGovernor.state(proposalId)
      console.log("state",state);

    ///////////////////
    // QUEUE         //
    ///////////////////
    await ethers.provider.send("evm_mine");
   await ethers.provider.send("evm_mine");
    const bytes = ethers.toUtf8Bytes(description2)
     const descriptionHash = ethers.keccak256(bytes)

    const QueueTx = await myGovernor.queue(targets,values,calldatas,descriptionHash)
     await QueueTx.wait()

     state = await myGovernor.state(proposalId)
      console.log("state",state);

///////////////////
//   cancel      //
///////////////////


const PROPOSER_ROLE = await timeLock.PROPOSER_ROLE();
await timeLock.connect(deployer).grantRole(PROPOSER_ROLE,myGovernor.target);

const  EXECUTOR_ROLE =  await timeLock.EXECUTOR_ROLE();
  await timeLock.connect(deployer).grantRole(EXECUTOR_ROLE,myGovernor.target) 

  const hasProposerRole = await timeLock.hasRole(PROPOSER_ROLE, myGovernor.target);
console.log("Has Proposer Role:", hasProposerRole);

const hasExecutorRole = await timeLock.hasRole(EXECUTOR_ROLE, myGovernor.target);
console.log("Has Executor Role:", hasExecutorRole);

const CANCELLER_ROLE = await timeLock.CANCELLER_ROLE();
await timeLock.connect(deployer).grantRole(CANCELLER_ROLE, myGovernor.target);

const balanceBefore = await ethers.provider.getBalance(freeLanceDAO.target)
console.log("balanceBefore",balanceBefore.toString());

const CancelTx = await myGovernor.cancel(targets,values,calldatas,descriptionHash)
        await CancelTx.wait()

        state = await myGovernor.state(proposalId)
        console.log("state",state);   
    })

    it("should defeat the proposal ",async() =>{
  const targets =[]
  targets.push(freeLanceDAO.target)
  const values =[0]
  const calldatas = []
 const encodedFunctionCall =  freeLanceDAO.interface.encodeFunctionData("withdraw",[])
 calldatas.push(encodedFunctionCall)
   const description3 = "#proposal 3"

   ///////////////////
    // PROPOSAL      //
    ///////////////////

   const proposeTx = await myGovernor.propose(targets,values,calldatas,description3)
    const proposeReceipt =  await proposeTx.wait(1)
     const logs = proposeReceipt.logs[0]
     let proposalId = logs.args[0]
     console.log("proposalId3",proposalId);
     

     let state = await myGovernor.state(proposalId)
      console.log("state",state);



  ///////////////////
    // VOTING      //
    ///////////////////
  await network.provider.send("hardhat_mine",[`0x${(7200 +1).toString(16)}`])

  state = await myGovernor.state(proposalId)
  console.log("state",state);

    await myGovernor.connect(PROPOSERS1).castVote(proposalId,0)
    let votesOfproposal = await myGovernor.proposalVotes(proposalId);
    console.log("Immediate Vote Count after voting:", votesOfproposal); 
    await myGovernor.connect(PROPOSERS2).castVote(proposalId,0)
    await myGovernor.connect(PROPOSERS3).castVote(proposalId,0)
    votesOfproposal = await myGovernor.proposalVotes(proposalId);
    console.log("Immediate Vote Count after voting:", votesOfproposal); 

  
  ///////////////////
  // DEAFEATED    //
  ///////////////////

    await network.provider.send("hardhat_mine",[`0x${(50400 +1).toString(16)}`])

    state = await myGovernor.state(proposalId)
    console.log("state",state);

    expect(state).to.be.equal(3)

     })

    })

    describe('TESTING GOVERNANCE  TOKEN', async() => { 
     
      it("total supply ",async() => {
        const totalSupply = await governanceToken.totalSupply();
        console.log("totalSupply", totalSupply);
      })

      it.skip("Token  price ",async() => {
        const Token_Price = await governanceToken.getToken_Price();
        console.log("Token_Price", Token_Price.toString());
        //1 000 000 000 000 000 000n
        //1 000 000 000 000 000 000n
        console.log("ethers.parseEther(1)",(ethers.parseEther("1")).toString());
        
        expect(Token_Price.toString()).to.be.equal((ethers.parseEther("1")))
      })
      it("MINT THE GOVERNACE TOKEN IN ETHER",async() => {
         await governanceToken.connect(voter1).mint(3,false,{value: ethers.parseEther("3")})
         const balanceBefore = await governanceToken.balanceOf(voter1.address)
           console.log("balanceBefore",balanceBefore);
          //  expect(balanceBefore).to.be.equal(3)
      })

      /* 
        using usd will have precesion
      
      */
      it("MINT THE GOVERNACE TOKEN IN USD",async() => {
        let amountInUsd3 = 7500

        await governanceToken.connect(voter2).mint(10500,true,{value: ethers.parseEther("4")})
        const balanceBefore = await governanceToken.balanceOf(voter2.address)
          console.log("balanceBefore",balanceBefore);
     })


     it("AFTER TRANSFER  VOTING SHOULD TRANSFER",async() => {

      const balanceBefore = await governanceToken.balanceOf(voter2.address)
      console.log("balanceBefore",balanceBefore);
      const balanceBeforeOfPROPOSERS1 = await governanceToken.balanceOf(PROPOSERS1.address)
        console.log("balanceBeforeOfPROPOSERS1",balanceBeforeOfPROPOSERS1);

        await governanceToken.connect(PROPOSERS1).transfer(voter2.address,4)
       await governanceToken.connect(voter2).delegate(voter2.address);

       await network.provider.send("evm_mine"); 
         await network.provider.send("evm_increaseTime", [60]); // Increase time by 60 seconds
       await network.provider.send("evm_mine");

      let balanceAfter = await governanceToken.balanceOf(voter2.address)
        console.log("balanceAfter",balanceAfter);
    
        const balanceAfterOfPROPOSERS1 = await governanceToken.balanceOf(PROPOSERS1.address)
        console.log("balanceAfterOfPROPOSERS1",balanceAfterOfPROPOSERS1);

        let votingPower = await myGovernor.getVotes( PROPOSERS1,await ethers.provider.getBlockNumber() -1)
         console.log("votingPower of proposer1",votingPower);
         votingPower = await myGovernor.getVotes( voter2,await ethers.provider.getBlockNumber() -1)
         console.log("votingPower of voter2",votingPower);


         await governanceToken.connect(deployer).burn(voter2.address,6)
         await network.provider.send("evm_mine"); 
         await network.provider.send("evm_increaseTime", [60]); // Increase time by 60 seconds
       await network.provider.send("evm_mine");
      
         votingPower = await myGovernor.getVotes( voter2,await ethers.provider.getBlockNumber() -1)
         console.log("votingPower of voter2",votingPower);
      
         balanceAfter = await governanceToken.balanceOf(voter2.address)
         console.log("balanceAfter of vtoter2",balanceAfter);
   })

  



    });

});

