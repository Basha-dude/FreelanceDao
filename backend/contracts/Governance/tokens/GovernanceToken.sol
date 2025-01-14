// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import  "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";



contract GovernanceToken is ERC20Votes {
     uint256 TOKEN_PRICE = 1 ether;
     AggregatorV3Interface public priceFeed;
     uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
     uint256 public PRECISION = 1e18;



    constructor(AggregatorV3Interface _pricefeed,uint256 _intialSupply) ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken") {
        priceFeed = _pricefeed;
        _mint(msg.sender, _intialSupply);
    }


    /* 
    here using of isUsd = true , will have precision and reducing 
    
    
    */
   function mint(uint256 _amount,bool isUsd) public payable {
    if (isUsd) {
              (,int256 price,,,)= priceFeed.latestRoundData(); 

              console.log("(_amount * PRECISION)", (_amount * PRECISION));

              console.log("uint256(price) * ADDITIONAL_FEED_PRECISION",uint256(price) * ADDITIONAL_FEED_PRECISION);
                                           //3000 * 1e18 / 300_000_000_000 * 1000_000_000_0                       
              uint256 ethAmount =  (_amount * PRECISION * PRECISION) / (uint256(price) * ADDITIONAL_FEED_PRECISION); 
              console.log("ethAmount from the contract",ethAmount);
              uint256 tokenPrice = 1;
              console.log("(tokenPrice * PRECISION)",(tokenPrice * PRECISION));
              uint256 amounToMint = ethAmount / (tokenPrice * PRECISION);
              console.log("amounToMint from the contract",amounToMint);
              require(msg.value >= ethAmount, "Insufficient ETH sent or USD"); 
              _mint(msg.sender, amounToMint);

    } else {
        require(msg.value >= _amount * TOKEN_PRICE , "Insufficient ETH sent");
        uint256 amounToMint = _amount;
        _mint(msg.sender, amounToMint);
        
    }
           
   }


    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }

    function _mint(address account, uint256 amount) internal override(ERC20Votes) {
        super._mint(account, amount);
    }

    function getToken_Price() public view returns(uint256){
         return TOKEN_PRICE;
    }

    
}



