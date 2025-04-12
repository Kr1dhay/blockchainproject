// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LuxuryWatchNFT.sol";

contract StolenWatchesRegistry {
    mapping(uint256 => bool) private stolenTokens;
    address public contractOwner;
    LuxuryWatchNFT public luxuryWatchNFT;

    event TokenFlaggedAsStolen(string serialID, address flaggedBy);

    constructor(address luxuryWatchNFTAddress) {
        contractOwner = msg.sender;
        luxuryWatchNFT = LuxuryWatchNFT(luxuryWatchNFTAddress);
    }

    modifier onlyOwner(string memory serialID) {
        require(luxuryWatchNFT.ownerOfToken(serialID) == msg.sender, "Only the owner of the token can call this function");
        _;
    }

    function flagAsStolen(string memory serialID) external onlyOwner(serialID) {
        uint256 tokenId = luxuryWatchNFT.getTokenFromSerialID(serialID);

        require(!stolenTokens[tokenId], "Token is already flagged as stolen");
        stolenTokens[tokenId] = true;
        emit TokenFlaggedAsStolen(serialID, msg.sender);
    }

    function unflagAsStolen(string memory serialID) external onlyOwner(serialID) {
        uint256 tokenId = luxuryWatchNFT.getTokenFromSerialID(serialID);

        require(stolenTokens[tokenId], "Token is already flagged as not stolen");
        stolenTokens[tokenId] = false;
    }

    function isStolen(string memory serialID) external view returns (bool) {
        uint256 tokenId = luxuryWatchNFT.getTokenFromSerialID(serialID);
        return stolenTokens[tokenId];
    }
}