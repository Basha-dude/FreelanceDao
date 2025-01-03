const { expect } = require("chai");
const { ethers } = require("hardhat");
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
      ,freelancer2,freelancer3;

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
  const EXECUTORS = [];
  const VotingDelay = 7200; // 1 day
  const VotingPeriod = 50400; // 1 week
  const address1 ='0x0000000000000000000000000000000000000001'
  let amountInUsd = 6000 
  let amountInUsd2 = 9000
  let amountInUsd3 = 7500

  before(async function () {
    [owner,client1, PROPOSERS1,creator, PROPOSERS2, PROPOSERS3, EXECUTORS1, EXECUTORS2, EXECUTORS3,freelancer1,freelancer2,freelancer3] = await ethers.getSigners();
    

    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      mockV3Aggregator = await MockV3Aggregator.deploy(DECIMALS,ETH_USD_PRICE);

    // Deploy Governance Token
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy(mockV3Aggregator.target, 100);
    
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

    // console.log("Balance of PROPOSERS1:", balance.toString());
    // console.log("Balance of PROPOSERS2balance:", PROPOSERS2balance.toString());
    // console.log("Balance of PROPOSERS3balance:", PROPOSERS3balance.toString());

    const EXECUTORS1Balance = await governanceToken.balanceOf(EXECUTORS1.address);
    const EXECUTORS2Balance = await governanceToken.balanceOf(EXECUTORS2.address);
    const EXECUTORS3balance = await governanceToken.balanceOf(EXECUTORS3.address);

    // console.log("Balance of EXECUTORS1Balance:", EXECUTORS1Balance.toString());
    // console.log("Balance of EXECUTORS2Balance:", EXECUTORS2Balance.toString());
    // console.log("Balance of EXECUTORS3balance:", EXECUTORS3balance.toString());
    
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
    freeLanceDAO = await FreeLanceDAO.deploy(mockV3Aggregator, timeLock.target);
 
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
      // console.log("VotingDelayH",VotingDelayH);
      
      expect(VotingDelayH).to.equal(VotingDelay);
    });
    it("Should set correct initial voting delay", async function () {
      const votingPeriodH = await myGovernor.votingPeriod();
      // console.log("votingPeriodH",votingPeriodH);
      expect(votingPeriodH).to.equal(VotingPeriod);
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
console.log("Rating after enrollment:", profile.rating.toString());



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
  //  console.log("appliedFreelancers.length:", appliedFreelancers.length);
   let returnedAddress
    returnedAddress = await freeLanceDAO.connect(creator).selectingFreelancer(1);
  //  console.log("returnedAddress from fucntion in test.:", returnedAddress.address);
 
   const selectedFreelancer =  await freeLanceDAO.getSelectedFreelancer(1)
  // console.log("selectedFreelancer in test:", selectedFreelancer);
  const allfreelancerforAppliedProject =await freeLanceDAO.getFreelancersForProject(1);
  // console.log("allfreelancerforAppliedProject in test:", allfreelancerforAppliedProject);
  // console.log("freelancer1.:", freelancer1.address);
  // console.log("freelancer2.:", freelancer2.address);
  expect(selectedFreelancer).to.be.equal(freelancer1)

})
it("cancel the project", async () => {

  await freeLanceDAO.connect(freelancer3).applyForTheProject(3);
  await freeLanceDAO.connect(freelancer2).applyForTheProject(3);
  // console.log("freelancer3",freelancer3.address);
  // console.log("freelancer2",freelancer2.address);

  await freeLanceDAO.connect(creator).selectingFreelancer(3);

  let appliedFreelancers =  await freeLanceDAO.getFreelancersForProject(3)
  //  console.log("appliedFreelancers.length:", appliedFreelancers.length);

 const selectedFreelancer =  await freeLanceDAO.getSelectedFreelancer(3)
// console.log("selectedFreelancer in test:", selectedFreelancer);

const balanceBefore = await ethers.provider.getBalance(creator.address)
console.log("balanceBefore",balanceBefore);
console.log("from the test creator.address",creator.address);

  const cancelledOrNot = await freeLanceDAO.connect(creator).cancelTheProject(3);
  let PROJECT = await freeLanceDAO.idToProject(3);
  expect(PROJECT.isCanceled).to.equal(true);

  const balanceAfter = await ethers.provider.getBalance(creator.address);
     console.log("balanceAfter",balanceAfter);

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

 it.skip("should withdrawTheProject",async () => {

  const balanceBefore = await ethers.provider.getBalance(creator.address)
  console.log("balanceBefore",balanceBefore);
  console.log("from the test creator.address",creator.address);
  
  
   const createTx = await freeLanceDAO.connect(creator).createProject(
    Project4Name, 
    ProjectType, 
    description2, 
    deadline, 
    amount2, //
    false, //eth
    { value: (ethers.parseEther("5.1")) }
);

const createReceipt = await createTx.wait();

await ethers.provider.send("evm_increaseTime",[7300])

const tx = await freeLanceDAO.connect(creator).withdrawTheProject(4,{ gasLimit: 10000000 });
const receipt = await tx.wait();
console.log("Transaction status:", receipt.status);


// Calculate gas used
const gasUsed = receipt.gasUsed * receipt.gasPrice;



const actualChange = balanceAfter - balanceBefore + gasUsed;
    
console.log("Balance Change (including gas):", actualChange);
console.log("Gas fees paid:", gasUsed);

//   expect(actualChange).to.be.closeTo(
//     ethers.parseEther("3"),
//     ethers.parseEther("0.01") // Allow small deviation
// );

const balanceChange = balanceAfter - balanceBefore;
const totalBalanceChange = balanceChange + gasUsed ;

let PROJECT = await freeLanceDAO.getProjectById(4)
  expect(PROJECT.isCanceled).to.be.equal(true)

console.log("Total Balance Change (including gas):", totalBalanceChange);
console.log("Gas fees paid:", gasUsed);
console.log("project.creatorOrOwner:", PROJECT.creatorOrOwner);
console.log("creator.address:", creator.address);


  

 })

   })

   describe('TESTING GOVERNANCE CONTRACT NOT TOKEN', () => { 
    it("checking timeLock address",async ()=>{
      // console.log("timeLock.target",timeLock.target);
      // console.log("myGovernor.target",myGovernor.target);

    const timeLocksAddress =  await myGovernor.timelock()
    expect(timeLocksAddress).to.be.equal(timeLock.target)
    })

    it("executor should be timelock", async()=> {
      const executor  = await myGovernor.getExecutor()
      expect(executor).to.be.equal(timeLock.target)
    })
    
    it("checking name for governance ",async ()=>{
      const name =  await myGovernor.name()
      expect(name).to.be.equal("FreelanceGovernance")
     
      })

      it("checking votingDelay for governance ",async ()=>{
        const votingDelay =  await myGovernor.votingDelay()
        expect(votingDelay).to.be.equal(VotingDelay)
        // console.log("votingDelay",votingDelay);
        
        })
        it("checking votingPeriod for governance ",async ()=>{
          const votingPeriod =  await myGovernor.votingPeriod()
          expect(votingPeriod).to.be.equal(VotingPeriod)
          // console.log("VotingPeriod",VotingPeriod);
          })

        

      









    //TESTING GOVERNANCE CONTRACT NOT TOKEN
    })


});



