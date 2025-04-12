// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "./LuxuryWatchNFT.sol";

// contract StolenWatchesRegistry {
//     mapping(uint256 => bool) private stolenTokens;
//     address private contractOwner;
//     LuxuryWatchNFT private luxuryWatchNFT;

//     event TokenFlaggedAsStolen(uint256 tokenId, address flaggedBy);

//     constructor(address luxuryWatchNFTAddress) {
//         contractOwner = msg.sender;
//         luxuryWatchNFT = LuxuryWatchNFT(luxuryWatchNFTAddress);
//     }

//     modifier onlyOwner(uint256 tokenId) {
//         require(luxuryWatchNFT.ownerOfToken(tokenId) == msg.sender, "Only the contractOwner of the token can call this function");
//         _;
//     }

//     function flagAsStolen(uint256 tokenId) external onlyOwner(tokenId) {
//         require(!stolenTokens[tokenId], "Token is already flagged as stolen");
//         require(luxuryWatchNFT.isExistingToken(tokenId), "Token does not exist");
//         require(luxuryWatchNFT.ownerOfToken(tokenId) == msg.sender, "Only the contractOwner of the token can flag it as stolen");
//         stolenTokens[tokenId] = true;
//         emit TokenFlaggedAsStolen(tokenId, msg.sender);
//     }

//     function unflagAsStolen(uint256 tokenId) external onlyOwner(tokenId) {
//         require(stolenTokens[tokenId], "Token is already flagged as not stolen");
//         require(luxuryWatchNFT.isExistingToken(tokenId), "Token does not exist");
//         require(luxuryWatchNFT.ownerOfToken(tokenId) == msg.sender, "Only the contractOwner of the token can unflag it as stolen");
//         stolenTokens[tokenId] = false;
//     }

//     function isStolen(uint256 tokenId) external view returns (bool) {
//         return stolenTokens[tokenId];
//     }
// }