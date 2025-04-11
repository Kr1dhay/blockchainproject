// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "LuxuryWatchNFT.sol";

contract StolenWatchesRegistry {
    mapping(uint256 => bool) private stolenTokens;

    event TokenFlaggedAsStolen(uint256 tokenId, address flaggedBy);

    modifier onlyOwner(uint256 tokenId) {
        require(
            msg.sender == ownerOf(tokenId),
            "Only the owner of the token can call this function"
        );
        _;
    }

    constructor() {}

    function flagAsStolen(uint256 tokenId) external onlyOwner(tokenId) {
        stolenTokens[tokenId] = true;
        emit TokenFlaggedAsStolen(tokenId, msg.sender);
    }

    function unflagAsStolen(uint256 tokenId) external onlyOwner(tokenId) {
        stolenTokens[tokenId] = false;
    }

    function isStolen(uint256 tokenId) external view returns (bool) {
        return stolenTokens[tokenId];
    }

    function setTokenOwner(uint256 tokenId, address owner) external {
        require(msg.sender == admin, "Only admin can set token owner");
        tokenOwners[tokenId] = owner;
    }
}