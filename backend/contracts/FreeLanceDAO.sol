// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
// import "hardhat/console.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


contract FreeLanceDAO {
  address[] public freelancers;
  address[] public clients;
  address public daoGovernance;
  uint256 totalProjects;
  Project[] public projects;
  uint256 public totalPlatformFees;
  AggregatorV3Interface public priceFeed;
  uint256 platformFee = 2;
  uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
 uint256 public PRECISION = 1e18;
  uint256 public constant PERCENT = 100;

//price feed kuda add chesi, freelancers enroll avvadaaniki enni dollars oo kuda chudaali

  mapping (address => uint) ownerToProjectId;
  mapping (uint256 => Project) public idToProject;
 mapping (uint =>  bool) isProjectPickedByAnyFreelancer; 
 mapping (uint => address[]) freelancersApplaiedforProject;
 mapping (uint => mapping (address => bool)) hasFreelancerApplied;   
 mapping (uint => bool) isProjectSelected;
 mapping(address => uint256) public freelancerRatings; // Store freelancer ratings
 mapping (uint => address)  idToselectedFreelancer;
 mapping (address => FreelancerProfile) freelancerProfiles;
 mapping (uint => bool) disputes;


  struct Project {
    uint256 projectId;
    address creatorOrOwner;
     string name;
     string projectType;
     string description;
     uint256 deadline;
     uint256 amount;
     bool isPaidToContract; 
     bool isPaidToFreelancer;
     bool isCanceled;
     bool completed;

  }

  struct FreelancerProfile {
     string name;
     string skills;
     string  bio;
  }


  modifier onlyGovernance() {
    require(msg.sender == daoGovernance, "Caller is not the governance contract");
    _;
}
             // need improve the getters
    constructor(AggregatorV3Interface _pricefeed, address _governanceContract) {
      priceFeed = _pricefeed;
      require(_governanceContract != address(0), "Invalid governance contract address");
      daoGovernance = _governanceContract;
    }

   
    function enrollFreelancer() public {
      for (uint i = 0; i < freelancers.length; i++) {
          require(freelancers[i] != msg.sender, "Freelancer already enrolled");
      }
      freelancers.push(msg.sender);
  }
  
    function updateGovernance(address newGovernanceContract) public onlyGovernance {
      require(newGovernanceContract != address(0), "Invalid governance contract address");
      daoGovernance = newGovernanceContract;
  }

    function enrollClient() public  {
        clients.push(msg.sender);
    }

    function createProject(string memory _name,
        string memory _projectType,
        string memory _description,
        uint256  _deadline,
        uint256 _amount,
        bool isUsd
   ) public payable {
        require(bytes(_name).length !=0,"Project name cannot be empty");
        require(bytes(_projectType).length !=0,"Project tye cannot be empty");
        require(bytes(_description).length !=0,"Project description cannot be empty");
        require( _deadline!=0,"Project _deadline cannot be empty");
        uint256 fee;
        uint256 totalAmount;
        if (isUsd) {
          require(_amount > 1000,"Project amount cannot be empty");

          uint256 ethEquivalent = price(_amount);

          // Calculate fee in ETH
          fee = (ethEquivalent * platformFee) / PERCENT;

          // Calculate total required ETH
          totalAmount = ethEquivalent + fee;
          require(msg.value >= ethEquivalent + fee ,"insufficient ETH for fee");
        }
        else {
          fee = (_amount * platformFee) / PERCENT;

          // Calculate total required ETH (including the fee)
          totalAmount = _amount + fee;
  
          // Ensure enough ETH is sent
          require(msg.value >= totalAmount, "Insufficient ETH for project and fee");
  
          // Update platform fees
          totalPlatformFees += fee;
        }
         
         totalProjects++;
       
      Project memory project = Project({
             projectId: totalProjects,
             creatorOrOwner: payable(msg.sender),
              name: _name,
              projectType: _projectType,
             description: _description,
                deadline:   _deadline,
                amount:      _amount,
             isPaidToContract: true, 
              isPaidToFreelancer: false,
              isCanceled:false,
              completed:false
        });
         projects.push(project);
          idToProject[totalProjects] = project;
          isProjectPickedByAnyFreelancer[totalProjects] = false;

    }

    function price(uint usdAmountInWei) public view returns (uint) {
                   
      
      (,int256 answer,,,)= priceFeed.latestRoundData();

      // Cache the scaled price to avoid repeating the same calculation
    uint256 scaledAnswer = uint256(answer) * ADDITIONAL_FEED_PRECISION;
      
           uint256 ethEquivalent =(usdAmountInWei * PRECISION) / scaledAnswer;

         return ethEquivalent;
    }
    
    function applyForTheProject(uint256 projectId) public returns (bool) {
        Project memory project = idToProject[projectId] ;
        require(projectId < totalProjects, "Invalid project ID");
        require(projectId > 0 && projectId < totalProjects, "Invalid project ID");
        require(block.timestamp < project.deadline, "Deadline has passed");
        require(!isProjectPickedByAnyFreelancer[projectId], "project is picked by freelancer");
        require(!project.completed, "project is completed");
        require(!project.isPaidToFreelancer, "project is paid to freelancer");
        //check to prevent duplicate applications
        require(!hasFreelancerApplied[projectId][msg.sender], "You have already applied for this project");
        freelancersApplaiedforProject[projectId].push(msg.sender);

        return true;
    }

    function selectingFreelancer(uint256 projectId) public {
      Project storage project = idToProject[projectId] ;
      require(project.creatorOrOwner == msg.sender, "only project owner can call this");
      require(freelancersApplaiedforProject[projectId].length > 0 , "no freelancers registered for the project");
      require(!isProjectSelected[projectId], "Project already has a selected freelancer");
       uint256 highestRating = 0;
       address  selectedFreelancer;
       for (uint256 i = 0; i < freelancersApplaiedforProject[projectId].length; i++) {
            address freelancer = freelancersApplaiedforProject[projectId][i];
            uint256 rating = freelancerRatings[freelancer];
            if (rating > highestRating) {
               highestRating = rating;
                 selectedFreelancer = freelancer;
            }
         }

       idToselectedFreelancer[projectId] = selectedFreelancer;
      //last
      isProjectSelected[projectId] = true;
      isProjectPickedByAnyFreelancer[projectId] = true;


    }
    
   
    function cancelTheProject(uint256 projectId) public returns (bool) {
        Project storage project = idToProject[projectId] ;
        require(project.creatorOrOwner == msg.sender, "only project owner can call this");
        require(projectId > 0 && projectId < totalProjects, "Invalid project ID");
        require(block.timestamp < project.deadline, "Deadline has passed");
        require(!isProjectSelected[projectId], "project is selected so not able to cancel project");
        require(!project.isCanceled, "project is already cancelled");
        require(!isProjectPickedByAnyFreelancer[projectId], "project is picked by freelancer");

        project.isCanceled = true;
        (bool success, ) = payable(project.creatorOrOwner).call{value: project.amount}("");
        require(success, "Refund failed");

        return true;
      
    }
   

    function submitTheProject(uint256 projectId) public{
      Project storage project = idToProject[projectId];
      require(idToselectedFreelancer[projectId] == msg.sender, "you are not the selected freelancer ");
      require(!project.completed, "Project is already completed");
      require(!project.isCanceled, "Cannot submit a canceled project");
      require(block.timestamp < project.deadline, "Deadline has passed");

  
      project.completed = true;
    }
    function withdraw(uint256 projectId) public {
      Project storage project = idToProject[projectId] ;
      require(block.timestamp > project.deadline, "Deadline has not passed");
      require(project.creatorOrOwner == msg.sender, "only project owner can call this");
      require(!project.completed, "project is not completed");     
      require(!project.isCanceled, "Project is already canceled");
      require(!isProjectPickedByAnyFreelancer[projectId], "Freelancer has already picked this project");
      

      project.isCanceled = true;

      (bool success, ) = payable(project.creatorOrOwner).call{value:project.amount}("");
      require(success,"payment cancelled");

    }

 
function setPlatformFee(uint256 newFee) public onlyGovernance //onlyOwner
 {
    platformFee = newFee;
}

function rateFreelancer(uint256 projectId,uint256 rating) public {
  Project memory project = idToProject[projectId] ;
  require(project.creatorOrOwner == msg.sender, "only project owner can call this");
  require(project.completed, "project not completed");
  require(projectId > 0 && projectId < totalProjects, "Invalid project ID");
  require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");

  address freelancer = idToselectedFreelancer[projectId];

  freelancerRatings[freelancer] += rating;
}

function extendDeadline(uint256 projectId,uint256 newDeadline) public {
  Project storage project = idToProject[projectId] ;
  require(project.creatorOrOwner == msg.sender, "only project owner can call this");
  require(!project.completed, "project not completed");
  require(newDeadline > project.deadline, "New deadline must be later than the current one");
  project.deadline= newDeadline;

}

function updatefreelancerProfile(string memory name, string memory bio, string memory skills) public returns (bool) {
  freelancerProfiles[msg.sender] = FreelancerProfile({
            name: name,
            bio: bio,
            skills: skills
        });

        return true;
    }
    function raiseDisputes(uint256 projectId) public {
      Project memory project = idToProject[projectId] ;
      require(project.creatorOrOwner == msg.sender, "only project owner can call this");
      require(project.completed, "project is not completed");     
      require(!disputes[projectId], "Dispute already raised for this project");
      require(!project.isCanceled, "Cannot dispute a canceled project");   
      disputes[projectId] = true;

    }

    function resolveDispute(uint256 projectId) public {
      require(idToselectedFreelancer[projectId] == msg.sender, "you are not the selected freelancer ");
      require(disputes[projectId], "No dispute raised for this project");

      disputes[projectId] = false;
    }

    function validateTheProject(uint256 projectId) public {
        Project storage project = idToProject[projectId] ;
        require(project.creatorOrOwner == msg.sender, "only project owner can call this");
        require(project.completed, "project is not completed");
        require(!project.isPaidToFreelancer, "Freelancer has already been paid");
        require(!disputes[projectId],"have disputes");
        // Mark payment as completed
        project.isPaidToFreelancer = true;
        address freelancer = idToselectedFreelancer[projectId];
        (bool success, ) = payable(freelancer).call{value: project.amount}("");
          require(success, "Payment to freelancer failed");
    }

    function withdraw() public {
      uint256 totalContractBalance = address(this).balance;
      require(msg.sender == daoGovernance, "Only DAO governance can withdraw");
      
      (bool success, ) = payable(daoGovernance).call{value: totalContractBalance}("");
      require(success, "Withdrawal failed");
  }


  function toGiveAfundInUsd(uint256 amount, bool IsUsd)  public payable {
         if (IsUsd) {
          (,int256 price,,,)= priceFeed.latestRoundData();
          
          uint256 amountToPay = (amount * PRECISION) / (uint256(price) * ADDITIONAL_FEED_PRECISION);

          require(msg.value >= amountToPay , "need to pay this amount");   
         }
         else {
          toGiveAfundInEther(amount);
         }
  }
    
   function toGiveAfundInEther(uint256 amount) payable public {
          require(msg.value >= amount , "need to pay this amount");

         }

   receive() external payable {
         
   }

       // Getter to retrieve the total number of projects
       function getTotalProjects() public view returns (uint256) {
        return totalProjects;
    }

    // Getter to retrieve all freelancers
    function getFreelancers() public view returns (address[] memory) {
        return freelancers;
    }

    // Getter to retrieve all clients
    function getClients() public view returns (address[] memory) {
        return clients;
    }

    // Getter to retrieve platform fee
    function getPlatformFee() public view returns (uint256) {
        return platformFee;
    }

    // Getter to retrieve DAO governance address
    function getGovernanceAddress() public view returns (address) {
        return daoGovernance;
    }

    // Getter to retrieve all projects
    function getProjects() public view returns (Project[] memory) {
        return projects;
    }

    // Getter to retrieve details of a project by its ID
    function getProjectById(uint256 projectId) public view returns (Project memory) {
        require(projectId < totalProjects, "Invalid project ID");
        return idToProject[projectId];
    }

    // Getter to check if a project is picked by any freelancer
    function isProjectPicked(uint256 projectId) public view returns (bool) {
        require(projectId < totalProjects, "Invalid project ID");
        return isProjectPickedByAnyFreelancer[projectId];
    }

    // Getter to retrieve the list of freelancers who applied for a project
    function getFreelancersForProject(uint256 projectId) public view returns (address[] memory) {
        require(projectId < totalProjects, "Invalid project ID");
        return freelancersApplaiedforProject[projectId];
    }

    // Getter to check if a freelancer has applied for a specific project
    function hasFreelancerAppliedForProject(uint256 projectId, address freelancer) public view returns (bool) {
        require(projectId < totalProjects, "Invalid project ID");
        return hasFreelancerApplied[projectId][freelancer];
    }


        // Getter to check if a project is selected
        function isProjectSelectedByOwner(uint256 projectId) public view returns (bool) {
          require(projectId < totalProjects, "Invalid project ID");
          return isProjectSelected[projectId];
      }
  
      // Getter to retrieve the selected freelancer for a specific project
      function getSelectedFreelancer(uint256 projectId) public view returns (address) {
          require(projectId < totalProjects, "Invalid project ID");
          return idToselectedFreelancer[projectId];
      }
  
      // Getter to retrieve the rating of a freelancer
      function getFreelancerRating(address freelancer) public view returns (uint256) {
          return freelancerRatings[freelancer];
      }
  
      // Getter to retrieve the profile of a freelancer
      function getFreelancerProfile(address freelancer) public view returns (FreelancerProfile memory) {
          return freelancerProfiles[freelancer];
      }
  
      // Getter to check if a project has a dispute
      function hasDispute(uint256 projectId) public view returns (bool) {
          require(projectId < totalProjects, "Invalid project ID");
          return disputes[projectId];
      }
  
      // Getter to retrieve the total platform fees collected
      function getTotalPlatformFees() public view returns (uint256) {
          return totalPlatformFees;
      }
  
      // Getter to retrieve the ETH equivalent of a USD amount
      function getEthEquivalent(uint256 usdAmountInWei) public view returns (uint256) {
          return price(usdAmountInWei);
      }
  
      // Getter to check if a project is completed
      function isProjectCompleted(uint256 projectId) public view returns (bool) {
          require(projectId < totalProjects, "Invalid project ID");
          return idToProject[projectId].completed;
      }
  
      // Getter to check if a project is canceled
      function isProjectCanceled(uint256 projectId) public view returns (bool) {
          require(projectId < totalProjects, "Invalid project ID");
          return idToProject[projectId].isCanceled;
      }
  
      // Getter to retrieve the Chainlink price feed address
      function getPriceFeedAddress() public view returns (AggregatorV3Interface) {
          return priceFeed;
      }

      function getFreelancerCount() public view returns (uint256) {
        return freelancers.length;
    }
  
}

